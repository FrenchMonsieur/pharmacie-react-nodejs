
import { Link } from 'react-router';
import './Header.css';

function Header() {
    return (
        <header className="site-header">
            <Link className="site-header__home" to="/">
                Pharmacie
            </Link>

            <nav className="site-header__nav">
                <Link className="site-header__link" to="/medicaments">
                    Médicaments
                </Link>

                <Link className="site-header__link" to="/connexion">
                    Connexion
                </Link>

                <Link className="site-header__link" to="/profil">
                    Profil
                </Link>

                <button className="site-header__link" onClick={() => {
                    fetch("http://localhost:3000/api/deconnexion", {
                        method: "POST",
                        credentials: "include",
                    })
                        .then((reponse) => {
                            if (reponse.ok) {
                                window.location.href = "/connexion";
                            } else {
                                console.error("Échec de la déconnexion");
                            }
                        })
                        .catch((erreur) => {
                            console.error("Erreur pendant la déconnexion :", erreur);
                        });
                }}>
                    Déconnexion
                </button>
            </nav>
        </header>
    );
}

export default Header;
