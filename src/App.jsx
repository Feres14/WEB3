// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';

// Importer les composants de page
import LoginPage from './pages/LoginPage.jsx';
import AccountRequestPage from './pages/AccountRequestPage.jsx';
import ApplyCreditPage from './pages/ApplyCreditPage.jsx';
import MyApplicationsPage from './pages/MyApplicationsPage.jsx';
import EditApplicationPage from './pages/EditApplicationPage.jsx';

// --- Importer les composants Admin ---
import AdminRoute from './components/AdminRoute.jsx'; // Le composant de protection
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'; // Le tableau de bord Admin
import ManageCreditRequestsPage from './pages/ManageCreditRequestsPage.jsx'; // Pour lister les crédits (admin)
import CreditDetailPageAdmin from './pages/CreditDetailPageAdmin.jsx'; // <-- NOUVEL IMPORT
// import ManageUsersPage from './pages/ManageUsersPage.jsx'; // À créer si besoin

// Importer les icônes
import { FaFacebookF, FaInstagram, FaYoutube, FaPhoneAlt } from 'react-icons/fa';

// Importer le fichier CSS
import './App.css';

// --- Composants Simples pour Pages ---
function HomePage() {
  return (
    <div>
      <h2>Bienvenue sur le Portail Crédit Facile BNA</h2>
      <p style={{ marginBottom: '30px' }}>Connectez-vous pour accéder à vos services ou demandez un compte.</p>
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
         <NavLink to="/login"><button>Se connecter</button></NavLink>
         <NavLink to="/request-account"><button style={{ backgroundColor: '#6c757d' }}>Demander un Compte</button></NavLink>
      </nav>
    </div>
  );
}

// Tableau de bord CLIENT
function DashboardPage() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const navigate = useNavigate();
  const handleLogout = () => { localStorage.removeItem('authToken'); localStorage.removeItem('userInfo'); navigate('/login'); };
  return (
    <div>
      <h2>Tableau de Bord (Client)</h2>
      <p>Bienvenue, {userInfo.username || 'Utilisateur'} !</p>
      <nav style={{ margin: '20px 0', borderTop: '1px solid var(--bna-border-color)', borderBottom: '1px solid var(--bna-border-color)', padding: '15px 0' }}>
         {userInfo.role === 'client' && (
            <>
                <NavLink to="/apply-credit" style={navLinkStyles}>Nouvelle Demande</NavLink>
                <NavLink to="/my-applications" style={navLinkStyles}>Mes Demandes</NavLink>
            </>
         )}
        <button onClick={handleLogout} style={{ marginLeft: '30px', backgroundColor: '#6c757d' }}>Se déconnecter</button>
      </nav>
      <p>Contenu du tableau de bord client à venir...</p>
    </div>
  );
}

// Styles pour NavLink (peut être partagé)
const navLinkStyles = ({ isActive }) => ({
    fontWeight: isActive ? 'bold' : 'normal',
    margin: '0 15px',
    color: isActive ? 'var(--bna-green-darker)' : 'var(--bna-green)',
    textDecoration: 'none',
});


// --- Composant Principal App ---
function App() {
  return (
    <Router>
      <div className="App bna-theme">
        <header className="app-header">
           <img src="/bna-logo.png" alt="BNA Logo" className="logo"/>
           <h1>Application Crédit Facile</h1>
        </header>
        <main className="app-main">
          <Routes>
            {/* Routes Publiques */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/request-account" element={<AccountRequestPage />} />
            <Route path="/" element={<HomePage />} />

            {/* Routes Client */}
            <Route path="/dashboard" element={<DashboardPage />} /> {/* Pourrait être protégé */}
            <Route path="/apply-credit" element={<ApplyCreditPage />} /> {/* Protégé dans le composant */}
            <Route path="/my-applications" element={<MyApplicationsPage />} /> {/* Protégé dans le composant */}
            <Route path="/edit-application/:id" element={<EditApplicationPage />} /> {/* Protégé dans le composant */}

            {/* --- ROUTES ADMIN PROTÉGÉES --- */}
            <Route path="/admin" element={<AdminRoute />}> {/* Protection pour toutes les routes /admin/* */}
                <Route index element={<AdminDashboardPage />} /> {/* /admin -> AdminDashboardPage */}
                <Route path="dashboard" element={<AdminDashboardPage />} /> {/* /admin/dashboard */}
                <Route path="credits-management" element={<ManageCreditRequestsPage />} /> {/* /admin/credits-management */}
                {/* --- NOUVELLE ROUTE ADMIN POUR DÉTAIL CRÉDIT --- */}
                <Route path="credits/:id" element={<CreditDetailPageAdmin />} /> {/* /admin/credits/:id */}
                {/* --------------------------------------------- */}
                {/* <Route path="users-management" element={<ManageUsersPage />} /> */}
            </Route>
            {/* --- FIN ROUTES ADMIN --- */}

            {/* Route 404 */}
            <Route path="*" element={ <div><h2>Page non trouvée (404)</h2><Link to="/"><button>Retour à l'accueil</button></Link></div> } />
          </Routes>
        </main>
        <footer className="app-footer">
            <div className="footer-contact-info"> <FaPhoneAlt style={{ marginRight: '8px', verticalAlign: 'middle' }} /> <span>Contactez-nous : 70 026 000</span> </div>
            <div className="footer-social-links"> <a href="https://www.facebook.com/BNA.Assurances" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook BNA"><FaFacebookF /></a> <a href="https://www.instagram.com/bna.assurances/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram BNA"><FaInstagram /></a> <a href="https://www.youtube.com/@BanqueNationaleAgricoleBNA" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube BNA"><FaYoutube /></a> </div>
            <p>© {new Date().getFullYear()} BNA Bank - Tous droits réservés.</p>
        </footer>
      </div>
    </Router>
  );
}
export default App;