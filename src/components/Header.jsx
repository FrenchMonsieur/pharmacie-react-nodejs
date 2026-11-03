
import { Link } from 'react-router';
import './Header.css';

function Header() {
    return (
        <header className="site-header">
            <Link className="site-header__home" to="/">
                Library
            </Link>

            <nav className="site-header__nav">
                <Link className="site-header__link" to="/Livres">
                    Livres
                </Link>

            </nav>
        </header>
    );
}

export default Header;