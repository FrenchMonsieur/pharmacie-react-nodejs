
import { Link } from 'react-router';

function MedicamentCard({ id_med, nom, dosage, forme, prix_ht, categorie_nom }) {
    return (
        <article className="medicament-card">
            <h2 className="medicament-card__title">{nom} {dosage}</h2>
            <p className="medicament-card_forme">forme :{forme}</p>
            <p className="medicament-card_price">{prix_ht} € HT</p>
            <p className="medicament-card_categorie">catégorie :{categorie_nom}</p>
            <Link className="detail_link" to={`/medicaments/${id_med}`}>
                Detail
            </Link>
        </article>
    );
}
export default MedicamentCard;
