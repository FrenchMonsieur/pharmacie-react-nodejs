
import { useEffect, useState } from 'react';

import './Medicaments.css';

import MedicamentCard from '../components/MedicamentCard.jsx';

function Medicaments() {
    const [medicaments, setMedicaments] = useState([]);
    const [categorie, setCategorie] = useState("");
    const [prix, setPrix] = useState("");
    const [nom, setNom] = useState("");
    const [tri, setTri] = useState("");
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [page_number, setPage_number] = useState(1);
    const [chargementMedicament, setChargementMedicament] = useState(true);
    const [chargementCategorie, setChargementCategorie] = useState(true);
    const [erreur, setErreur] = useState('');
    const [moyenne, setMoyenne] = useState(null);

    useEffect(() => {

        const controller = new AbortController();
        const timer = setTimeout(() => {
            async function chargerMedicaments() {
                try {
                    setChargementMedicament(true);
                    setErreur('');
                    const reponse = await fetch(`http://localhost:3000/api/medicament?categorie=${categorie}&prix=${prix}&nom=${nom}&tri=${tri}&page=${page}`, {
                        signal: controller.signal
                    });

                    if (!reponse.ok) {
                        throw new Error(`Erreur HTTP ${reponse.status}`);
                    }

                    const donnees = await reponse.json();

                    setMedicaments(donnees.medicamentspage);
                    setPage_number(donnees.page_number);
                    setMoyenne(donnees.moyenne);
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        setMedicaments([]);

                        console.error(err);

                        if (err.message === 'Erreur HTTP 429') {
                            setErreur('Trop de requêtes. Réessayez plus tard.');
                        } else {
                            setErreur('Impossible de charger les médicaments.');
                        }
                    }
                } finally {
                    if (!controller.signal.aborted) {
                        setChargementMedicament(false);
                    }
                }
            }
            chargerMedicaments();
        }, 500);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [categorie, prix, nom, tri, page]);

    useEffect(() => {
        async function chargerCategorie() {
            try {
                const reponse = await fetch('http://localhost:3000/api/categories');
                if (!reponse.ok) {
                    throw new Error(`Erreur HTTP ${reponse.status}`);
                }

                const donnees = await reponse.json();

                setCategories(donnees);
            } catch (err) {
                console.error(err);

                setErreur('Impossible de charger la categorie.');
            } finally {
                setChargementCategorie(false);
            }
        }
        chargerCategorie();
    }, []);

    if (chargementCategorie) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Nos médicaments</h1>
                <p>Chargement des médicaments...</p>
            </section>
        );
    }

    return (
        <section className="library-page">
            <h1 className="library-page__title">Nos médicaments</h1>

            <select onChange={(e) => {
                setCategorie(e.target.value);
                setPage(1);
            }} value={categorie}>
                <option value="">Toutes les catégories</option>
                {categories.map((categorie) => (
                    <option key={categorie.id_cat} value={categorie.id_cat}>
                        {categorie.nom}
                    </option>
                ))}
            </select>

            <select onChange={(e) => {
                setTri(e.target.value);
                setPage(1);
            }} value={tri}>
                <option value="">Toutes les tries</option>
                <option value="nom">Nom</option>
                <option value="prix">Prix</option>
            </select>

            {erreur && <p>{erreur}</p>}

            <input type="number" onChange={(e) => {
                setPrix(e.target.value);
                setPage(1);
            }} value={prix} placeholder="Entrer un prix max" />

            {categorie !== "" && moyenne && (
                <div className="stat">
                    <p>{moyenne.nombre_medicaments}</p>
                    <p>{moyenne.prix_moyen} € HT</p>
                </div>
            )}

            <input type="search" onChange={(e) => {
                setNom(e.target.value);
                setPage(1);
            }} value={nom} maxLength={100} placeholder="Entrer un nom" />

            <div className="library-page__list">
                {chargementMedicament ? <section className="library-page">
                    <h1 className="library-page__title">Nos médicaments</h1>
                    <p>Chargement des médicaments...</p>
                </section> :
                    medicaments.length === 0 && !erreur ? <p>Aucun médicament ne correspond</p> :
                        medicaments.map((medicament) => (
                            <MedicamentCard
                                key={medicament.id_med}
                                id_med={medicament.id_med}
                                nom={medicament.nom}
                                dosage={medicament.dosage}
                                forme={medicament.forme}
                                prix_ht={medicament.prix_ht}
                                categorie_nom={medicament.categorie_nom}
                            />
                        ))
                }
            </div>
            {Array.from({ length: page_number }, (_, i) => i + 1)
                .map(numero => (
                    <button key={numero} onClick={() => setPage(numero)}>
                        {numero}
                    </button>
                ))
            }
            {page > 1 && (
                <button onClick={() => setPage(page - 1)}>
                    Précédent
                </button>
            )}
            {page < page_number && (
                <button onClick={() => setPage(page + 1)}>
                    Suivant
                </button>
            )}
        </section>
    );
}


export default Medicaments;
