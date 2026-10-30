
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import MiniSearch from 'minisearch';
import pool from './db.js';

const app = express();
const port = Number(process.env.API_PORT) || 3000;
const LIVRES_PAR_PAGE = 6;

// Limite à 100 requêtes par minute et par adresse IP.
const limiteur = rateLimit({
    windowMs: 60_000,
    limit: 100,
    statusCode: 429,
    message: { erreur: 'Trop de requêtes. Réessayez plus tard.' }
});

// CORS autorise React à appeler notre API depuis une autre origine.
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://monsite.netlify.app' // À remplacer par la vraie adresse du site.
    ]
}));

app.use(limiteur);
app.use(express.json());

// Route de vérification : http://localhost:3000/
app.get('/', (req, res) => {
    res.json({ message: 'API Bibliothèque opérationnelle' });
});

// Fournit les catégories utilisées dans le menu déroulant React.
app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await pool.execute(
            'SELECT id, nom FROM categorie ORDER BY id'
        );

        return res.json(categories);
    } catch (err) {
        console.error('Erreur lors de la récupération des catégories :', err);
        return res.status(500).json({
            erreur: 'Une erreur interne est survenue.'
        });
    }
});

// Fournit les auteurs utilisés dans le menu déroulant React.
app.get('/api/auteurs', async (req, res) => {
    try {
        const [auteurs] = await pool.execute(
            'SELECT id, nom, prenom, nationalite FROM auteur ORDER BY id'
        );

        return res.json(auteurs);
    } catch (err) {
        console.error('Erreur lors de la récupération des auteurs :', err);
        return res.status(500).json({
            erreur: 'Une erreur interne est survenue.'
        });
    }
});

// GET /api/livre : filtres cumulables, recherche par titre, tri,
// pagination et statistiques sur les résultats filtrés.
app.get('/api/livre', async (req, res) => {

    // Vérifie que les paramètres sont des chaînes avant d'appeler .trim().
    // Un paramètre absent (undefined) reste autorisé.
    if (req.query.categorie !== undefined && typeof req.query.categorie !== 'string') {
        return res.status(400).json({ erreur: 'Catégorie invalide.' });
    }

    if (req.query.auteur !== undefined && typeof req.query.auteur !== 'string') {
        return res.status(400).json({ erreur: 'Auteur invalide.' });
    }

    if (req.query.prix !== undefined && typeof req.query.prix !== 'string') {
        return res.status(400).json({ erreur: 'Prix invalide.' });
    }

    if (req.query.nom !== undefined && typeof req.query.nom !== 'string') {
        return res.status(400).json({ erreur: 'Nom invalide.' });
    }

    if (req.query.tri !== undefined && typeof req.query.tri !== 'string') {
        return res.status(400).json({ erreur: 'Tri invalide.' });
    }

    if (req.query.page !== undefined && typeof req.query.page !== 'string') {
        return res.status(400).json({ erreur: 'Numéro de page invalide.' });
    }

    // trim() supprime les espaces au début et à la fin des valeurs.
    const categorie = req.query.categorie?.trim();
    const auteur = req.query.auteur?.trim();
    const prix = req.query.prix?.trim();
    const nom = req.query.nom?.trim();
    const triDemande = req.query.tri?.trim() ?? '';

    // Le tri n'utilise que des colonnes SQL connues (liste blanche).
    const whitelist = {
        titre: 'livre.titre',
        annee: 'livre.annee',
        prix: 'livre.prix'
    };

    const trie_resultat = Object.hasOwn(whitelist, triDemande)
        ? whitelist[triDemande]
        : 'livre.id';

    // La pagination commence à 1.
    // OFFSET indique combien de livres ignorer avant la page demandée.
    const page = Number(req.query.page ?? 1);

    if (!Number.isSafeInteger(page) || page <= 0) {
        return res.status(400).json({
            erreur: 'Numéro de page invalide.'
        });
    }

    const pagination = (page - 1) * LIVRES_PAR_PAGE;

    if (!Number.isSafeInteger(pagination)) {
        return res.status(400).json({
            erreur: 'Numéro de page trop grand.'
        });
    }

    // Vérification des filtres numériques avant d'interroger MySQL.
    if (
        categorie !== undefined &&
        categorie !== '' &&
        (!Number.isInteger(Number(categorie)) || Number(categorie) <= 0)
    ) {
        return res.status(400).json({
            erreur: 'Catégorie invalide.'
        });
    }

    if (
        auteur !== undefined &&
        auteur !== '' &&
        (!Number.isInteger(Number(auteur)) || Number(auteur) <= 0)
    ) {
        return res.status(400).json({
            erreur: 'Auteur invalide.'
        });
    }

    if (
        prix !== undefined &&
        prix !== '' &&
        (!Number.isFinite(Number(prix)) || Number(prix) < 0)
    ) {
        return res.status(400).json({
            erreur: 'Prix invalide.'
        });
    }

    if (nom?.length > 100) {
        return res.status(400).json({
            erreur: 'Recherche trop longue.'
        });
    }

    // Les trois requêtes partagent les mêmes jointures et les mêmes filtres.
    // WHERE 1=1 permet d'ajouter facilement chaque condition avec AND.

    // Première requête : récupérer les livres avec leurs auteurs et catégories.
    let sql = 'SELECT livre.id, livre.titre, livre.annee, livre.nb_pages, livre.prix, livre.stock, auteur.nom AS auteur_nom, auteur.prenom AS auteur_prenom, categorie.nom AS categorie_nom FROM livre INNER JOIN auteur ON livre.auteur_id = auteur.id INNER JOIN categorie ON livre.categorie_id = categorie.id WHERE 1=1';

    // Deuxième requête : compter les livres filtrés sans pagination.
    let sql_2 = 'SELECT COUNT(*) AS total FROM livre INNER JOIN auteur ON livre.auteur_id = auteur.id INNER JOIN categorie ON livre.categorie_id = categorie.id WHERE 1=1';

    // Troisième requête : compter les livres et calculer leur prix moyen.
    // COUNT(*) compte les livres.
    // AVG(prix) calcule le prix moyen.
    // ROUND(..., 2) arrondit à deux décimales.
    // COALESCE remplace NULL par 0 lorsqu'aucun livre ne correspond.
    let sql_3 = 'SELECT COUNT(*) AS nombre_livres, COALESCE(ROUND(AVG(livre.prix), 2), 0) AS prix_moyen FROM livre INNER JOIN auteur ON livre.auteur_id = auteur.id INNER JOIN categorie ON livre.categorie_id = categorie.id WHERE 1=1';

    // Les ? sont remplacés par ces valeurs via les requêtes préparées.
    const parametres = [];

    // Filtre par catégorie.
    if (categorie !== undefined && categorie !== '') {
        sql += ' AND livre.categorie_id = ?';
        sql_2 += ' AND livre.categorie_id = ?';
        sql_3 += ' AND livre.categorie_id = ?';

        parametres.push(categorie);
    }

    // Filtre par auteur.
    if (auteur !== undefined && auteur !== '') {
        sql += ' AND livre.auteur_id = ?';
        sql_2 += ' AND livre.auteur_id = ?';
        sql_3 += ' AND livre.auteur_id = ?';

        parametres.push(auteur);
    }

    // Filtre par prix maximum.
    if (prix !== undefined && prix !== '') {
        sql += ' AND livre.prix <= ?';
        sql_2 += ' AND livre.prix <= ?';
        sql_3 += ' AND livre.prix <= ?';

        parametres.push(prix);
    }

    // ORDER BY concerne uniquement la liste des livres.
    // Les requêtes COUNT(*) et AVG() n'ont pas besoin de tri.
    sql += ` ORDER BY ${trie_resultat}, livre.titre`;

    // Sans recherche textuelle, MySQL renvoie directement
    // les 6 livres correspondant à la page demandée.
    //
    // Avec recherche, MiniSearch doit recevoir tous les livres
    // déjà filtrés pour effectuer sa recherche correctement.
    if (!nom) {
        sql += ` LIMIT ${LIVRES_PAR_PAGE} OFFSET ${pagination}`;
    }

    try {
        const [resultat] = await pool.execute(sql, parametres);

        // Ces variables seront remplies différemment
        // selon qu'une recherche par titre est active ou non.
        let livrespage;
        let page_number;

        // null signifie qu'aucune statistique n'est à afficher.
        let moyenne = null;

        if (nom) {
            // MiniSearch recherche dans les titres,
            // même si l'utilisateur commet une petite faute.
            const miniSearch = new MiniSearch({
                fields: ['titre'],
                storeFields: [
                    'titre',
                    'annee',
                    'nb_pages',
                    'prix',
                    'stock',
                    'auteur_nom',
                    'auteur_prenom',
                    'categorie_nom'
                ]
            });

            // Ajoute les livres récupérés par MySQL dans l'index MiniSearch.
            miniSearch.addAll(resultat);

            // prefix autorise les recherches incomplètes.
            // fuzzy tolère certaines erreurs de frappe.
            const livresTrouves = miniSearch.search(nom, {
                prefix: true,
                fuzzy: 0.2
            });

            // Sans tri demandé, MiniSearch garde
            // son classement par pertinence.
            if (triDemande === 'prix') {
                livresTrouves.sort((a, b) => {
                    if (a.prix - b.prix === 0) {
                        return a.titre.localeCompare(b.titre, 'fr');
                    }

                    return a.prix - b.prix;
                });

            } else if (triDemande === 'annee') {
                livresTrouves.sort((a, b) => {
                    if (a.annee - b.annee === 0) {
                        return a.titre.localeCompare(b.titre, 'fr');
                    }

                    return a.annee - b.annee;
                });

            } else if (triDemande === 'titre') {
                livresTrouves.sort((a, b) =>
                    a.titre.localeCompare(b.titre, 'fr')
                );
            }

            // Calcule le nombre total de pages à partir
            // de TOUS les livres trouvés par MiniSearch.
            page_number = Math.ceil(
                livresTrouves.length / LIVRES_PAR_PAGE
            );

            // slice() sélectionne uniquement les livres
            // qui doivent apparaître sur la page actuelle.
            livrespage = livresTrouves.slice(
                pagination,
                pagination + LIVRES_PAR_PAGE
            );

            // Statistiques uniquement si une catégorie est sélectionnée.
            // On utilise tous les résultats de MiniSearch,
            // pas uniquement les 6 livres de la page actuelle.
            if (categorie) {

                // length donne le nombre d'objets contenus dans le tableau.
                const nombre_livres = livresTrouves.length;

                // reduce() parcourt chaque livre pour additionner ses prix.
                // somme contient le total calculé au passage précédent.
                // livre représente l'objet actuellement parcouru.
                //
                // Number() évite de concaténer les prix
                // si MySQL les renvoie sous forme de chaînes.
                const totalPrix = livresTrouves.reduce((somme, livre) => {
                    return somme + Number(livre.prix);
                }, 0);

                // On évite une division par zéro
                // lorsqu'aucun livre ne correspond à la recherche.
                let prix_moyen;

                if (nombre_livres > 0) {
                    prix_moyen = Number(
                        (totalPrix / nombre_livres).toFixed(2)
                    );
                } else {
                    prix_moyen = 0;
                }

                // On rassemble les deux statistiques
                // dans un objet qui sera envoyé à React.
                moyenne = {
                    nombre_livres,
                    prix_moyen
                };
            }

        } else {
            // Sans recherche par titre, MySQL compte
            // tous les livres correspondant aux filtres.
            //
            // COUNT(*) ne contient pas LIMIT ni OFFSET :
            // il compte donc tous les livres, pas seulement les 6 affichés.
            const [resultat_total] = await pool.execute(
                sql_2,
                parametres
            );

            page_number = Math.ceil(
                resultat_total[0].total / LIVRES_PAR_PAGE
            );

            // La première requête SQL a déjà appliqué LIMIT et OFFSET.
            livrespage = resultat;

            // Les statistiques SQL sont exécutées seulement
            // lorsqu'une catégorie est sélectionnée.
            if (categorie) {
                const [statistiques] = await pool.execute(
                    sql_3,
                    parametres
                );

                // MySQL renvoie un tableau contenant un objet.
                // [0] récupère le premier objet de ce tableau.
                moyenne = statistiques[0];
            }
        }

        // Le format JSON reste identique dans tous les cas.
        //
        // React récupère :
        // donnees.livrespage
        // donnees.page_number
        // donnees.moyenne
        return res.json({
            livrespage,
            page_number,
            moyenne
        });

    } catch (err) {
        console.error('Erreur lors de la récupération des livres :', err);

        return res.status(500).json({
            erreur: 'Une erreur interne est survenue.'
        });
    }
});

// Détail d'un livre à partir de son identifiant dans l'URL.
app.get('/api/livre/:id', async (req, res) => {
    const id = req.params.id;

    // L'identifiant doit être un entier strictement positif.
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            erreur: 'Identifiant invalide.'
        });
    }

    try {
        const [resultat] = await pool.execute(
            'SELECT livre.id, livre.titre, livre.annee, livre.nb_pages, livre.prix, livre.stock, auteur.nom AS auteur_nom, auteur.prenom AS auteur_prenom, categorie.nom AS categorie_nom FROM livre INNER JOIN auteur ON livre.auteur_id = auteur.id INNER JOIN categorie ON livre.categorie_id = categorie.id WHERE livre.id = ?',
            [id]
        );

        if (resultat.length === 0) {
            return res.status(404).json({
                erreur: 'Livre introuvable.'
            });
        }

        // Une fiche détail contient un seul livre.
        // On renvoie donc le premier objet, pas un tableau.
        return res.json(resultat[0]);

    } catch (err) {
        console.error('Erreur lors de la récupération du livre :', err);

        return res.status(500).json({
            erreur: 'Une erreur interne est survenue.'
        });
    }
});

// Gestion des adresses qui ne correspondent à aucune route.
app.use((req, res) => {
    res.status(404).json({
        erreur: 'Route introuvable.'
    });
});

// Démarrage de l'API.
app.listen(port, () => {
    console.log(`API disponible sur http://localhost:${port}`);
});
