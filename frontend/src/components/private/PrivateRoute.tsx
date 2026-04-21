import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

interface PrivateRouteProps {
    children: React.ReactNode;
    roleRequired?: string | string[];
}

const PrivateRoute = ({ children, roleRequired }: PrivateRouteProps) => {
    const { user, isAuthenticated, isLoading } = useAuthContext();

    // Mostrar loading mientras se verifica la sesión
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                Verificando sesión...
            </div>
        );
    }

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Si se especifica un rol requerido, verificar acceso
    if (roleRequired) {
        const requiredRoles = Array.isArray(roleRequired) ? roleRequired : [roleRequired];
        const hasAccess = requiredRoles.includes(user.rol);

        if (!hasAccess) {
            // Si no tiene acceso, redirigir a /dashboard
            return <Navigate to="/dashboard" replace />;
        }
    }

    // Si tiene acceso, renderizar los children
    return <>{children}</>;
};

export default PrivateRoute;
