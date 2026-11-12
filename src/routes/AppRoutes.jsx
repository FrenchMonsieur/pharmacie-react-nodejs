import { Routes, Route } from 'react-router';
import Library from '../pages/Library.jsx';
import Detail from '../pages/Detail.jsx';
import Medicaments from '../pages/Medicaments.jsx'
import Connexion from '../pages/Connexion.jsx';
import Profil from '../pages/Profil.jsx';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/medicaments" element={<Medicaments />} />
            <Route path="/medicaments/:id" element={<Detail />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/profil" element={<Profil />} />
        </Routes>
    );
}

export default AppRoutes;
