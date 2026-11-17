import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import './Header.css';

function Header() {
    const [categories, setCategories] = useState([]);
    const naviguer = useNavigate();

    // charge les categories pour le menu
    useEffect(() => {
        async function chargerCategories() {
            try {
                const reponse = await fetch('http://localhost:3000/api/categories', {
                    credentials: 'include'
                });
                if (reponse.ok) {
                    setCategories(await reponse.json());
                }
            } catch (err) {
                console.error(err);
            }
        }
        chargerCategories();
    }, []);

    // envoie la recherche au catalogue
    function rechercher(e) {
        e.preventDefault();
        const texte = e.target.elements.recherche.value;
        naviguer(`/medicaments?nom=${encodeURIComponent(texte)}`);
    }

    // deconnecte l'utilisateur
    async function deconnecter() {
        try {
            const reponse = await fetch('http://localhost:3000/api/deconnexion', {
                method: 'POST',
                credentials: 'include'
            });
            if (reponse.ok) {
                window.location.href = '/connexion';
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <header className="header">
            {/* bandeau du haut */}
            <div className="header__bandeau">
                <span>Une pharmacie à votre écoute, même en ligne.</span>
                <a href="#">Besoin d'un conseil ? ↗</a>
            </div>

            {/* logo, recherche, compte, panier */}
            <div className="header__principal">
                <Link to="/" className="logo">
                    <span className="logo__carre">+</span>
                    <span>
                        <span className="logo__nom">Médi<span>flore</span></span>
                        <span className="logo__sous-titre">Pharmacie & bien-être</span>
                    </span>
                </Link>

                <form className="header__recherche" onSubmit={rechercher}>
                    {/* icone loupe */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="7" />
                        <line x1="16.5" y1="16.5" x2="21" y2="21" />
                    </svg>
                    <input
                        type="search"
                        name="recherche"
                        placeholder="Rechercher un médicament, un produit, une marque…"
                    />
                </form>

                <Link to="/profil" className="header__lien">
                    {/* icone compte */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                    </svg>
                    Mon compte
                </Link>

                <Link to="/panier" className="header__lien header__lien--panier">
                    {/* icone sac */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 8h14l-1 13H6L5 8z" />
                        <path d="M9 8a3 3 0 0 1 6 0" />
                    </svg>
                    Panier
                    {/* compteur, relie au panier plus tard */}
                    <span className="pastille">0</span>
                </Link>

                <button className="header__deconnexion" onClick={deconnecter}>
                    Déconnexion
                </button>
            </div>

            {/* menu des categories */}
            <nav className="header__nav">
                <NavLink to="/medicaments" end>Tous les produits</NavLink>
                {categories.map((categorie) => (
                    <Link key={categorie.id_cat} to={`/medicaments?categorie=${categorie.id_cat}`}>
                        {categorie.nom}
                    </Link>
                ))}
                <a href="#" className="header__conseils">Les conseils du pharmacien</a>
            </nav>
        </header>
    );
}

export default Header;
