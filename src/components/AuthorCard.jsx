// Importe le fichier CSS de ce composant

// Le composant reçoit les informations d'un AuthorCard (ses props), que les accolades { } extraient une à une
function AuthorCard({ nom, prenom, nationalite }) {
    // return : ce que le composant affiche (du JSX)
    return (
        // article : la carte complète d'un auteur
        <article className="author-card">
            {/* Nom du auteur */}
            <h2 className="author-card__title">{nom} {prenom}</h2>
            {/* Nationalité du auteur */}
            <p className="author-card__nationality">{nationalite}</p>
        </article>
    );
}

// Rend le composant utilisable par les autres fichiers (ici Library.jsx)
export default AuthorCard;
