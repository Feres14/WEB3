// src/pages/EditApplicationPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

// Fonction pour styliser le statut (peut être partagée dans un fichier utils)
const getStatusStyle = (status) => {
    let style = { padding: '3px 8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', display: 'inline-block', minWidth: '100px', textAlign: 'center', fontSize: '0.9em' };
    switch (status) {
        case 'Approuvé': style.backgroundColor = 'var(--bna-green)'; break;
        case 'Rejeté': style.backgroundColor = 'var(--bna-error-red)'; break;
        case 'En cours d\'étude': style.backgroundColor = '#ffc107'; style.color = '#212529'; break;
        case 'Informations complémentaires requises': style.backgroundColor = '#17a2b8'; break;
        default: style.backgroundColor = '#6c757d'; break;
    }
    return style;
};


function EditApplicationPage() {
    const { id: applicationId } = useParams();
    const navigate = useNavigate();

    const [age, setAge] = useState('');
    const [profession, setProfession] = useState('');
    const [sexe, setSexe] = useState('');
    const [montantDemande, setMontantDemande] = useState('');
    const [revenuAnnuel, setRevenuAnnuel] = useState('');
    const [retenuesMensuelles, setRetenuesMensuelles] = useState('');
    const [typeCanevas, setTypeCanevas] = useState('');
    const [originalData, setOriginalData] = useState(null); // Pour stocker le statut initial

    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditable, setIsEditable] = useState(false);

    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        if (!authToken) { navigate('/login'); return; }
        if (!applicationId) { setError("ID de demande manquant."); setLoading(false); return; }

        const fetchApplicationData = async () => {
            setLoading(true); setError(null);
            try {
                const url = `${API_BASE_URL}/credits/my-applications/${applicationId}`;
                const config = { headers: { Authorization: `Bearer ${authToken}` } };
                const response = await axios.get(url, config);
                const data = response.data;
                console.log("Données récupérées pour édition:", data);
                setOriginalData(data);

                setAge(data.age || '');
                setProfession(data.profession || '');
                setSexe(data.sexe || '');
                setMontantDemande(data.montantDemande || '');
                setRevenuAnnuel(data.revenuAnnuel || '');
                setRetenuesMensuelles(data.retenuesMensuelles !== undefined ? data.retenuesMensuelles : '');
                setTypeCanevas(data.typeCanevas || '');

                // --- MODIFICATION DE LA CONDITION POUR isEditable ---
                if (data.statut === 'En attente' || data.statut === 'Informations complémentaires requises') {
                    setIsEditable(true);
                    console.log("Demande éditable, statut:", data.statut);
                } else {
                    setIsEditable(false);
                    setError(`Cette demande (statut: ${data.statut}) ne peut plus être modifiée.`);
                    console.log("Demande non éditable, statut:", data.statut);
                }
                // --- FIN MODIFICATION ---

            } catch (err) {
                console.error("Erreur chargement demande pour édition:", err);
                setIsEditable(false);
                if (err.response && (err.response.status === 401 || err.response.status === 404)) {
                    setError(err.response.data.message || "Erreur ou accès non autorisé.");
                    if(err.response.status === 401) navigate('/login');
                } else {
                    setError("Erreur lors du chargement des détails de la demande.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchApplicationData();
    }, [applicationId, authToken, navigate]);


    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!isEditable) {
            setError("Le formulaire n'est pas modifiable dans l'état actuel de la demande.");
            return;
        }

        setError(null); setSuccessMessage(null); setLoading(true);

        const updatedData = {
            age: Number(age), profession, sexe,
            montantDemande: Number(montantDemande), revenuAnnuel: Number(revenuAnnuel),
            retenuesMensuelles: Number(retenuesMensuelles), typeCanevas
        };
        // Pour l'instant, on ne gère pas l'upload de nouveaux fichiers lors de l'édition

        try {
            const updateUrl = `${API_BASE_URL}/credits/my-applications/${applicationId}`; // Route client pour update
            const config = { headers: { Authorization: `Bearer ${authToken}` } };
            const response = await axios.put(updateUrl, updatedData, config);

            setLoading(false);
            console.log('Demande mise à jour:', response.data);
            setSuccessMessage("Votre demande a été modifiée avec succès ! Le statut a été mis à 'En cours d'étude'.");
            setOriginalData(response.data); // Mettre à jour l'original avec les nouvelles données
            // La demande n'est plus éditable immédiatement après une soumission réussie
            // car son statut devrait changer (géré par le backend)
            if (response.data.statut !== 'En attente' && response.data.statut !== 'Informations complémentaires requises') {
                setIsEditable(false);
            }

            setTimeout(() => navigate('/my-applications'), 3000); // Redirige après 3s

        } catch (err) {
            setLoading(false);
            console.error('Erreur lors de la modification:', err);
            if (err.response?.data?.message) { setError(err.response.data.message); }
            else if (err.response?.status === 401) { setError("Session expirée..."); navigate('/login'); }
            else { setError('Erreur lors de la modification de la demande.'); }
        }
    };

    if (loading && !originalData) { return <div style={styles.message}>Chargement de la demande...</div>; }
    // Affiche l'erreur si le chargement initial échoue ET que la page n'est pas éditable
    if (error && !isEditable && !successMessage) {
        return (
            <div style={styles.container}>
                <h2 style={{color: 'var(--bna-error-red)'}}>Modification Impossible</h2>
                <p style={{ ...styles.message, ...styles.error }}>{error}</p>
                <Link to="/my-applications"><button type="button" style={{backgroundColor:'#6c757d', marginTop:'15px'}}>Retour à Mes Demandes</button></Link>
            </div>
        );
    }
    if (!originalData && !loading) { return <div style={styles.message}>Demande non trouvée.</div>; }

    return (
        <div style={styles.container}>
            <h2>Modifier ma Demande de Crédit (ID: ...{applicationId?.slice(-6)})</h2>
            {originalData && <p style={styles.subText}>Statut Actuel: <strong style={getStatusStyle(originalData.statut)}>{originalData.statut}</strong></p>}

            {successMessage && <p style={styles.success}>{successMessage}</p>}
            {/* Afficher l'erreur de soumission si elle existe et pas de message de succès */}
            {error && !successMessage && <p style={styles.error}>{error}</p>}

            {/* Formulaire désactivé si pas éditable ou si en cours de soumission */}
            <form onSubmit={handleSubmit} style={styles.form}>
                <fieldset style={styles.fieldset} disabled={!isEditable || loading}>
                    <legend>Informations Personnelles {originalData && !isEditable && '(Non modifiable)'}</legend>
                    <div style={styles.inputGroup}><label htmlFor="age" style={styles.label}>Âge:</label><input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} required /></div>
                    <div style={styles.inputGroup}><label htmlFor="sexe" style={styles.label}>Sexe:</label><select id="sexe" value={sexe} onChange={(e) => setSexe(e.target.value)} style={styles.input} required> <option value="">-- Choisir --</option> <option value="H">Homme</option> <option value="F">Femme</option><option value="Autre">Autre</option></select></div>
                    <div style={styles.inputGroup}><label htmlFor="profession" style={styles.label}>Profession:</label><input type="text" id="profession" value={profession} onChange={(e) => setProfession(e.target.value)} /></div>
                </fieldset>

                <fieldset style={styles.fieldset} disabled={!isEditable || loading}>
                    <legend>Informations Financières {originalData && !isEditable && '(Non modifiable)'}</legend>
                    <div style={styles.inputGroup}><label htmlFor="montantDemande" style={styles.label}>Montant Demandé:</label><input type="number" id="montantDemande" value={montantDemande} onChange={(e) => setMontantDemande(e.target.value)} required /></div>
                    <div style={styles.inputGroup}><label htmlFor="revenuAnnuel" style={styles.label}>Revenu Annuel:</label><input type="number" id="revenuAnnuel" value={revenuAnnuel} onChange={(e) => setRevenuAnnuel(e.target.value)} required /></div>
                    <div style={styles.inputGroup}><label htmlFor="retenuesMensuelles" style={styles.label}>Retenues Mensuelles:</label><input type="number" id="retenuesMensuelles" value={retenuesMensuelles} onChange={(e) => setRetenuesMensuelles(e.target.value)} required /></div>
                </fieldset>

                <fieldset style={styles.fieldset} disabled={!isEditable || loading}>
                    <legend>Autres Détails {originalData && !isEditable && '(Non modifiable)'}</legend>
                    <div style={styles.inputGroup}><label htmlFor="typeCanevas" style={styles.label}>Type CANEVAS:</label><input type="text" id="typeCanevas" value={typeCanevas} onChange={(e) => setTypeCanevas(e.target.value)} /></div>
                </fieldset>

                {/* Pour l'instant, on ne permet pas la modification des fichiers ici */}
                {/* On pourrait ajouter une section "Remplacer les documents" avec des inputs file */}

                {/* Afficher le bouton de soumission seulement si éditable */}
                {isEditable && (
                    <button type="submit" disabled={loading} style={{ marginTop: '20px', padding: '15px' }}>
                        {loading ? 'Mise à jour en cours...' : 'Enregistrer les Modifications'}
                    </button>
                )}
                 {/* Affiche un message si le formulaire n'est pas éditable mais qu'il n'y a pas d'erreur de chargement */}
                {!isEditable && originalData && !error && !successMessage && (
                    <p style={styles.infoMessage}>Cette demande n'est plus modifiable car son statut actuel est "{originalData.statut}".</p>
                )}
            </form>
            <div style={{marginTop: '30px'}}>
                <Link to="/my-applications">
                    <button type="button" style={{backgroundColor: '#6c757d', padding: '8px 12px'}}>Retour à Mes Demandes</button>
                </Link>
            </div>
        </div>
    );
}

// Styles (similaires à ApplyCreditPage, ajout de infoMessage)
const styles = { container: { maxWidth: '700px', margin: '30px auto', padding: '30px', border: '1px solid var(--bna-border-color)', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)', backgroundColor: 'var(--bna-white)', textAlign: 'left', position: 'relative', zIndex: 1, }, subText: { marginBottom: '15px', color: '#555', textAlign: 'center', fontSize: '1em', fontWeight:'bold' }, form: { display: 'flex', flexDirection: 'column', gap: '15px', }, fieldset: { border: '1px solid var(--bna-border-color)', borderRadius: '5px', padding: '20px', marginBottom: '20px', }, legend: { fontWeight: 'bold', color: 'var(--bna-green)', padding: '0 10px', fontSize: '1.1em' }, inputGroup: { display: 'flex', flexDirection: 'column', marginBottom: '10px', }, label: { marginBottom: '5px', fontWeight: 'bold', color: '#444' }, input: { /* Hérité */ }, error: { color: 'var(--bna-error-red)', marginTop: '15px', fontWeight: 'bold', fontSize: '0.9em', border: '1px solid var(--bna-error-red)', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '5px', textAlign: 'center', }, success: { color: 'green', backgroundColor: '#e6ffed', border: '1px solid #b7ebc9', padding: '15px', borderRadius: '5px', marginTop: '20px', fontWeight: 'bold', textAlign: 'center', }, message: { marginTop: '20px', fontSize: '1.1em', color: '#555', textAlign: 'center'}, infoMessage: { marginTop: '20px', fontSize: '1em', color: '#17a2b8', backgroundColor: '#e2f3f5', border: '1px solid #b6eff2', padding: '10px', borderRadius: '5px', textAlign: 'center' } };

export default EditApplicationPage;