
import { useParams } from 'react-router';

import { useEffect, useState } from 'react';

import './Detail.css';

import DetailCard from '../components/DetailCard.jsx';

function Detail() {
    const [medicament, setMedicament] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');
    const { id } = useParams();

    useEffect(() => {
        async function chargerMedicament() {
            try {
                const reponse = await fetch(`http://localhost:3000/api/medicament/${id}`, {
                    credentials: 'include'
                });

                if (!reponse.ok) {
                    throw new Error(`Erreur HTTP ${reponse.status}`);
                }

                const donnees = await reponse.json();

                setMedicament(donnees);
            } catch (err) {
                console.error(err);

                setErreur('Impossible de charger le médicament.');
            } finally {
                setChargement(false);
            }
        }

        chargerMedicament();
    }, [id]);

    if (chargement) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Detail</h1>
                <p>Chargement du médicament...</p>
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

            <div className="Detail-medicament">
                <DetailCard
                    reference={medicament.reference}
                    nom={medicament.nom}
                    description={medicament.description}
                    principe_actif={medicament.principe_actif}
                    dosage={medicament.dosage}
                    forme={medicament.forme}
                    prix_ht={medicament.prix_ht}
                    taux_tva={medicament.taux_tva}
                    stock={medicament.stock}
                    categorie_nom={medicament.categorie_nom}
                />
            </div>
        </section>
    );
}


export default Detail;
