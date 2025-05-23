// src/pages/AccountRequestPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Link pour le bouton retour

const API_BASE_URL = 'http://localhost:5000/api';

const securityQuestions = [
    "--- Choisissez une question ---",
    "Quel est le nom de jeune fille de votre mère ?",
    "Quel était le nom de votre premier animal de compagnie ?",
    "Dans quelle ville vos parents se sont-ils rencontrés ?",
    "Quel est le modèle de votre première voiture ?",
    "Quel est votre plat préféré ?"
];

function AccountRequestPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedQuestion, setSelectedQuestion] = useState(securityQuestions[0]);
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [requestedRole, setRequestedRole] = useState('client'); // 'client' par défaut

    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null); setSuccessMessage(null); setLoading(true);

        if (selectedQuestion === securityQuestions[0]) {
             setError("Veuillez choisir une question de sécurité valide.");
             setLoading(false); return;
        }

        try {
            const requestUrl = `${API_BASE_URL}/requests/account`;
            const response = await axios.post(requestUrl, {
                firstName,
                lastName,
                securityQuestion: selectedQuestion,
                securityAnswer,
                requestedRole // Envoi du rôle sélectionné
            });

            setLoading(false);
            console.log('Réponse de la demande de compte:', response.data);
            setSuccessMessage(response.data.message || "Demande soumise avec succès !");
            // Réinitialiser le formulaire
            setFirstName(''); setLastName(''); setSelectedQuestion(securityQuestions[0]);
            setSecurityAnswer(''); setRequestedRole('client');

        } catch (err) {
            setLoading(false); console.error('Erreur lors de la demande de compte:', err);
            if (err.response?.data?.message) { setError(err.response.data.message); }
            else if (err.request) { setError('Impossible de contacter le serveur.'); }
            else { setError('Une erreur inattendue est survenue.'); }
        }
    };

    return (
        <div style={styles.container}>
            <h2>Demande de Création de Compte</h2>
            <p style={styles.subText}>Indiquez vos informations et le type de compte souhaité.</p>

            {successMessage && (<p style={styles.success}>{successMessage}</p>)}
            {error && !successMessage && (<p style={styles.error}>{error}</p>)}

            {!successMessage && (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <fieldset style={styles.fieldset}>
                        <legend style={styles.legend}>Informations Personnelles</legend>
                        <div style={styles.inputGroup}><label htmlFor="firstName" style={styles.label}>Prénom:</label><input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
                        <div style={styles.inputGroup}><label htmlFor="lastName" style={styles.label}>Nom:</label><input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required /></div>
                    </fieldset>

                    <fieldset style={{...styles.fieldset, paddingBottom: '10px'}}>
                        <legend style={styles.legend}>Type de Compte Demandé</legend>
                        <div style={styles.radioGroup}>
                            <label style={styles.radioLabel}>
                                <input type="radio" value="client" checked={requestedRole === 'client'} onChange={(e) => setRequestedRole(e.target.value)} name="requestedRoleOption" /> Client
                            </label>
                            <label style={styles.radioLabel}>
                                <input type="radio" value="admin" checked={requestedRole === 'admin'} onChange={(e) => setRequestedRole(e.target.value)} name="requestedRoleOption" /> Agent de Crédit (Admin)
                            </label>
                        </div>
                    </fieldset>

                    <fieldset style={styles.fieldset}>
                        <legend style={styles.legend}>Informations de Sécurité</legend>
                        <div style={styles.inputGroup}><label htmlFor="securityQuestion" style={styles.label}>Question de Sécurité:</label><select id="securityQuestion" value={selectedQuestion} onChange={(e) => setSelectedQuestion(e.target.value)} style={styles.input} required>{securityQuestions.map((q, index) => (<option key={index} value={q} disabled={index === 0}>{q}</option>))}</select></div>
                        <div style={styles.inputGroup}><label htmlFor="securityAnswer" style={styles.label}>Votre Réponse:</label><input type="password" id="securityAnswer" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} required /></div>
                    </fieldset>

                    <button type="submit" disabled={loading}> {loading ? 'Envoi en cours...' : 'Soumettre la Demande'} </button>
                </form>
            )}
             <div style={{marginTop: '20px'}}>
                 <Link to="/"><button type="button" style={{backgroundColor: '#6c757d'}}>Retour à l'accueil</button></Link>
             </div>
        </div>
    );
}

// Styles (avec radioGroup et radioLabel)
const styles = {
    container: { maxWidth: '550px', margin: '30px auto', padding: '30px', border: '1px solid var(--bna-border-color)', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)', backgroundColor: 'var(--bna-white)', textAlign: 'center', position: 'relative', zIndex: 1, },
    subText: { marginBottom: '25px', color: '#555', fontSize: '1.1em',},
    form: { display: 'flex', flexDirection: 'column', gap: '15px',},
    fieldset: { border: '1px solid var(--bna-border-color)', borderRadius: '5px', padding: '20px', marginBottom: '15px', textAlign:'left' },
    legend: { fontWeight: 'bold', color: 'var(--bna-green)', padding: '0 10px', fontSize: '1.1em' },
    inputGroup: { display: 'flex', flexDirection: 'column', marginBottom: '10px', textAlign: 'left'},
    label: { marginBottom: '5px', fontWeight: 'bold', color: '#444'},
    input: { padding: '12px', border: '1px solid var(--bna-border-color)', borderRadius: '4px', fontSize: '1em', width: '100%', boxSizing: 'border-box', marginTop: '5px',},
    radioGroup: { display: 'flex', justifyContent: 'flex-start', gap: '30px', padding: '10px 0px', alignItems: 'center', },
    radioLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal', color: '#333', },
    error: { color: 'var(--bna-error-red)', marginTop: '15px', fontWeight: 'bold', fontSize: '0.9em', border: '1px solid var(--bna-error-red)', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '5px', textAlign: 'center', },
    success: { color: 'green', backgroundColor: '#e6ffed', border: '1px solid #b7ebc9', padding: '15px', borderRadius: '5px', marginTop: '20px', fontWeight: 'bold', textAlign: 'center', },
};

export default AccountRequestPage;