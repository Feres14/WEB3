// src/pages/AdminDashboardPage.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // NavLink pour les liens stylisés

// Style pour les liens NavLink (peut être partagé via un fichier utils ou App.js)
const navLinkStyles = ({ isActive }) => ({
    fontWeight: isActive ? 'bold' : 'normal',
    margin: '0 15px',
    color: isActive ? 'var(--bna-green-darker)' : 'var(--bna-green)', // Utilise vos variables CSS
    textDecoration: 'none',
    display: 'inline-block', // Pour que padding et margin fonctionnent bien
    padding: '10px',
    borderBottom: isActive ? '2px solid var(--bna-green-darker)' : '2px solid transparent',
});

function AdminDashboardPage() {
   // Récupérer les informations de l'utilisateur (admin) depuis localStorage
   const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
   const navigate = useNavigate(); // Pour la déconnexion

   const handleLogout = () => {
       localStorage.removeItem('authToken');
       localStorage.removeItem('userInfo');
       navigate('/login'); // Redirige vers la page de login après déconnexion
   };

   return (
       <div style={styles.container}>
         <h2>Tableau de Bord Administrateur</h2>
         <p style={styles.welcomeMessage}>Bienvenue, {userInfo.username || 'Admin'} !</p>

          {/* Section de navigation pour les actions admin */}
         <nav style={styles.adminNav}>
             <NavLink to="/admin/credits-management" style={navLinkStyles}>
                 Gérer les Demandes de Crédit
             </NavLink>
             <NavLink to="/admin/users-management" style={navLinkStyles}>
                 Gérer les Utilisateurs
             </NavLink>
             {/* Ajoutez d'autres liens admin ici si nécessaire */}
         </nav>

         <div style={styles.contentArea}>
            <p>Sélectionnez une option ci-dessus pour commencer la gestion.</p>
            {/* Ici, on pourrait afficher des statistiques ou des infos rapides plus tard */}
         </div>

         <button onClick={handleLogout} style={styles.logoutButton}>
             Se déconnecter
         </button>
       </div>
   );
}

// Styles pour ce composant
const styles = {
    container: {
        padding: '20px',
        textAlign: 'center',
    },
    welcomeMessage: {
        fontSize: '1.2em',
        marginBottom: '30px',
    },
    adminNav: {
        margin: '20px 0',
        padding: '20px 0',
        borderTop: '1px solid var(--bna-border-color)',
        borderBottom: '1px solid var(--bna-border-color)',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px', // Espace entre les liens
    },
    contentArea: {
        marginTop: '30px',
        minHeight: '200px', // Espace pour futur contenu
    },
    logoutButton: {
        marginTop: '30px',
        backgroundColor: '#6c757d', // Gris pour déconnexion
        padding: '10px 20px',
    }
};

export default AdminDashboardPage;