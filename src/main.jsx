import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { ToastContainer } from 'react-toastify';

import './index.css';
import App from './App.jsx';

createRoot(
    document.getElementById('root')
).render(
    <StrictMode>
        <BrowserRouter>
            <App />
            {/* affiche les messages toast.success / toast.error de toute l'application */}
            <ToastContainer />
        </BrowserRouter>
    </StrictMode>
);