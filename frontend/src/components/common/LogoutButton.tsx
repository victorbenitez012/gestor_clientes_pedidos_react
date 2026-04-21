import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

interface LogoutButtonProps {
    className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className = '' }) => {
    const { logout } = useAuthContext();
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
            await logout();
            navigate('/login');
        }
    };

    return (
        <button
            onClick={handleLogout}
            className={`logout-button ${className}`}
            title="Cerrar sesión"
        >
            🚪 Salir
        </button>
    );
};

export default LogoutButton;
