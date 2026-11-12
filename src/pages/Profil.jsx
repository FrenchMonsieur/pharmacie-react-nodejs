import { Link } from 'react-router';

import { useEffect, useState } from 'react';

import './Detail.css';

function Profil() {
    const [utilisateur, setUtilisateur] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');
    const [nonConnecte, setNonConnecte] = useState(false);

    useEffect(() => {
        async function chargerProfil() {
            try {
                // la session (cookie) permet au serveur de savoir quel utilisateur est connecté
                const reponse = await fetch('http://localhost:3000/api/remember-me', {
                    credentials: 'include'
                });

                if (reponse.status === 401) {
                    setNonConnecte(true);
                    return;
                }

                if (!reponse.ok) {
                    throw new Error(`Erreur HTTP ${reponse.status}`);
                }

                const donnees = await reponse.json();

                setUtilisateur(donnees);
            } catch (err) {
                console.error(err);

                setErreur('Impossible de charger le profil.');
            } finally {
                setChargement(false);
            }
        }

        chargerProfil();
    }, []);

    if (chargement) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Profil</h1>
                <p>Chargement du profil...</p>
            </section>
        );
    }

    if (nonConnecte) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Profil</h1>
                <p>Vous n'êtes pas connecté.</p>
                <Link to="/connexion">Se connecter</Link>
            </section>
        );
    }

    if (erreur) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Profil</h1>
                <p>{erreur}</p>
            </section>
        );
    }

    return (
        <section className="library-page">
            <h1 className="library-page__title">Profil</h1>

            <div className="profil">
                <p><strong>Nom :</strong> {utilisateur.nom}</p>
                <p><strong>Email :</strong> {utilisateur.email}</p>
                <p><strong>Rôle :</strong> {utilisateur.role}</p>
                <p><strong>Adresse :</strong> {utilisateur.adresse || 'Non renseignée'}</p>
            </div>
        </section>
    );
}

export default Profil;
