
import { useEffect, useState } from 'react';

import './Library.css';

import CategorieCard from '../components/CategorieCard.jsx';

function Library() {
    const [categories, setCategories] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');

    useEffect(() => {
        async function chargerCategories() {
            try {
                const reponse = await fetch('http://localhost:3000/api/categories');

                if (!reponse.ok) {
                    throw new Error(`Erreur HTTP ${reponse.status}`);
                }

                const donnees = await reponse.json();

                setCategories(donnees);
            } catch (err) {
                console.error(err);

                setErreur('Impossible de charger les catégories.');
            } finally {
                setChargement(false);
            }
        }
        chargerCategories();
    }, []);

    if (chargement) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Notre pharmacie</h1>
                <p>Chargement des catégories...</p>
            </section>
        );
    }

    if (erreur) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Notre pharmacie</h1>
                <p>{erreur}</p>
            </section>
        );
    }

    return (
        <section className="library-page">
            <h1 className="library-page__title">Notre pharmacie</h1>

            <div className="library-page__list">
                {categories.map((categorie) => (
                    <CategorieCard
                        key={categorie.id_cat}
                        nom={categorie.nom}
                    />
                ))}
            </div>
        </section>
    );
}

export default Library;
