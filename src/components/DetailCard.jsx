function DetailCard({ reference, nom, description, principe_actif, dosage, forme, prix_ht, taux_tva, stock, categorie_nom }) {
    return (
        <article className="medicament-card">
            <h2 className="medicament-card__title">{nom} {dosage}</h2>
            <p className="medicament-card_reference">référence :{reference}</p>
            <p className="medicament-card_description">{description}</p>
            <p className="medicament-card_principe">principe actif :{principe_actif}</p>
            <p className="medicament-card_forme">forme :{forme}</p>
            <p className="medicament-card_price">{prix_ht} € HT (TVA {taux_tva} %)</p>
            <p className="medicament-card_stock">{stock} en stock</p>
            <p className="medicament-card_categorie">catégorie :{categorie_nom}</p>
        </article>
    );
}
export default DetailCard;
