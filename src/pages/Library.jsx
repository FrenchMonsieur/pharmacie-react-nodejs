// useState mémorise des données, useEffect lance un traitement quand le composant s'affiche
import { useEffect, useState } from 'react';

// Fichier CSS de cette page
import './Library.css';

// Le composant qui affiche la carte d'un produit
import AuthorCard from '../components/AuthorCard.jsx';

function Library() {
    // Liste des auteurs reçus de l'API (vide au départ)
    const [auteurs, setAuteurs] = useState([]);
    // true tant que nous attendons la réponse de l'API
    const [chargement, setChargement] = useState(true);
    // Message d'erreur à afficher si le chargement échoue (vide tant qu'il n'y a pas de problème)
    const [erreur, setErreur] = useState('');

    // Ce traitement est lancé une seule fois, quand la page s'affiche (c'est le rôle du [] à la fin)
    useEffect(() => {
        // Fonction async, car elle utilise await pour attendre les réponses
        async function chargerAuteurs() {
            // try : nous essayons de contacter l'API
            try {
                // Envoie la requête GET à notre API et attend sa réponse
                const reponse = await fetch('http://localhost:3000/api/auteurs');

                // reponse.ok vaut false quand l'API répond par une erreur (404, 500...)
                if (!reponse.ok) {
                    // Provoque une erreur, qui sera interceptée par le bloc catch
                    throw new Error(`Erreur HTTP ${reponse.status}`);
                }

                // Transforme le JSON reçu en tableau JavaScript
                const donnees = await reponse.json();

                // Mémorise les auteurs : React met automatiquement la page à jour
                setAuteurs(donnees);
            } catch (err) {
                // Affiche l'erreur dans la console du navigateur, pour nous aider à la corriger
                console.error(err);

                // Mémorise un message simple à montrer à l'utilisateur
                setErreur('Impossible de charger les auteurs.');
            } finally {
                // finally s'exécute toujours, avec ou sans erreur : le chargement est terminé
                setChargement(false);
            }
        }

        // Lance la fonction que nous venons de définir
        chargerAuteurs();
    }, []);

    // Tant que la réponse n'est pas arrivée, nous affichons seulement un message d'attente
    if (chargement) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Notre bibliothèque</h1>
                <p>Chargement des auteurs...</p>
            </section>
        );
    }

    // Si le chargement a échoué, nous affichons le message d'erreur
    if (erreur) {
        return (
            <section className="library-page">
                <h1 className="library-page__title">Notre bibliothèque</h1>
                <p>{erreur}</p>
            </section>
        );
    }

    // Cas normal : nous affichons la liste des auteurs
    return (
        <section className="library-page">
            {/* Titre de la page */}
            <h1 className="library-page__title">Notre bibliothèque</h1>

            {/* Conteneur des cartes, mis en forme par Library.css */}
            <div className="library-page__list">
                {/* map() parcourt le tableau et crée une carte pour chaque auteur */}
                {auteurs.map((auteur) => (
                    // key : identifiant unique de la carte, nécessaire à React
                    // Les autres propriétés transmettent les données de l'auteur à la carte
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

// Rend la page utilisable par le fichier des routes (AppRoutes.jsx)
export default Library;