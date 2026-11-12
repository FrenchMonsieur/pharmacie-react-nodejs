import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const Connexion = () => {
    const [email, setEmail] = useState("");
    const [mot_de_passe, setMotDePasse] = useState("");
    const [erreurs, setErreurs] = useState({});
    const naviguer = useNavigate();

    // Vérifie l'email et le mot de passe avant l'envoi
    const validerFormulaire = () => {
        const erreurs = {};
        if (!email) {
            erreurs.email = "L'email est obligatoire";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            erreurs.email = "Veuillez saisir une adresse email valide";
        }
        if (!mot_de_passe) {
            erreurs.mot_de_passe = "Le mot de passe est obligatoire";
        }
        return erreurs;
    };

    // Gère l'envoi du formulaire
    const gererSoumission = async (e) => {
        e.preventDefault();

        // Vérifie les champs du formulaire
        const erreursValidation = validerFormulaire();
        if (Object.keys(erreursValidation).length > 0) {
            setErreurs(erreursValidation);
            return;
        }

        try {
            const reponse = await fetch("http://localhost:3000/api/connexion", {
                credentials: 'include',
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, mot_de_passe }),
            });
            // avec fetch, il faut lire le JSON de la réponse soi-même
            const donnees = await reponse.json();

            // reponse.ok vaut true si le serveur a répondu avec un code 200 à 299
            if (reponse.ok) {
                naviguer("/medicaments")
                toast.success("Connexion réussie !");
            } else {
                toast.error(donnees.erreur || "Échec de la connexion");
            }
        } catch (erreur) {
            // fetch n'arrive ici que si le serveur est injoignable
            console.error("Erreur pendant la connexion :", erreur);
            toast.error("Une erreur est survenue. Veuillez réessayer plus tard.");
        }
    };




    return (
        <div className="conteneur-connexion">
            <h2>Connexion</h2>
            <form onSubmit={gererSoumission}>
                <div className="groupe-formulaire">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Saisissez votre email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {erreurs.email && <span className="message-erreur">{erreurs.email}</span>}
                </div>
                <div className="groupe-formulaire">
                    <label>Mot de passe</label>
                    <input
                        type="password"
                        name="mot_de_passe"
                        placeholder="Saisissez votre mot de passe"
                        value={mot_de_passe}
                        onChange={(e) => setMotDePasse(e.target.value)}
                    />
                    {erreurs.mot_de_passe && <span className="message-erreur">{erreurs.mot_de_passe}</span>}
                </div>
                <button type="submit" className="bouton-connexion">
                    Se connecter
                </button>
            </form>
        </div>
    );
};

export default Connexion;
