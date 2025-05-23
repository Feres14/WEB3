// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
// --- Importer Link pour le lien "Demander un compte" ---
import { useNavigate, Link } from 'react-router-dom';

// URL de base de votre API backend
const API_BASE_URL = 'http://localhost:5000/api';

function LoginPage() {
    // États pour les champs du formulaire et les erreurs/chargement
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Hook pour la redirection

    // Gère la soumission du formulaire
    const handleSubmit = async (event) => {
        event.preventDefault(); // Empêche le rechargement
        setError(null);       // Réinitialise l'erreur
        setLoading(true);     // Active l'indicateur de chargement

        try {
            // Point d'API pour le login
            const loginUrl = `${API_BASE_URL}/auth/login`;
            // Envoi des données au backend
            const response = await axios.post(loginUrl, { username, password, securityAnswer });

            console.log('Login API Response:', response.data);
            setLoading(false); // Arrête le chargement

            // Extraction du token et des infos utilisateur
            // S'assurer que 'role' est bien dans response.data
            const { token, role, ...otherUserInfo } = response.data;
            const userInfo = { role, ...otherUserInfo }; // Reconstruire userInfo pour être sûr

            // Stockage (simple) du token et des infos
            if (token && userInfo && userInfo.role) { // Vérifier que token et userInfo.role existent
                localStorage.setItem('authToken', token);
                localStorage.setItem('userInfo', JSON.stringify(userInfo)); // Stocker toutes les infos user
                console.log('Token et UserInfo stockés dans localStorage. Rôle:', userInfo.role);

                // --- REDIRECTION BASÉE SUR LE RÔLE ---
                if (userInfo.role === 'admin') {
                    console.log("Redirection vers /admin/dashboard");
                    navigate('/admin/dashboard'); // Redirige vers le tableau de bord ADMIN
                } else if (userInfo.role === 'client') {
                    console.log("Redirection vers /dashboard");
                    navigate('/dashboard'); // Redirige vers le tableau de bord CLIENT
                } else {
                    // Cas par défaut si le rôle n'est ni 'admin' ni 'client'
                    console.warn("Rôle utilisateur inconnu après login:", userInfo.role, "Redirection vers la page d'accueil.");
                    navigate('/'); // Redirige vers la page d'accueil
                }
                // --- FIN REDIRECTION ---

            } else {
                 setError('Réponse de connexion invalide (token ou informations utilisateur manquantes).');
                 console.error('Login OK mais token/userInfo/role manquant dans la réponse:', response.data);
            }

        } catch (err) {
            setLoading(false); // Arrête le chargement en cas d'erreur
            console.error('Erreur de login API:', err);
            // Affichage de l'erreur à l'utilisateur
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err.request) {
                 setError('Impossible de contacter le serveur. Vérifiez que le backend est lancé.');
            } else {
                setError('Une erreur inattendue est survenue lors de la connexion.');
            }
        }
    };

    // Rendu JSX du formulaire
    return (
        <div style={styles.container}>
            <h2>Connexion</h2> {/* Titre plus générique, car clients et admins utilisent cette page */}
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label htmlFor="username" style={styles.label}>Nom d'utilisateur:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="password" style={styles.label}>Mot de passe:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="securityAnswer" style={styles.label}>Réponse Sécurité:</label>
                    <input
                        type="password" // Masquer la réponse
                        id="securityAnswer"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        required
                    />
                </div>

                {error && <p style={styles.error}>{error}</p>} {/* Affichage de l'erreur */}

                <button type="submit" disabled={loading}>
                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                </button>
            </form>
            {/* Lien pour demander un compte */}
            <div style={{ marginTop: '20px', fontSize: '0.9em' }}>
                <Link to="/request-account" style={{color: 'var(--bna-green)'}}>
                    Pas encore de compte ? Demandez-en un ici.
                </Link>
            </div>
        </div>
    );
}

// Styles spécifiques à cette page
const styles = {
    container: {
        maxWidth: '450px',
        margin: '50px auto', // Centré horizontalement, marge en haut/bas
        padding: '30px',
        border: '1px solid var(--bna-border-color)',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        backgroundColor: 'var(--bna-white)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
    },
    label: {
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#555'
    },
    error: {
        color: 'var(--bna-error-red)',
        marginTop: '10px',
        fontWeight: 'bold',
        fontSize: '0.9em',
        border: '1px solid var(--bna-error-red)',
        backgroundColor: '#f8d7da',
        padding: '10px',
        borderRadius: '4px',
    }
};

export default LoginPage;