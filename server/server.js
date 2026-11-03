
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import MiniSearch from 'minisearch';
import pool from './db.js';

const app = express();
const port = Number(process.env.API_PORT) || 3000;
const LIVRES_PAR_PAGE = 6;

// on limite les requêtes a 100 par minute pour éviter les abus et protéger le serveur
const limiteur = rateLimit({
    windowMs: 60_000,
    limit: 100,
    statusCode: 429,
    message: { erreur: 'Trop de requêtes. Réessayez plus tard.' }
});

// tous les app.use() sont exécutés sur chaque requête avant les routes

// a la base le navigateur refuse les requêtes de plusieurs port donc on utilise cors pour autoriser les requêtes de notre front react (port 5173) et de notre site netlify (monsite.netlify.app)
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://monsite.netlify.app' // À remplacer par la vraie adresse du site.
    ]
}));

app.use(limiteur);

// sert à ce que le serveur puisse les lire le JSON envoyer par react
app.use(express.json());

// recupère le nom de chaque catégorie pour le menu déroulant React
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

// recupère le nom de chaque auteur pour le menu déroulant React
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

// GET /api/livre récupère les livres
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

    // la whitelist limite le tri aux colonnes de la table livre pour éviter les injections SQL
    const whitelist = {
        titre: 'livre.titre',
        annee: 'livre.annee',
        prix: 'livre.prix'
    };

    // si le tri demandé n'est pas dans la whitelist, on utilise le tri par défaut
    const trie_resultat = Object.hasOwn(whitelist, triDemande)
        ? whitelist[triDemande]
        : 'livre.id';

    // on commencence la pagination à la page 1 
    const page = Number(req.query.page ?? 1);

    // vérifie que la page demander est un nombre entier positif
    if (!Number.isSafeInteger(page) || page <= 0) {
        return res.status(400).json({
            erreur: 'Numéro de page invalide.'
        });
    }

    // calcul de l'offset pour la pagination
    const pagination = (page - 1) * LIVRES_PAR_PAGE;

    // vérifie que l'offset est un nombre entier sûr
    if (!Number.isSafeInteger(pagination)) {
        return res.status(400).json({
            erreur: 'Numéro de page trop grand.'
        });
    }

    // vérifie les données de la requête pour éviter les injections SQL et les erreurs de type
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

    // requête SQL pour récupérer les livres avec ou sans filtre
    let sql = 'SELECT livre.id, livre.titre, livre.annee, livre.nb_pages, livre.prix, livre.stock, auteur.nom AS auteur_nom, auteur.prenom AS auteur_prenom, categorie.nom AS categorie_nom FROM livre INNER JOIN auteur ON livre.auteur_id = auteur.id INNER JOIN categorie ON livre.categorie_id = categorie.id WHERE 1=1';

    // requête SQL pour compter le nombre total de livres avec ou sans filtre
    let sql_2 = 'SELECT COUNT(*) AS total FROM livre INNER JOIN auteur ON livre.auteur_id = auteur.id INNER JOIN categorie ON livre.categorie_id = categorie.id WHERE 1=1';

    // requête SQL pour calculer le nombre de livres et le prix moyen
    let sql_3 = 'SELECT COUNT(*) AS nombre_livres, COALESCE(ROUND(AVG(livre.prix), 2), 0) AS prix_moyen FROM livre INNER JOIN auteur ON livre.auteur_id = auteur.id INNER JOIN categorie ON livre.categorie_id = categorie.id WHERE 1=1';

    // les paramètres sont stockés dans un tableau vide qui sera rempli en fonction des filtres appliqués
    const parametres = [];

    if (categorie !== undefined && categorie !== '') {
        sql += ' AND livre.categorie_id = ?';
        sql_2 += ' AND livre.categorie_id = ?';
        sql_3 += ' AND livre.categorie_id = ?';

        parametres.push(categorie);
    }

    if (auteur !== undefined && auteur !== '') {
        sql += ' AND livre.auteur_id = ?';
        sql_2 += ' AND livre.auteur_id = ?';
        sql_3 += ' AND livre.auteur_id = ?';

        parametres.push(auteur);
    }

    if (prix !== undefined && prix !== '') {
        sql += ' AND livre.prix <= ?';
        sql_2 += ' AND livre.prix <= ?';
        sql_3 += ' AND livre.prix <= ?';

        parametres.push(prix);
    }

    // on ajoute le tri demandé par l'utilisateur ou le tri par défaut a la requête SQL peut importe si il y a un filtre ou pas
    sql += ` ORDER BY ${trie_resultat}, livre.titre`;

    if (!nom) {
        sql += ` LIMIT ${LIVRES_PAR_PAGE} OFFSET ${pagination}`;
    }

    try {
        const [resultat] = await pool.execute(sql, parametres);

        let livrespage;
        let page_number;

        let moyenne = null;

        if (nom) {
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

            miniSearch.addAll(resultat);

            const livresTrouves = miniSearch.search(nom, {
                prefix: true,
                fuzzy: 0.2
            });

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

            page_number = Math.ceil(
                livresTrouves.length / LIVRES_PAR_PAGE
            );

            livrespage = livresTrouves.slice(
                pagination,
                pagination + LIVRES_PAR_PAGE
            );

            if (categorie) {

                const nombre_livres = livresTrouves.length;

                const totalPrix = livresTrouves.reduce((somme, livre) => {
                    return somme + Number(livre.prix);
                }, 0);

                let prix_moyen;

                if (nombre_livres > 0) {
                    prix_moyen = Number(
                        (totalPrix / nombre_livres).toFixed(2)
                    );
                } else {
                    prix_moyen = 0;
                }

                moyenne = {
                    nombre_livres,
                    prix_moyen
                };
            }

        } else {
            const [resultat_total] = await pool.execute(
                sql_2,
                parametres
            );

            page_number = Math.ceil(
                resultat_total[0].total / LIVRES_PAR_PAGE
            );

            livrespage = resultat;

            if (categorie) {
                const [statistiques] = await pool.execute(
                    sql_3,
                    parametres
                );

                moyenne = statistiques[0];
            }
        }

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

// GET /api/livre/:id récupère un livre par son id pour la page détaillée
app.get('/api/livre/:id', async (req, res) => {
    const id = req.params.id;

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

        return res.json(resultat[0]);

    } catch (err) {
        console.error('Erreur lors de la récupération du livre :', err);

        return res.status(500).json({
            erreur: 'Une erreur interne est survenue.'
        });
    }
});

// gestion des routes non trouvées
app.use((req, res) => {
    res.status(404).json({
        erreur: 'Route introuvable.'
    });
});

// pour savoir sur quel port le serveur écoute et que l'API est disponible
app.listen(port, () => {
    console.log(`API disponible sur http://localhost:${port}`);
});
