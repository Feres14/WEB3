// src/pages/CreditDetailPageAdmin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';
const SERVER_URL = 'http://localhost:5000'; // Pour les liens vers les fichiers

function CreditDetailPageAdmin() {
    const { id: applicationId } = useParams(); // Récupère l'ID de la demande depuis l'URL
    const navigate = useNavigate();
    const authToken = localStorage.getItem('authToken');

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Nouveaux états pour la gestion admin ---
    const [adminComment, setAdminComment] = useState('');
    const [newStatus, setNewStatus] = useState(''); // Pour stocker le statut à appliquer
    const [actionError, setActionError] = useState(null);
    const [actionSuccess, setActionSuccess] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Pour les boutons d'action

    // Charger les détails de la demande
    useEffect(() => {
        if (!authToken) { navigate('/login'); return; }
        if (!applicationId) { setError("ID de demande non spécifié."); setLoading(false); return; }

        const fetchApplicationDetails = async () => {
            setLoading(true); setError(null);
            try {
                const url = `${API_BASE_URL}/admin/credits/${applicationId}`;
                const config = { headers: { Authorization: `Bearer ${authToken}` } };
                const response = await axios.get(url, config);
                setApplication(response.data);
                // Pré-remplir le commentaire si existant (ou le statut si on voulait)
                setAdminComment(response.data.commentaireAdmin || '');
                setNewStatus(response.data.statut || ''); // Initialiser avec le statut actuel
                console.log("Détails demande (admin):", response.data);
            } catch (err) { /* ... gestion erreur similaire à ManageCreditsPage ... */ }
            finally { setLoading(false); }
        };
        fetchApplicationDetails();
    }, [applicationId, authToken, navigate]);


    // --- Fonction pour soumettre le nouveau statut et/ou commentaire ---
    const handleManageApplication = async (chosenStatus) => {
        if (!authToken) { navigate('/login'); return; }
        if (!chosenStatus && !adminComment.trim()) {
             setActionError("Veuillez choisir un statut ou écrire un commentaire.");
             return;
        }

        setIsSubmitting(true); setActionError(null); setActionSuccess(null);

        const payload = {};
        if (chosenStatus) payload.statut = chosenStatus;
        // On envoie le commentaire même s'il est vide pour potentiellement l'effacer
        if (adminComment !== undefined) payload.commentaireAdmin = adminComment;


        try {
            const url = `${API_BASE_URL}/admin/credits/${applicationId}/manage`;
            const config = { headers: { Authorization: `Bearer ${authToken}` } };
            const response = await axios.put(url, payload, config);

            setApplication(response.data); // Mettre à jour l'affichage avec les nouvelles données
            setNewStatus(response.data.statut);
            setAdminComment(response.data.commentaireAdmin || '');
            setActionSuccess(`Demande mise à jour avec succès. Nouveau statut: ${response.data.statut}`);
            console.log("Demande mise à jour par admin:", response.data);

        } catch (err) {
            console.error("Erreur MAJ demande (admin):", err);
            if (err.response?.data?.message) { setActionError(err.response.data.message); }
            else { setActionError("Erreur lors de la mise à jour de la demande."); }
        } finally {
            setIsSubmitting(false);
        }
    };


    // --- Rendu ---
    if (loading) return <div style={styles.message}>Chargement des détails de la demande...</div>;
    if (error) return <div style={{ ...styles.message, ...styles.error }}>Erreur: {error}</div>;
    if (!application) return <div style={styles.message}>Demande non trouvée.</div>;

    return (
        <div style={styles.container}>
            <h2>Détails de la Demande de Crédit (Admin) - ID: {application._id}</h2>
            <Link to="/admin/credits-management" style={styles.backLink}>
                ← Retour à la liste des demandes
            </Link>

            {/* Affichage des infos */}
            <div style={styles.detailsGrid}>
                {/* Infos Client */}
                <div style={styles.section}>
                    <h3>Informations du Demandeur</h3>
                    <p><strong>Nom d'utilisateur:</strong> {application.applicantUser?.username || 'N/A'}</p>
                    <p><strong>Nom complet:</strong> {application.applicantUser?.firstName || ''} {application.applicantUser?.lastName || ''}</p>
                    <p><strong>Email:</strong> {application.applicantUser?.email || 'N/A'}</p>
                    <p><strong>Âge:</strong> {application.age}</p>
                    <p><strong>Sexe:</strong> {application.sexe}</p>
                    <p><strong>Profession:</strong> {application.profession}</p>
                </div>

                {/* Infos Demande */}
                <div style={styles.section}>
                    <h3>Détails de la Demande</h3>
                    <p><strong>Date de soumission:</strong> {new Date(application.createdAt).toLocaleString('fr-FR')}</p>
                    <p><strong>Montant Demandé:</strong> {application.montantDemande?.toLocaleString('fr-FR')}</p>
                    <p><strong>Revenu Annuel:</strong> {application.revenuAnnuel?.toLocaleString('fr-FR')}</p>
                    <p><strong>Retenues Mensuelles:</strong> {application.retenuesMensuelles?.toLocaleString('fr-FR')}</p>
                    <p><strong>Type CANEVAS:</strong> {application.typeCanevas}</p>
                    <p><strong>Statut Actuel:</strong> <strong style={styles.statusText}>{application.statut}</strong></p>
                </div>
            </div>

            {/* Section Documents */}
            <div style={styles.section}>
                <h3>Documents Fournis</h3>
                {application.justificatifRevenuPath ? (
                    <p><a href={`${SERVER_URL}/${application.justificatifRevenuPath}`} target="_blank" rel="noopener noreferrer">Voir Justificatif de Revenu</a></p>
                ) : <p>Aucun justificatif de revenu fourni.</p>}
                {application.attestationTravailPath ? (
                    <p><a href={`${SERVER_URL}/${application.attestationTravailPath}`} target="_blank" rel="noopener noreferrer">Voir Attestation de Travail</a></p>
                ) : <p>Aucune attestation de travail fournie.</p>}
                {/* Ajoutez d'autres liens de documents ici */}
            </div>

            {/* Section Admin (Commentaire et Actions) */}
            <div style={styles.adminSection}>
                <h3>Gestion de la Demande</h3>
                {actionSuccess && <p style={{...styles.message, color: 'green'}}>{actionSuccess}</p>}
                {actionError && <p style={{...styles.error}}>{actionError}</p>}

                <div style={styles.inputGroup}>
                    <label htmlFor="adminComment" style={styles.label}>Commentaire pour le client (sera visible par le client):</label>
                    <textarea
                        id="adminComment"
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                        rows="4"
                        style={styles.textarea}
                        placeholder="Ex: Veuillez fournir une copie de votre dernière fiche de paie..."
                    />
                    {/* Bouton pour enregistrer juste le commentaire (sans changer le statut) */}
                    <button onClick={() => handleManageApplication(null)} disabled={isSubmitting} style={{marginTop: '10px', backgroundColor:'#5a6268'}}>
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer Commentaire'}
                    </button>
                </div>

                <div style={styles.actions}>
                    <p><strong>Actions sur la demande :</strong></p>
                    {/* Si vous voulez un select pour le statut */}
                    {/*
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{...styles.input, marginBottom:'10px', width:'auto'}}>
                        <option value="En attente">En attente</option>
                        <option value="En cours d'étude">En cours d'étude</option>
                        <option value="Informations complémentaires requises">Infos complémentaires</option>
                        <option value="Approuvé">Approuvé</option>
                        <option value="Rejeté">Rejeté</option>
                    </select>
                    <button onClick={() => handleManageApplication(newStatus)} disabled={isSubmitting}>
                        {isSubmitting ? 'MAJ...' : `Mettre à jour Statut vers "${newStatus}"`}
                    </button>
                    */}

                    {/* Ou des boutons directs pour Approuver/Rejeter */}
                    <button onClick={() => handleManageApplication('Approuvé')} disabled={isSubmitting || application.statut === 'Approuvé'} style={styles.approveButton}>
                        Approuver
                    </button>
                    <button onClick={() => handleManageApplication('Rejeté')} disabled={isSubmitting || application.statut === 'Rejeté'} style={styles.rejectButton}>
                        Rejeter
                    </button>
                    <button onClick={() => handleManageApplication('Informations complémentaires requises')} disabled={isSubmitting} style={{backgroundColor:'#ffc107', color:'#212529'}}>
                        Demander Infos Complémentaires
                    </button>
                </div>
            </div>
        </div>
    );
}

// Styles (à affiner)
const styles = {
    container: { padding: '20px', maxWidth: '1000px', margin: 'auto' },
    backLink: { display: 'inline-block', marginBottom: '20px', color: 'var(--bna-green)', textDecoration: 'none' },
    detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px', textAlign:'left' },
    section: { padding: '20px', border: '1px solid var(--bna-border-color)', borderRadius: '5px', backgroundColor: '#fff' },
    adminSection: { marginTop: '30px', padding: '20px', border: '1px solid var(--bna-border-color)', borderRadius: '5px', backgroundColor: '#f8f9fa' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    textarea: { width: '100%', padding: '10px', border: '1px solid var(--bna-border-color)', borderRadius: '4px', minHeight: '80px' },
    actions: { marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' },
    approveButton: { backgroundColor: '#28a745' }, // Vert pour approuver
    rejectButton: { backgroundColor: 'var(--bna-error-red)' }, // Rouge pour rejeter
    message: { /* ... */ }, error: { /* ... */ }, success: { /* ... */ },
    statusText: { fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' /* On pourrait ajouter une couleur par statut */ }
};

export default CreditDetailPageAdmin;