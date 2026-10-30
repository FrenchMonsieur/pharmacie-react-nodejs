// useState conserve les résultats et les filtres ; useEffect synchronise les données avec l'API.
import { useEffect, useState } from 'react';

import './Livre.css';

import LivreCard from '../components/LivreCard.jsx';

function Livre() {
    // Résultats de la recherche actuellement affichés.
    const [livres, setLivre] = useState([]);
    // Critères de recherche : une chaîne vide signifie « pas de filtre ».
    const [categorie, setCategorie] = useState("");
    const [auteur, setAuteur] = useState("");
    const [prix, setPrix] = useState("");
    const [nom, setNom] = useState("");
    const [tri, setTri] = useState("");
    // Données de référence destinées aux deux menus déroulants.
    const [categories, setCategories] = useState([]);
    const [auteurs, setAuteurs] = useState([]);
    // Données de référence destinées a la pagination.
    const [page, setPage] = useState(1);
    const [page_number, setPage_number] = useState(1);
    // Chaque chargement a son propre indicateur pour ne pas mélanger les attentes.
    const [chargementLivre, setChargementLivre] = useState(true);
    const [chargementCategorie, setChargementCategorie] = useState(true);
    const [chargementAuteur, setChargementAuteur] = useState(true);
    // Message commun pour signaler un échec de requête.
    const [erreur, setErreur] = useState('');
    const [moyenne, setMoyenne] = useState(null);

    // Relance la recherche des livres lorsque la catégorie, l'auteur ou le prix change.
    useEffect(() => {

        const controller = new AbortController();
        const timer = setTimeout(() => {
            async function chargerLivre() {
                try {
                    // Nouvelle recherche : signale le chargement et efface une éventuelle ancienne erreur.
                    setChargementLivre(true);
                    setErreur('');
                    // Les paramètres d'URL communiquent les filtres au serveur, y compris les valeurs vides.
                    const reponse = await fetch(`http://localhost:3000/api/livre?categorie=${categorie}&auteur=${auteur}&prix=${prix}&nom=${nom}&tri=${tri}&page=${page}`, {
                        signal: controller.signal
                    });

                    // fetch ne déclenche pas de catch tout seul pour une réponse HTTP 404 ou 500.
                    if (!reponse.ok) {
                        throw new Error(`Erreur HTTP ${reponse.status}`);
                    }

                    // Convertit la réponse JSON en valeurs JavaScript avant de mettre à jour le state.
                    const donnees = await reponse.json();

                    setLivre(donnees.livrespage);
                    setPage_number(donnees.page_number);
                    setMoyenne(donnees.moyenne);
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        // Une requête échouée ne doit pas laisser les anciens livres à l'écran.
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
                        // finally est exécuté après une réussite comme après un échec.
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

    // Charge une seule fois la liste des catégories pour remplir le premier select.
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

    // Charge une seule fois la liste des auteurs pour remplir le second select.
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

    // Attend les données nécessaires aux menus avant de rendre les filtres.
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
            {/* Le choix d'une catégorie modifie le state et relance la recherche des livres. */}

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

            {/* Chaque auteur reçoit son id comme valeur, mais son nom complet est affiché. */}
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

            {/* La saisie du prix modifie le filtre ; une valeur vide signifie « sans limite ». */}
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

            {/* La saisie du nom modifie le filtre ». */}
            <input type="search" onChange={(e) => {
                setNom(e.target.value);
                setPage(1);
            }} value={nom} maxLength={100} placeholder="Entrer un titre" />

            {/* Affiche les résultats, un message de chargement ou l'absence de correspondance. */}
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
                                nb_pages={livre.nb_pages}
                                prix={livre.prix}
                                stock={livre.stock}
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