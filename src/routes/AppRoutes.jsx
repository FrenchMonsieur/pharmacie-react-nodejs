import { Routes, Route } from 'react-router';
// Les pages de notre application
import Library from '../pages/Library.jsx';
import Detail from '../pages/Detail.jsx';
import Livre from '../pages/Livre.jsx'

function AppRoutes() {
    return (
        // Routes affiche la page dont l'adresse correspond à l'URL du navigateur
        <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/livres" element={<Livre />} />
            <Route path="/livres/:id" element={<Detail />} />
        </Routes>
    );
}

// Rend ce composant utilisable par App.jsx
export default AppRoutes;