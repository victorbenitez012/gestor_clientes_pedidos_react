import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
    children: React.ReactNode;
    roleRequired?: string | string[]; // Opcional: si no se especifica, solo verifica autenticación
}

const PrivateRoute = ({ children, roleRequired }: PrivateRouteProps) => {
    // Obtener el usuario del localStorage
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    // Si no hay usuario, redirigir a /login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Si se especifica un rol requerido, verificar acceso
    if (roleRequired) {
        const hasAccess = Array.isArray(roleRequired)
            ? roleRequired.includes(user.rol) // Si se requiere múltiples roles
            : user.rol === roleRequired; // Si se requiere un solo rol

        // Si no tiene acceso, redirigir a /dashboard
        if (!hasAccess) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // Si tiene acceso, renderizar los children
    return <>{children}</>;
};

export default PrivateRoute;