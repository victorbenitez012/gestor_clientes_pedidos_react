import React from 'react';
import { useAuthContext } from '../../context/AuthContext';

const UserInfo: React.FC = () => {
    const { user, isAdmin } = useAuthContext();

    if (!user) return null;

    return (
        <div className="user-info">
            <div className="user-avatar">
                {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
                <span className="user-name">{user.nombre_completo}</span>
                <span className={`user-role ${user.rol}`}>
                    {isAdmin() ? '👑 Administrador' : '👤 Usuario'}
                </span>
            </div>
        </div>
    );
};

export default UserInfo;
