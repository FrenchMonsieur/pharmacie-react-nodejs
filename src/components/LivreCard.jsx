// Link crée un lien de navigation qui change de page sans recharger le site (contrairement à une balise <a>)
import { Link } from 'react-router';

// Le composant reçoit les informations d'un AuthorCard (ses props), que les accolades { } extraient une à une
function LivreCard({ titre, annee, nb_pages, prix, stock, auteur_nom, auteur_prenom, categorie_nom, id }) {
    // return : ce que le composant affiche (du JSX)
    return (
        // article : la carte complète d'un auteur
        <article className="livre-card">
            <h2 className="livre-card__title">titre :{titre} parution :{annee}</h2>
            <p className="livre-card_price">{prix} $</p>
            <p className="livre-card_stock">{stock} exemplaires</p>
            <p className="livre-card_pages">{nb_pages} pages</p>
            <p className="livre-card_auteur_id">auteur :{auteur_prenom} {auteur_nom}</p>
            <p className="livre-card_categorie_id">genre :{categorie_nom}</p>
            <Link className="detail_link" to={`/livres/${id}`}>
                Detail
            </Link>
        </article>
    );
}
// Rend le composant utilisable par les autres fichiers (ici Library.jsx)
export default LivreCard;

//titre, annee, nb_pages, prix, stock, auteur_id, categorie_id FROM livre ORDER BY id'