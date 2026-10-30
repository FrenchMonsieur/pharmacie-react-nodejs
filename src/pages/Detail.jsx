//une propriété de l'objet req (requête) qui contient les paramètres de route extraits directement de l'URL
import { useParams } from 'react-router';

import { useEffect, useState } from 'react';

// Fichier CSS de cette page
import './Detail.css';

// Le composant qui affiche la carte d'un produit
import LivreCard from '../components/LivreCard.jsx';

function Detail() {
    // Le livre choisie (null au départ)
    const [livre, setLivre] = useState(null);
    // true tant que nous attendons la réponse de l'API
    const [chargement, setChargement] = useState(true);
    // Message d'erreur à afficher si le chargement échoue (vide tant qu'il n'y a pas de problème)
    const [erreur, setErreur] = useState('');
    // récuperer l'id
    const { id } = useParams();

    useEffect(() => {
        // Fonction async, car elle utilise await pour attendre les réponses
        async function chargerLivre() {
            // try : nous essayons de contacter l'API
            try {
                // Envoie la requête GET à notre API et attend sa réponse
                const reponse = await fetch(`http://localhost:3000/api/livre/${id}`);

                // reponse.ok vaut false quand l'API répond par une erreur (404, 500...)
                if (!reponse.ok) {
                    // Provoque une erreur, qui sera interceptée par le bloc catch
                    throw new Error(`Erreur HTTP ${reponse.status}`);
                }

                // Transforme le JSON reçu en tableau JavaScript
                const donnees = await reponse.json();

                // Mémorise les livres : React met automatiquement la page à jour
                setLivre(donnees);
            } catch (err) {
                // Affiche l'erreur dans la console du navigateur, pour nous aider à la corriger
                console.error(err);

                // Mémorise un message simple à montrer à l'utilisateur
                setErreur('Impossible de charger le livre.');
            } finally {
                // finally s'exécute toujours, avec ou sans erreur : le chargement est terminé
                setChargement(false);
            }
        }

        // Lance la fonction que nous venons de définir
        chargerLivre();
    }, [id]);

    // Tant que la réponse n'est pas arrivée, nous affichons seulement un message d'attente
    if (chargement) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Detail</h1>
                <p>Chargement du livre...</p>
            </section>
        );
    }

    // Si le chargement a échoué, nous affichons le message d'erreur
    if (erreur) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Detail</h1>
                <p>{erreur}</p>
            </section>
        );
    }

    // Cas normal : nous affichons la liste des livres
    return (
        <section className="library-page">
            {/* Titre de la page */}
            <h1 className="library-page__title">Detail</h1>

            {/* Conteneur des cartes, mis en forme par Library.css */}
            <div className="Detail-livre">
                <LivreCard
                    titre={livre.titre}
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


// Rend la page utilisable par le fichier des routes (AppRoutes.jsx)
export default Detail;