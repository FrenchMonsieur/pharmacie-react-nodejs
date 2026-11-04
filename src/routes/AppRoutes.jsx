import { Routes, Route } from 'react-router';
import Library from '../pages/Library.jsx';
import Detail from '../pages/Detail.jsx';
import Livre from '../pages/Livre.jsx'

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/livres" element={<Livre />} />
            <Route path="/livres/:id" element={<Detail />} />
        </Routes>
    );
}

export default AppRoutes;