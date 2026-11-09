import { Routes, Route } from 'react-router';
import Library from '../pages/Library.jsx';
import Detail from '../pages/Detail.jsx';
import Medicaments from '../pages/Medicaments.jsx'

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/medicaments" element={<Medicaments />} />
            <Route path="/medicaments/:id" element={<Detail />} />
        </Routes>
    );
}

export default AppRoutes;
