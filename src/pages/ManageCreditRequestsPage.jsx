// src/pages/ManageCreditRequestsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

function ManageCreditRequestsPage() {
    const [allApplications, setAllApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        const fetchAllApplications = async () => {
            if (!authToken) {
                navigate('/login');
                return;
            }
            setLoading(true); setError(null);
            try {
                // --- APPEL À LA NOUVELLE ROUTE ADMIN ---
                const url = `${API_BASE_URL}/admin/credits`;
                const config = { headers: { Authorization: `Bearer ${authToken}` } };
                const response = await axios.get(url, config);
                setAllApplications(response.data);
                console.log("Toutes les demandes récupérées (admin):", response.data);
            } catch (err) {
                console.error('Erreur récup. toutes demandes (admin):', err);
                if (err.response && err.response.status === 401) {
                    setError("Session expirée ou accès non autorisé.");
                    localStorage.removeItem('authToken'); localStorage.removeItem('userInfo');
                    navigate('/login');
                } else if (err.response && err.response.status === 403) {
                    setError("Accès refusé. Vous n'avez pas les droits d'administrateur.");
                    navigate('/dashboard'); // Redirige vers dashboard client si pas admin
                }
                else {
                    setError('Erreur lors de la récupération des demandes.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAllApplications();
    }, [authToken, navigate]);


    if (loading) return <div style={styles.message}>Chargement de toutes les demandes...</div>;
    if (error) return <div style={{ ...styles.message, ...styles.error }}>Erreur: {error}</div>;

    return (
        <div style={styles.container}>
            <h2>Gestion des Demandes de Crédit (Admin)</h2>

            {allApplications.length === 0 ? (
                <p style={styles.message}>Aucune demande de crédit trouvée.</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Date Dem.</th>
                            <th style={styles.th}>Demandeur (Username)</th>
                            <th style={styles.th}>Prénom Nom</th>
                            <th style={styles.th}>Montant</th>
                            <th style={styles.th}>Revenu Annuel</th>
                            <th style={styles.th}>Statut</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allApplications.map((app) => (
                            <tr key={app._id}>
                                <td style={styles.td}>{new Date(app.createdAt).toLocaleDateString('fr-FR')}</td>
                                {/* applicantUser est populé avec username, email, firstName, lastName */}
                                <td style={styles.td}>{app.applicantUser?.username || 'N/A'}</td>
                                <td style={styles.td}>{app.applicantUser?.firstName || ''} {app.applicantUser?.lastName || ''}</td>
                                <td style={styles.td}>{app.montantDemande?.toLocaleString('fr-FR')}</td>
                                <td style={styles.td}>{app.revenuAnnuel?.toLocaleString('fr-FR')}</td>
                                <td style={styles.td}>{app.statut}</td>
                                <td style={styles.td}>
                                    {/* Lien vers la page de détail/gestion de cette demande */}
                                    <Link to={`/admin/credits/${app._id}`}>
                                        <button style={styles.actionButton}>Gérer</button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div style={{ marginTop: '30px' }}>
                <Link to="/admin/dashboard">
                    <button type="button" style={{ backgroundColor: '#6c757d' }}>Retour au Tableau de Bord Admin</button>
                </Link>
            </div>
        </div>
    );
}

// Styles (peuvent être partagés ou spécifiques)
const styles = {
    container: { /* ... comme MyApplicationsPage ... */ },
    message: { /* ... */ },
    error: { /* ... */ },
    table: { /* ... */ },
    th: { /* ... */ },
    td: { /* ... */ },
    actionButton: {
        padding: '5px 10px',
        backgroundColor: 'var(--bna-green)',
        color: 'white',
        fontSize: '0.85em',
        fontWeight: 'normal',
    }
};

export default ManageCreditRequestsPage;