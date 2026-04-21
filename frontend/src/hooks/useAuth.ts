// ============================================
// Hook de Autenticación (JWT)
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
    login as loginService,
    logout as logoutService,
    verifyToken,
    getCurrentUser,
    User,
    LoginResponse
} from '../services/authService';

interface UseAuthReturn {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<LoginResponse>;
    logout: () => Promise<void>;
    hasRole: (roles: string | string[]) => boolean;
    isAdmin: () => boolean;
    clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Verificar token al montar
    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);
            try {
                // Intentar obtener usuario del localStorage
                const storedUser = getCurrentUser();
                if (storedUser) {
                    setUser(storedUser);
                }

                // Verificar token con el backend
                const result = await verifyToken();

                if (result.valid && result.user) {
                    setUser(result.user);
                } else {
                    // Token inválido, limpiar estado
                    setUser(null);
                }
            } catch (err) {
                console.error('Error verificando autenticación:', err);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    /**
     * Iniciar sesión
     */
    const login = useCallback(async (username: string, password: string): Promise<LoginResponse> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await loginService(username, password);

            if (response.success && response.user) {
                setUser(response.user);
                return response;
            } else {
                setError(response.message || 'Error al iniciar sesión');
                return response;
            }
        } catch (err: any) {
            const message = err.message || 'Error al iniciar sesión';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Cerrar sesión
     */
    const logout = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            await logoutService();
        } catch (err) {
            console.error('Error cerrando sesión:', err);
        } finally {
            setUser(null);
            setError(null);
            setIsLoading(false);
        }
    }, []);

    /**
     * Verificar rol
     */
    const hasRole = useCallback((roles: string | string[]): boolean => {
        if (!user) return false;
        const rolesArray = Array.isArray(roles) ? roles : [roles];
        return rolesArray.includes(user.rol);
    }, [user]);

    /**
     * Verificar si es admin
     */
    const isAdmin = useCallback((): boolean => {
        return user?.rol === 'admin';
    }, [user]);

    /**
     * Limpiar error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        hasRole,
        isAdmin,
        clearError,
    };
};
