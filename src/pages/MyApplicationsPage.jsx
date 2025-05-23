// src/pages/MyApplicationsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

function MyApplicationsPage() {
    console.log("MyApplicationsPage: Composant est en train de se rendre/monter."); // Log 0

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const navigate = useNavigate();
    // On récupère le token au moment où fetchMyApplications est appelé,
    // ou on le passe en dépendance à useEffect si on veut réagir à son changement.
    // Pour un chargement initial, le récupérer dans fetchMyApplications est souvent suffisant.

    useEffect(() => {
        console.log("MyApplicationsPage: useEffect APPELÉ."); // Log 14

        const fetchMyApplications = async () => {
            console.log("MyApplicationsPage: Début de fetchMyApplications."); // Log 3
            const currentAuthToken = localStorage.getItem('authToken'); // Lire le token ICI
            console.log("MyApplicationsPage: Token actuel dans fetchMyApplications:", currentAuthToken); // Log 2 (déplacé)

            if (!currentAuthToken) {
                console.warn("MyApplicationsPage: Aucun authToken trouvé dans fetchMyApplications. Redirection vers /login."); // Log 4
                navigate('/login');
                setLoading(false); // Important si on quitte tôt
                return;
            }

            setLoading(true); // Mettre loading à true juste avant l'appel API
            setError(null);
            setDeleteError(null);
            console.log("MyApplicationsPage: Préparation de l'appel API avec token:", currentAuthToken); // Log 5

            try {
                const url = `${API_BASE_URL}/credits/my-applications`;
                // Utiliser currentAuthToken ici
                const config = { headers: { Authorization: `Bearer ${currentAuthToken}` } };
                console.log("MyApplicationsPage: Envoi de la requête GET à:", url); // Log 6

                const response = await axios.get(url, config);

                console.log("MyApplicationsPage: Réponse API reçue:", response); // Log 7
                setApplications(response.data);
                console.log("MyApplicationsPage: Demandes mises à jour dans l'état:", response.data); // Log 8
            } catch (err) {
                console.error('MyApplicationsPage: Erreur dans fetchMyApplications:', err); // Log 9
                if (err.response) {
                    console.error("MyApplicationsPage: Détails erreur serveur:", err.response); // Log 10
                    if (err.response.status === 401) {
                        setError("Session expirée ou non autorisée.");
                        localStorage.clear();
                        navigate('/login');
                    } else {
                        setError(err.response.data.message || 'Erreur récupération demandes.');
                    }
                } else if (err.request) {
                    console.error("MyApplicationsPage: Pas de réponse du serveur:", err.request); // Log 11
                    setError('Impossible de contacter le serveur.');
                } else {
                    console.error("MyApplicationsPage: Erreur configuration requête:", err.message); // Log 12
                    setError('Erreur de configuration.');
                }
            } finally {
                console.log("MyApplicationsPage: Bloc finally de fetchMyApplications. setLoading(false)."); // Log 13
                setLoading(false);
            }
        };

        fetchMyApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Exécuter une seule fois au montage

    const handleDelete = async (applicationId) => {
        const currentAuthToken = localStorage.getItem('authToken'); // Toujours récupérer le token frais
        if (!currentAuthToken) { navigate('/login'); return; }
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) return;
        setDeleteError(null);
        try {
            const url = `${API_BASE_URL}/credits/my-applications/${applicationId}`;
            // Utiliser currentAuthToken
            await axios.delete(url, { headers: { Authorization: `Bearer ${currentAuthToken}` } });
            setApplications(prev => prev.filter(app => app._id !== applicationId));
        } catch (err) {
            console.error(`Erreur suppression demande ${applicationId}:`, err);
            setDeleteError(err.response?.data?.message || 'Erreur suppression.');
        }
    };

    console.log(`MyApplicationsPage: Rendu avec loading=${loading}, error=${error}, applications.length=${applications.length}`); // Log 15

    if (loading) {
        return <div style={styles.message}>Chargement de vos demandes...</div>;
    }

    if (error && applications.length === 0) {
        return <div style={{ ...styles.message, ...styles.error }}>Erreur: {error}</div>;
    }

    return (
        // JSX de retour complet que vous aviez déjà (avec la table/liste)
        <div style={styles.container}>
            <h2>Mes Demandes de Crédit</h2>
            {deleteError && <p style={{ ...styles.error, marginBottom: '15px' }}>Erreur de suppression: {deleteError}</p>}
            {error && applications.length > 0 && <p style={{ ...styles.error, marginBottom: '15px' }}>Erreur de chargement: {error}</p>}

            {applications.length === 0 ? ( // Ne plus vérifier !loading ici, car si error est true et app.length=0, on l'affiche déjà
                <p style={styles.message}>Vous n'avez soumis aucune demande de crédit pour le moment.</p>
            ) : (
                <div style={styles.applicationsList}>
                    {applications.map((app) => (
                        <div key={app._id} style={styles.applicationItem}>
                            <div style={styles.applicationRow}>
                                <div><strong>Date:</strong> {new Date(app.createdAt).toLocaleDateString('fr-FR')}</div>
                                <div><strong>Montant:</strong> {app.montantDemande?.toLocaleString('fr-FR')}</div>
                                <div><strong>Statut:</strong> <span style={getStatusStyle(app.statut)}>{app.statut}</span></div>
                                <div style={styles.actionsCell}>
                                    {(app.statut === 'En attente' || app.statut === 'Informations complémentaires requises') && (
                                        <Link to={`/edit-application/${app._id}`}>
                                            <button style={styles.editButton} title="Modifier">Modifier</button>
                                        </Link>
                                    )}
                                    {app.statut === 'En attente' && (
                                        <button onClick={() => handleDelete(app._id)} style={styles.deleteButton} title="Supprimer">Supprimer</button>
                                    )}
                                    {app.statut !== 'En attente' && app.statut !== 'Informations complémentaires requises' && (
                                        <span style={styles.noAction}>-</span>
                                    )}
                                </div>
                            </div>
                            {app.commentaireAdmin && (
                                <div style={styles.adminComment}>
                                    <strong>Note de la banque :</strong>
                                    <p style={{margin: '5px 0 0 0', fontStyle:'italic'}}>{app.commentaireAdmin}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <div style={{marginTop: '30px'}}>
                <Link to="/dashboard"><button type="button" style={{backgroundColor: '#6c757d'}}>Retour au Tableau de Bord</button></Link>
            </div>
        </div>
    );
}

// getStatusStyle et styles restent les mêmes que dans la version complète que vous avez postée
const getStatusStyle = (status) => { let s={padding:'5px 10px',borderRadius:'4px',color:'white',fontWeight:'bold', display:'inline-block', minWidth: '120px', textAlign: 'center', fontSize: '0.9em'}; switch(status){case 'Approuvé':s.backgroundColor='var(--bna-green)';break;case 'Rejeté':s.backgroundColor='var(--bna-error-red)';break;case 'En cours d\'étude':s.backgroundColor='#ffc107';s.color='#212529';break;case 'Informations complémentaires requises':s.backgroundColor='#17a2b8';break;default:s.backgroundColor='#6c757d';break;} return s; };
const styles = { container:{maxWidth:'950px',margin:'30px auto',padding:'30px',border:'1px solid var(--bna-border-color)',borderRadius:'8px',boxShadow:'0 4px 8px rgba(0,0,0,0.05)',backgroundColor:'var(--bna-white)',textAlign:'center',position:'relative',zIndex:1}, message:{marginTop:'20px',fontSize:'1.1em',color:'#555'}, error:{color:'var(--bna-error-red)',border:'1px solid var(--bna-error-red)',backgroundColor:'#f8d7da',padding:'10px',borderRadius:'5px',marginTop:'15px',textAlign:'center'}, applicationsList:{marginTop:'20px',width:'100%'}, applicationItem:{border:'1px solid var(--bna-border-color)',borderRadius:'5px',marginBottom:'15px',padding:'15px',backgroundColor:'#fff',textAlign:'left'}, applicationRow:{display:'grid', gridTemplateColumns: 'minmax(120px, 1fr) minmax(120px, 1fr) minmax(150px, 1.5fr) minmax(150px, 1fr)', alignItems:'center', gap:'10px', marginBottom:'10px'}, actionsCell:{display:'flex',gap:'10px', alignItems: 'center', justifyContent: 'flex-start'}, adminComment:{marginTop:'10px',padding:'10px',backgroundColor:'#f8f9fa',borderRadius:'4px',fontSize:'0.9em',borderLeft:'4px solid var(--bna-green)'}, editButton:{padding:'5px 10px',backgroundColor:'#ffc107',color:'#212529',border:'none',borderRadius:'3px',cursor:'pointer',fontSize:'0.85em',fontWeight:'normal'}, deleteButton:{padding:'5px 10px',backgroundColor:'var(--bna-error-red)',color:'white',border:'none',borderRadius:'3px',cursor:'pointer',fontSize:'0.85em',fontWeight:'normal'}, noAction:{color:'#aaa',fontStyle:'italic', display:'inline-block', width:'auto', minWidth:'120px', textAlign:'left'} };

export default MyApplicationsPage;