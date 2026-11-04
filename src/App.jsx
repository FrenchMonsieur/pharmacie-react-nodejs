
import './App.css';

import Header from './components/Header.jsx';

import AppRoutes from './routes/AppRoutes.jsx';

function App() {
    return (
        <>
            <Header />

            <main>
                <AppRoutes />
            </main>

        </>
    );
}

export default App;