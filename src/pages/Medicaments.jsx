
import { useEffect, useState } from 'react';

import './Livre.css';

import LivreCard from '../components/LivreCard.jsx';

function Livre() {
    const [livres, setLivre] = useState([]);
    const [categorie, setCategorie] = useState("");
    const [auteur, setAuteur] = useState("");
    const [prix, setPrix] = useState("");
    const [nom, setNom] = useState("");
    const [tri, setTri] = useState("");
    const [categories, setCategories] = useState([]);
    const [auteurs, setAuteurs] = useState([]);
    const [page, setPage] = useState(1);
    const [page_number, setPage_number] = useState(1);
    const [chargementLivre, setChargementLivre] = useState(true);
    const [chargementCategorie, setChargementCategorie] = useState(true);
    const [chargementAuteur, setChargementAuteur] = useState(true);
    const [erreur, setErreur] = useState('');
    const [moyenne, setMoyenne] = useState(null);

    useEffect(() => {

        const controller = new AbortController();
        const timer = setTimeout(() => {
            async function chargerLivre() {
                try {
                    setChargementLivre(true);
                    setErreur('');
                    const reponse = await fetch(`http://localhost:3000/api/livre?categorie=${categorie}&auteur=${auteur}&prix=${prix}&nom=${nom}&tri=${tri}&page=${page}`, {
                        signal: controller.signal
                    });

                    if (!reponse.ok) {
                        throw new Error(`Erreur HTTP ${reponse.status}`);
                    }

                    const donnees = await reponse.json();

                    setLivre(donnees.livrespage);
                    setPage_number(donnees.page_number);
                    setMoyenne(donnees.moyenne);
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        setLivre([]);

                        console.error(err);

                        if (err.message === 'Erreur HTTP 429') {
                            setErreur('Trop de requêtes. Réessayez plus tard.');
                        } else {
                            setErreur('Impossible de charger les livres.');
                        }
                    }
                } finally {
                    if (!controller.signal.aborted) {
                        setChargementLivre(false);
                    }
                }
            }
            chargerLivre();
        }, 500);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [categorie, auteur, prix, nom, tri, page]);

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

    useEffect(() => {
        async function chargerAuteur() {
            try {
                const reponse = await fetch('http://localhost:3000/api/auteurs');
                if (!reponse.ok) {
                    throw new Error(`Erreur HTTP ${reponse.status}`);
                }

                const donnees = await reponse.json();

                setAuteurs(donnees);
            } catch (err) {
                console.error(err);

                setErreur('Impossible de charger auteur.');
            } finally {
                setChargementAuteur(false);
            }
        }
        chargerAuteur();
    }, []);

    if (chargementCategorie || chargementAuteur) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Notre bibliothèque</h1>
                <p>Chargement des livres...</p>
            </section>
        );
    }

    return (
        <section className="library-page">
            <h1 className="library-page__title">Notre bibliothèque</h1>

            <select onChange={(e) => {
                setCategorie(e.target.value);
                setPage(1);
            }} value={categorie}>
                <option value="">Toutes les catégories</option>
                {categories.map((categorie) => (
                    <option key={categorie.id} value={categorie.id}>
                        {categorie.nom}
                    </option>
                ))}
            </select>

            <select onChange={(e) => {
                setAuteur(e.target.value);
                setPage(1);
            }} value={auteur}>
                <option value="">Toutes les auteurs</option>
                {auteurs.map((auteur) => (
                    <option key={auteur.id} value={auteur.id}>
                        {auteur.prenom} {auteur.nom}
                    </option>
                ))}
            </select>

            <select onChange={(e) => {
                setTri(e.target.value);
                setPage(1);
            }} value={tri}>
                <option value="">Toutes les tries</option>
                <option value="titre">Titre</option>
                <option value="annee">Année</option>
                <option value="prix">Prix</option>
            </select>

            {erreur && <p>{erreur}</p>}

            <input type="number" onChange={(e) => {
                setPrix(e.target.value);
                setPage(1);
            }} value={prix} placeholder="Entrer un prix max" />

            {categorie !== "" && moyenne && (
                <div className="stat">
                    <p>{moyenne.nombre_livres}</p>
                    <p>{moyenne.prix_moyen} $</p>
                </div>
            )}

            <input type="search" onChange={(e) => {
                setNom(e.target.value);
                setPage(1);
            }} value={nom} maxLength={100} placeholder="Entrer un titre" />

            <div className="library-page__list">
                {chargementLivre ? <section className="library-page">
                    <h1 className="library-page__title">Notre bibliothèque</h1>
                    <p>Chargement des livres...</p>
                </section> :
                    livres.length === 0 && !erreur ? <p>Aucun livre ne correspond</p> :
                        livres.map((livre) => (
                            <LivreCard
                                key={livre.id}
                                id={livre.id}
                                titre={livre.titre}
                                annee={livre.annee}
                                prix={livre.prix}
                                auteur_nom={livre.auteur_nom}
                                auteur_prenom={livre.auteur_prenom}
                                categorie_nom={livre.categorie_nom}
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


export default Livre;