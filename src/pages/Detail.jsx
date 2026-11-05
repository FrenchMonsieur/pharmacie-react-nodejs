
import { useParams } from 'react-router';

import { useEffect, useState } from 'react';

import './Detail.css';

import DetailCard from '../components/DetailCard.jsx';

function Detail() {
    const [livre, setLivre] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');
    const { id } = useParams();

    useEffect(() => {
        async function chargerLivre() {
            try {
                const reponse = await fetch(`http://localhost:3000/api/livre/${id}`);

                if (!reponse.ok) {
                    throw new Error(`Erreur HTTP ${reponse.status}`);
                }

                const donnees = await reponse.json();

                setLivre(donnees);
            } catch (err) {
                console.error(err);

                setErreur('Impossible de charger le livre.');
            } finally {
                setChargement(false);
            }
        }

        chargerLivre();
    }, [id]);

    if (chargement) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Detail</h1>
                <p>Chargement du livre...</p>
            </section>
        );
    }

    if (erreur) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Detail</h1>
                <p>{erreur}</p>
            </section>
        );
    }

    return (
        <section className="library-page">
            <h1 className="library-page__title">Detail</h1>

            <div className="Detail-livre">
                <DetailCard
                    titre={livre.titre}
                    description={livre.description}
                    annee={livre.annee}
                    nb_pages={livre.nb_pages}
                    prix={livre.prix}
                    stock={livre.stock}
                    auteur_nom={livre.auteur_nom}
                    auteur_prenom={livre.auteur_prenom}
                    categorie_nom={livre.categorie_nom}
                />
            </div>
        </section>
    );
}


export default Detail;