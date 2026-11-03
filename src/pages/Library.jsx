
import { useEffect, useState } from 'react';

import './Library.css';

import AuthorCard from '../components/AuthorCard.jsx';

function Library() {
    const [auteurs, setAuteurs] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');

    useEffect(() => {
        async function chargerAuteurs() {
            try {
                const reponse = await fetch('http://localhost:3000/api/auteurs');

                if (!reponse.ok) {
                    throw new Error(`Erreur HTTP ${reponse.status}`);
                }

                const donnees = await reponse.json();

                setAuteurs(donnees);
            } catch (err) {
                console.error(err);

                setErreur('Impossible de charger les auteurs.');
            } finally {
                setChargement(false);
            }
        }
        chargerAuteurs();
    }, []);

    if (chargement) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Notre bibliothèque</h1>
                <p>Chargement des auteurs...</p>
            </section>
        );
    }

    if (erreur) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Notre bibliothèque</h1>
                <p>{erreur}</p>
            </section>
        );
    }

    return (
        <section className="library-page">
            <h1 className="library-page__title">Notre bibliothèque</h1>

            <div className="library-page__list">
                {auteurs.map((auteur) => (
                    <AuthorCard
                        key={auteur.id}
                        nom={auteur.nom}
                        prenom={auteur.prenom}
                        nationalite={auteur.nationalite}
                    />
                ))}
            </div>
        </section>
    );
}

export default Library;