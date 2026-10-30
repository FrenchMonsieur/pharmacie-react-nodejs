// Fichier CSS global de l'application
import './App.css';

// Les éléments communs à toutes les pages
import Header from './components/Header.jsx';

// AppRoutes choisit la page à afficher selon l'URL
import AppRoutes from './routes/AppRoutes.jsx';

function App() {
    return (
        // <> et </> forment un conteneur invisible qui regroupe plusieurs éléments
        <>
            {/* En-tête affiché sur toutes les pages */}
            <Header />

            {/* Zone principale : son contenu change selon la page demandée */}
            <main>
                <AppRoutes />
            </main>

            {/* Pied de page affiché sur toutes les pages */}
            {/* Le pied de page est vide pour l'instant, mais il est pratique de le prévoir dès le départ */}
        </>
    );
}

// Rend App utilisable par main.jsx, qui démarre l'application
export default App;