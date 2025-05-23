// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function AdminRoute() {
    const authToken = localStorage.getItem('authToken');
    const userInfoString = localStorage.getItem('userInfo');
    let isAdmin = false;
    let isAuthenticated = !!authToken; // Convertit en booléen

    if (isAuthenticated && userInfoString) {
        try {
            const userInfo = JSON.parse(userInfoString);
            isAdmin = userInfo.role === 'admin';
        } catch (error) {
            console.error("Erreur parsing userInfo dans AdminRoute:", error);
            // En cas d'erreur de parsing, considérer comme non authentifié/non admin
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
            isAuthenticated = false;
            isAdmin = false;
        }
    }

    console.log(`AdminRoute Check: Authenticated? ${isAuthenticated}, IsAdmin? ${isAdmin}`);

    if (!isAuthenticated) {
        // Si pas de token (non authentifié), rediriger vers login
        // 'replace' évite que la route /admin ne soit dans l'historique de navigation
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        // Si authentifié MAIS pas admin, rediriger vers le dashboard client
        console.warn("Accès admin refusé pour utilisateur non-admin. Redirection vers /dashboard.");
        return <Navigate to="/dashboard" replace />;
    }

    // Si authentifié ET admin, afficher le contenu de la route enfant
    return <Outlet />;
}

export default AdminRoute;