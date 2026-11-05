
import { Link } from 'react-router';

function DetailCard({ titre, description, annee, nb_pages, prix, stock, auteur_nom, auteur_prenom, categorie_nom }) {
    return (
        <article className="livre-card">
            <h2 className="livre-card__title">titre :{titre} parution :{annee}</h2>
            <p className="livre-card_description">{description}</p>
            <p className="livre-card_pages">{nb_pages} pages</p>
            <p className="livre-card_price">{prix} $</p>
            <p className="livre-card_stock">{stock} exemplaires</p>
            <p className="livre-card_auteur_id">auteur :{auteur_prenom} {auteur_nom}</p>
            <p className="livre-card_categorie_id">genre :{categorie_nom}</p>
        </article>
    );
}
export default DetailCard;
