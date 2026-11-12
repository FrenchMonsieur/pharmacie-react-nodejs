import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import MiniSearch from 'minisearch';
import pool from './db.js';
import session from 'express-session';
import bcrypt from "bcrypt";

const app = express();
const port = Number(process.env.API_PORT) || 3000;
const MEDICAMENTS_PAR_PAGE = 6;

// on limite les requêtes a 100 par minute pour éviter les abus et protéger le serveur
const limiteur = rateLimit({
    windowMs: 60_000,
    limit: 100,
    statusCode: 429,
    message: { erreur: 'Trop de requêtes. Réessayez plus tard.' }
});

// limiteur réservé à la route de connexion
const limiteurConnexion = rateLimit({
    windowMs: 15 * 60_000,
    limit: 5,
    statusCode: 429,
    skipSuccessfulRequests: true,
    message: { erreur: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' }
});

// tous les app.use() sont exécutés sur chaque requête avant les routes

// sert à ce que le serveur puisse les lire le JSON envoyer par react
app.use(express.json());

// le navigateur refuse les requêtes de plusieurs port donc on utilise cors pour autoriser les requêtes de notre front react et de notre site netlify 
app.use(cors({
    credentials: true,
    origin: [
        'http://localhost:5173',
        'https://monsite.netlify.app' // À remplacer par la vraie adresse du site.
    ]
}));

app.use(limiteur);

app.use(session({
    secret: process.env.SESSION_SECRET, // jamais écrit en clair dans le code
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,       // le JavaScript de la page ne peut pas lire le cookie
        sameSite: 'lax',      // limite l'envoi du cookie depuis un autre site
        secure: false,        // false en local (HTTP) ; true en production (HTTPS)
        maxAge: 30 * 60 * 1000 // durée de vie : 30 minutes
    }
}));

app.post('/api/connexion', limiteurConnexion, async (req, res) => {
    try {
        // req.body ?? {} pour évite de planter si la requête n'a pas de body JSON.
        const { email, mot_de_passe } = req.body ?? {};

        if (typeof email !== 'string' || email.trim() === '' || email.length > 100) {
            return res.status(400).json({ erreur: 'Email invalide.' });
        }
        if (typeof mot_de_passe !== 'string' || mot_de_passe === '') {
            return res.status(400).json({ erreur: 'Mot de passe invalide.' });
        }

        const sql = 'SELECT id_uti, mot_de_passe, role, premiere_connexion FROM utilisateur WHERE email = ? AND actif = 1';
        const [resultats] = await pool.execute(sql, [email.trim()]);

        if (resultats.length === 0) {
            return res.status(401).json({ erreur: 'Email ou mot de passe invalide.' });
        }

        const utilisateur = resultats[0];

        // bcrypt compare le mot de passe envoyé avec le hash stocké en base
        const motDePasseCorrect = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

        if (!motDePasseCorrect) {
            return res.status(401).json({ erreur: 'Email ou mot de passe invalide.' });
        }

        // régénère l'ID de session pour éviter les attaques de fixation de session
        req.session.regenerate((err) => {
            if (err) {
                console.error('Erreur lors de la régénération de la session :', err);
                return res.status(500).json({ erreur: 'Une erreur interne est survenue.' });
            }

            // on ne stocke dans la session que le strict nécessaire (jamais le mot de passe)
            req.session.utilisateur = {
                id_uti: utilisateur.id_uti,
                role: utilisateur.role,
                premiere_connexion: utilisateur.premiere_connexion
            };

            return res.json({ message: 'Connexion réussie', id_uti: utilisateur.id_uti, role: utilisateur.role, premiere_connexion: utilisateur.premiere_connexion });
        });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        return res.status(500).json({ erreur: 'Une erreur interne est survenue.' });
    }
});

async function trouverUtilisateurParId(id_uti) {
    const [resultats] = await pool.execute('SELECT id_uti, nom, email, role, adresse, premiere_connexion FROM utilisateur WHERE id_uti = ? AND actif = 1', [id_uti]);
    return resultats.length > 0 ? resultats[0] : null;
}

// pour ce souvenir de l"utilisateur si il refresh ou autre
app.get('/api/remember-me', async (req, res) => {
    if (!req.session.utilisateur) {
        return res.status(401).json({ erreur: 'Utilisateur non connecté.' });
    }


    try {
        const utilisateur = await trouverUtilisateurParId(req.session.utilisateur.id_uti);

        if (!utilisateur) {
            req.session.destroy();
            return res.status(401).json({ erreur: 'Utilisateur introuvable.' });
        }

        return res.json(utilisateur);
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', err);
        return res.status(500).json({ erreur: 'Une erreur interne est survenue.' });
    }
});

app.get('/api/utilisateur/:id_uti', async (req, res) => {
    const id = req.params.id_uti;

    if (!req.session.utilisateur) {
        return res.status(401).json({ erreur: 'Utilisateur non connecté.' });
    }

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({ erreur: 'Identifiant invalide.' });
    }

    if (req.session.utilisateur.id_uti !== Number(id)) {
        req.session.destroy();
        return res.status(403).json({ erreur: 'Accès refusé.' });
    }


    try {
        const utilisateur = await trouverUtilisateurParId(id);

        if (!utilisateur) {
            return res.status(404).json({ erreur: 'Utilisateur introuvable.' });
        }

        return res.json(utilisateur);
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', err);
        return res.status(500).json({ erreur: 'Une erreur interne est survenue.' });
    }
});

app.post('/api/deconnexion', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ erreur: 'Déconnexion échouée' });
        }
        res.clearCookie('connect.sid', { path: '/' });
        res.json({ message: 'Déconnexion réussie' });
    });
});

app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await pool.execute('SELECT id_cat, nom FROM categorie ORDER BY id_cat');
        return res.json(categories);
    } catch (err) {
        console.error('Erreur lors de la récupération des catégories :', err);
        return res.status(500).json({ erreur: 'Une erreur interne est survenue.' });
    }
});

app.get('/api/medicament', async (req, res) => {

    if (req.query.categorie !== undefined && typeof req.query.categorie !== 'string') {
        return res.status(400).json({ erreur: 'Catégorie invalide.' });
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

    const categorie = req.query.categorie?.trim();
    const prix = req.query.prix?.trim();
    const nom = req.query.nom?.trim();
    const triDemande = req.query.tri?.trim() ?? '';

    // la whitelist limite le tri aux colonnes de la table medicament pour éviter les injections SQL
    const whitelist = { nom: 'medicament.nom', prix: 'medicament.prix_ht' };

    // si le tri demandé n'est pas dans la whitelist, on utilise le tri par défaut
    const trie_resultat = Object.hasOwn(whitelist, triDemande) ? whitelist[triDemande] : 'medicament.id_med';

    // on commencence la pagination à la page 1
    const page = Number(req.query.page ?? 1);

    if (!Number.isSafeInteger(page) || page <= 0) {
        return res.status(400).json({ erreur: 'Numéro de page invalide.' });
    }

    // calcul de l'offset pour la pagination
    const pagination = (page - 1) * MEDICAMENTS_PAR_PAGE;

    // vérifie que l'offset est un nombre entier sûr
    if (!Number.isSafeInteger(pagination)) {
        return res.status(400).json({ erreur: 'Numéro de page trop grand.' });
    }

    if (categorie !== undefined && categorie !== '' && (!Number.isInteger(Number(categorie)) || Number(categorie) <= 0)) {
        return res.status(400).json({ erreur: 'Catégorie invalide.' });
    }

    if (prix !== undefined && prix !== '' && (!Number.isFinite(Number(prix)) || Number(prix) < 0)) {
        return res.status(400).json({ erreur: 'Prix invalide.' });
    }

    if (nom?.length > 100) {
        return res.status(400).json({ erreur: 'Recherche trop longue.' });
    }

    const conditionCatalogue = "WHERE medicament.statut_validation = 'validé' AND medicament.actif = 1";

    // requête SQL pour récupérer les médicaments avec ou sans filtre
    let sql = `SELECT medicament.id_med, medicament.nom, medicament.image, medicament.dosage, medicament.forme, medicament.prix_ht, medicament.taux_tva, medicament.stock, categorie.nom AS categorie_nom FROM medicament INNER JOIN categorie ON medicament.id_cat = categorie.id_cat ${conditionCatalogue}`;

    let sql_2 = `SELECT COUNT(*) AS total FROM medicament INNER JOIN categorie ON medicament.id_cat = categorie.id_cat ${conditionCatalogue}`;

    let sql_3 = `SELECT COUNT(*) AS nombre_medicaments, COALESCE(ROUND(AVG(medicament.prix_ht), 2), 0) AS prix_moyen FROM medicament INNER JOIN categorie ON medicament.id_cat = categorie.id_cat ${conditionCatalogue}`;

    // les paramètres sont stockés dans un tableau vide qui sera rempli en fonction des filtres appliqués
    const parametres = [];

    if (categorie !== undefined && categorie !== '') {
        sql += ' AND medicament.id_cat = ?';
        sql_2 += ' AND medicament.id_cat = ?';
        sql_3 += ' AND medicament.id_cat = ?';
        parametres.push(categorie);
    }

    if (prix !== undefined && prix !== '') {
        sql += ' AND medicament.prix_ht <= ?';
        sql_2 += ' AND medicament.prix_ht <= ?';
        sql_3 += ' AND medicament.prix_ht <= ?';
        parametres.push(prix);
    }

    // on ajoute le tri demandé par l'utilisateur ou le tri par défaut a la requête SQL peut importe si il y a un filtre ou pas
    sql += ` ORDER BY ${trie_resultat}, medicament.nom`;

    if (!nom) {
        sql += ` LIMIT ${MEDICAMENTS_PAR_PAGE} OFFSET ${pagination}`;
    }

    try {
        const [resultat] = await pool.execute(sql, parametres);

        let medicamentspage;
        let page_number;
        let moyenne = null;

        if (nom) {
            const miniSearch = new MiniSearch({
                idField: 'id_med',
                fields: ['nom'],
                storeFields: ['id_med', 'nom', 'image', 'dosage', 'forme', 'prix_ht', 'taux_tva', 'stock', 'categorie_nom']
            });

            miniSearch.addAll(resultat);

            const medicamentsTrouves = miniSearch.search(nom, { prefix: true, fuzzy: 0.2 });

            if (triDemande === 'prix') {
                medicamentsTrouves.sort((a, b) => {
                    if (a.prix_ht - b.prix_ht === 0) {
                        return a.nom.localeCompare(b.nom, 'fr');
                    }
                    return a.prix_ht - b.prix_ht;
                });
            } else if (triDemande === 'nom') {
                medicamentsTrouves.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
            }

            page_number = Math.ceil(medicamentsTrouves.length / MEDICAMENTS_PAR_PAGE);
            medicamentspage = medicamentsTrouves.slice(pagination, pagination + MEDICAMENTS_PAR_PAGE);

            if (categorie) {
                const nombre_medicaments = medicamentsTrouves.length;
                const totalPrix = medicamentsTrouves.reduce((somme, medicament) => somme + Number(medicament.prix_ht), 0);
                const prix_moyen = nombre_medicaments > 0 ? Number((totalPrix / nombre_medicaments).toFixed(2)) : 0;

                moyenne = { nombre_medicaments, prix_moyen };
            }
        } else {
            const [resultat_total] = await pool.execute(sql_2, parametres);

            page_number = Math.ceil(resultat_total[0].total / MEDICAMENTS_PAR_PAGE);
            medicamentspage = resultat;

            if (categorie) {
                const [statistiques] = await pool.execute(sql_3, parametres);
                moyenne = statistiques[0];
            }
        }

        return res.json({ medicamentspage, page_number, moyenne });
    } catch (err) {
        console.error('Erreur lors de la récupération des médicaments :', err);
        return res.status(500).json({ erreur: 'Une erreur interne est survenue.' });
    }
});

app.get('/api/medicament/:id', async (req, res) => {
    const id = req.params.id;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({ erreur: 'Identifiant invalide.' });
    }

    try {
        const [resultat] = await pool.execute("SELECT medicament.id_med, medicament.reference, medicament.nom, medicament.description, medicament.image, medicament.principe_actif, medicament.dosage, medicament.forme, medicament.prix_ht, medicament.taux_tva, medicament.stock, categorie.nom AS categorie_nom FROM medicament INNER JOIN categorie ON medicament.id_cat = categorie.id_cat WHERE medicament.id_med = ? AND medicament.statut_validation = 'validé' AND medicament.actif = 1", [id]);

        if (resultat.length === 0) {
            return res.status(404).json({ erreur: 'Médicament introuvable.' });
        }

        return res.json(resultat[0]);
    } catch (err) {
        console.error('Erreur lors de la récupération du médicament :', err);
        return res.status(500).json({ erreur: 'Une erreur interne est survenue.' });
    }
});

// gestion des routes non trouvées
app.use((req, res) => {
    res.status(404).json({ erreur: 'Route introuvable.' });
});

// pour savoir sur quel port le serveur écoute et que l'API est disponible
app.listen(port, () => {
    console.log(`API disponible sur http://localhost:${port}`);
});
