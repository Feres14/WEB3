// src/pages/ApplyCreditPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // <-- Assurez-vous que Link est importé

const API_BASE_URL = 'http://localhost:5000/api'; // URL Backend

function ApplyCreditPage() {
    // --- États pour chaque champ du formulaire ---
    const [age, setAge] = useState('');
    const [profession, setProfession] = useState('');
    const [sexe, setSexe] = useState('');
    const [montantDemande, setMontantDemande] = useState('');
    const [revenuAnnuel, setRevenuAnnuel] = useState('');
    const [retenuesMensuelles, setRetenuesMensuelles] = useState('0');
    const [typeCanevas, setTypeCanevas] = useState('');

    // --- États pour les fichiers ---
    const [justificatifRevenuFile, setJustificatifRevenuFile] = useState(null);
    const [attestationTravailFile, setAttestationTravailFile] = useState(null);

    // États pour API et navigation
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));

    // Redirection si pas connecté
    useEffect(() => {
        if (!authToken) {
            console.log("Non connecté, redirection vers login...");
            navigate('/login');
        }
    }, [authToken, navigate]);


    // Fonctions pour gérer les changements des fichiers
    const handleJustificatifChange = (event) => { setJustificatifRevenuFile(event.target.files[0]); };
    const handleAttestationChange = (event) => { setAttestationTravailFile(event.target.files[0]); };


    // Gère la soumission du formulaire
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null); setSuccessMessage(null); setLoading(true);

        const formData = new FormData();
        formData.append('age', age);
        formData.append('profession', profession);
        formData.append('sexe', sexe);
        formData.append('montantDemande', montantDemande);
        formData.append('revenuAnnuel', revenuAnnuel);
        formData.append('retenuesMensuelles', retenuesMensuelles);
        formData.append('typeCanevas', typeCanevas);
        if (justificatifRevenuFile) { formData.append('justificatifRevenu', justificatifRevenuFile); }
        if (attestationTravailFile) { formData.append('attestationTravail', attestationTravailFile); }

        try {
            const applyUrl = `${API_BASE_URL}/credits/apply`;
            const config = { headers: { Authorization: `Bearer ${authToken}` } };
            const response = await axios.post(applyUrl, formData, config);

            setLoading(false);
            console.log('Demande soumise:', response.data);
            setSuccessMessage("Votre demande de crédit (avec fichiers) a été soumise avec succès !");
            // Réinitialiser
            setAge(''); setProfession(''); setSexe(''); setMontantDemande('');
            setRevenuAnnuel(''); setRetenuesMensuelles('0'); setTypeCanevas('');
            setJustificatifRevenuFile(null); setAttestationTravailFile(null);
            if (document.getElementById('justificatifRevenu')) document.getElementById('justificatifRevenu').value = '';
            if (document.getElementById('attestationTravail')) document.getElementById('attestationTravail').value = '';

        } catch (err) { /* ... gestion erreur ... */ setLoading(false); if (err.response && err.response.data && err.response.data.message) { setError(err.response.data.message); } else if (err.response && err.response.status === 401) { setError("Session expirée..."); navigate('/login'); } else if (err.request) { setError('Impossible de contacter le serveur.'); } else { setError('Erreur inattendue.'); } }
    };


    if (!authToken) { return <p>Vérification...</p>; }

    // Rendu JSX du formulaire
    return (
        <div style={styles.container}>
            <h2>Nouvelle Demande de Crédit</h2>
            <p style={styles.subText}>Remplissez les informations et joignez les documents requis.</p>

            {successMessage && <p style={styles.success}>{successMessage}</p>}
            {error && <p style={styles.error}>{error}</p>}

            {/* Ajout de l'encType pour les fichiers */}
            <form onSubmit={handleSubmit} style={styles.form} encType="multipart/form-data">
                <fieldset style={styles.fieldset}>
                    <legend>Informations Personnelles</legend>
                    <div style={styles.inputGroup}><label htmlFor="age" style={styles.label}>Âge:</label><input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} required /></div>
                    <div style={styles.inputGroup}><label htmlFor="sexe" style={styles.label}>Sexe:</label><select id="sexe" value={sexe} onChange={(e) => setSexe(e.target.value)} style={styles.input} required> <option value="">-- Choisir --</option> <option value="H">Homme</option> <option value="F">Femme</option><option value="Autre">Autre</option></select></div>
                    <div style={styles.inputGroup}><label htmlFor="profession" style={styles.label}>Profession:</label><input type="text" id="profession" value={profession} onChange={(e) => setProfession(e.target.value)} /></div>
                </fieldset>

                 <fieldset style={styles.fieldset}>
                    <legend>Informations Financières</legend>
                    <div style={styles.inputGroup}><label htmlFor="montantDemande" style={styles.label}>Montant Demandé:</label><input type="number" id="montantDemande" value={montantDemande} onChange={(e) => setMontantDemande(e.target.value)} required /></div>
                    <div style={styles.inputGroup}><label htmlFor="revenuAnnuel" style={styles.label}>Revenu Annuel:</label><input type="number" id="revenuAnnuel" value={revenuAnnuel} onChange={(e) => setRevenuAnnuel(e.target.value)} required /></div>
                    <div style={styles.inputGroup}><label htmlFor="retenuesMensuelles" style={styles.label}>Retenues Mensuelles:</label><input type="number" id="retenuesMensuelles" value={retenuesMensuelles} onChange={(e) => setRetenuesMensuelles(e.target.value)} required /></div>
                 </fieldset>

                 <fieldset style={styles.fieldset}>
                    <legend>Autres Détails</legend>
                     <div style={styles.inputGroup}><label htmlFor="typeCanevas" style={styles.label}>Type CANEVAS:</label><input type="text" id="typeCanevas" value={typeCanevas} onChange={(e) => setTypeCanevas(e.target.value)} /></div>
                </fieldset>

                 <fieldset style={styles.fieldset}>
                    <legend>Pièces Jointes</legend>
                    <div style={styles.inputGroup}><label htmlFor="justificatifRevenu" style={styles.label}>Justificatif de Revenu (PDF, JPG, PNG - Max 5Mo):</label><input style={styles.inputFile} type="file" id="justificatifRevenu" name="justificatifRevenu" accept=".pdf,.jpg,.jpeg,.png" onChange={handleJustificatifChange} />{justificatifRevenuFile && <span style={styles.fileName}>Fichier: {justificatifRevenuFile.name}</span>}</div>
                    <div style={styles.inputGroup}><label htmlFor="attestationTravail" style={styles.label}>Attestation de Travail (PDF, JPG, PNG - Max 5Mo):</label><input style={styles.inputFile} type="file" id="attestationTravail" name="attestationTravail" accept=".pdf,.jpg,.jpeg,.png" onChange={handleAttestationChange} />{attestationTravailFile && <span style={styles.fileName}>Fichier: {attestationTravailFile.name}</span>}</div>
                </fieldset>

                <button type="submit" disabled={loading} style={{ marginTop: '20px', padding: '15px' }}>{loading ? 'Envoi...' : 'Soumettre Demande Complète'}</button>
            </form>
            {/* Utilisation de Link pour le retour */}
            <div style={{marginTop: '30px'}}>
                 <Link to="/dashboard">
                     <button type="button" style={{backgroundColor: '#6c757d', padding: '8px 12px'}}>Retour</button>
                 </Link>
             </div>
        </div>
    );
}

// Styles
const styles = { container: { maxWidth: '700px', margin: '30px auto', padding: '30px', border: '1px solid var(--bna-border-color)', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)', backgroundColor: 'var(--bna-white)', textAlign: 'left', position: 'relative', zIndex: 1, }, subText: { marginBottom: '25px', color: '#555', textAlign: 'center', fontSize: '1.1em', }, form: { display: 'flex', flexDirection: 'column', gap: '15px', }, fieldset: { border: '1px solid var(--bna-border-color)', borderRadius: '5px', padding: '20px', marginBottom: '20px', }, legend: { fontWeight: 'bold', color: 'var(--bna-green)', padding: '0 10px', fontSize: '1.1em' }, inputGroup: { display: 'flex', flexDirection: 'column', marginBottom: '10px', }, label: { marginBottom: '5px', fontWeight: 'bold', color: '#444' }, input: { /* Hérité */ }, inputFile: { padding: '10px', border: '1px dashed var(--bna-border-color)', borderRadius: '4px', fontSize: '0.9em', width: '100%', boxSizing: 'border-box', marginTop: '5px', cursor: 'pointer', backgroundColor: '#f8f9fa' }, fileName: { fontSize: '0.8em', color: '#555', marginTop: '5px', display: 'block', fontStyle: 'italic', }, error: { color: 'var(--bna-error-red)', marginTop: '15px', fontWeight: 'bold', fontSize: '0.9em', border: '1px solid var(--bna-error-red)', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '5px', textAlign: 'center', }, success: { color: 'green', backgroundColor: '#e6ffed', border: '1px solid #b7ebc9', padding: '15px', borderRadius: '5px', marginTop: '20px', fontWeight: 'bold', textAlign: 'center', }, };

export default ApplyCreditPage;