// Charge le fichier .env : ses variables deviennent disponibles dans process.env
import 'dotenv/config';
// Importe mysql2 dans sa version « promise », qui permet d'utiliser await
import mysql from 'mysql2/promise';

// Crée le pool de connexions : un petit groupe de connexions MySQL réutilisées par notre serveur
const pool = mysql.createPool({
    // Adresse du serveur MySQL (valeur de DB_HOST dans .env)
    host: process.env.DB_HOST,
    // Port de MySQL, converti en nombre car le fichier .env ne contient que du texte
    port: Number(process.env.DB_PORT),
    // Utilisateur MySQL
    user: process.env.DB_USER,
    // Mot de passe de cet utilisateur
    password: process.env.DB_PASSWORD,
    // Base de données à utiliser
    database: process.env.DB_NAME,
    // Quand toutes les connexions sont occupées, les requêtes suivantes attendent leur tour
    waitForConnections: true,
    // Nombre maximal de connexions ouvertes en même temps
    connectionLimit: 10,
});

// Exporte le pool pour que les autres fichiers (server.js) puissent l'importer
export default pool;