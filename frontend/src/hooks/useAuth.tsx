// src/hooks/useAuth.tsx
import { useState, useEffect, useCallback } from 'react';
import {
    getToken,
    getCurrentUser,
    removeToken,
    login as loginService,
    logout as logoutService,
    verifyToken,
    User,
    LoginResponse,
    hasRole as hasRoleService,
    isAdmin as isAdminService
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

// Asegurarnos de que la función esté exportada correctamente
export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Verificar autenticación al montar
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
                    removeToken();
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
            return {
                success: false,
                message
            };
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
            // Redirigir al login
            window.location.href = '/login';
        }
    }, []);

    /**
     * Verificar si tiene un rol específico
     */
    const hasRole = useCallback((roles: string | string[]): boolean => {
        return hasRoleService(user, roles);
    }, [user]);

    /**
     * Verificar si es administrador
     */
    const isAdmin = useCallback((): boolean => {
        return isAdminService(user);
    }, [user]);

    /**
     * Limpiar errores
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
}

// Exportación por defecto
export default useAuth;