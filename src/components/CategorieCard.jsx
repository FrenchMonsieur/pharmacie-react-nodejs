
function AuthorCard({ nom, prenom, nationalite }) {
    return (
        <article className="author-card">
            <h2 className="author-card__title">{nom} {prenom}</h2>
            <p className="author-card__nationality">{nationalite}</p>
        </article>
    );
}

export default AuthorCard;
