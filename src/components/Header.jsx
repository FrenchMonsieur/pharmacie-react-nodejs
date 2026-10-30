// Link crée un lien de navigation qui change de page sans recharger le site (contrairement à une balise <a>)
import { Link } from 'react-router';
// Fichier CSS du Header
import './Header.css';

function Header() {
    return (
        <header className="site-header">
            {/* Lien vers la page d'accueil : to indique l'adresse de destination */}
            <Link className="site-header__home" to="/">
                Library
            </Link>

            {/* Menu de navigation */}
            <nav className="site-header__nav">
                <Link className="site-header__link" to="/Livres">
                    Livres
                </Link>

            </nav>
        </header>
    );
}

// Rend le Header utilisable par App.jsx
export default Header;