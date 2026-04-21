import { API_BASE_URL } from '../config/config';

// ============================================
// Tipos
// ============================================
export interface User {
    id: number;
    username: string;
    nombre: string;
    apellido?: string;
    email?: string;
    telefono?: string;
    rol: 'admin' | 'usuario' | 'repartidor';
    nombre_completo: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: User;
}

export interface Usuario {
    id: number;
    username: string;
    nombre: string;
    apellido?: string;
    email?: string;
    telefono?: string;
    rol: string;
    activo: boolean;
    ultimo_acceso?: string;
    created_at?: string;
    nombre_completo: string;
}

// ============================================
// Token Management
// ============================================
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';

export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const getAuthHeaders = (): HeadersInit => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

// ============================================
// Login / Logout
// ============================================
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login_jwt.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
    }

    if (data.success && data.token) {
        setToken(data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
};

export const logout = async (): Promise<void> => {
    // El backend no necesita nada más que invalidar el token del lado del cliente
    removeToken();
};

// ============================================
// Verificación de Token
// ============================================
export const verifyToken = async (): Promise<{ valid: boolean; user?: User }> => {
    const token = getToken();

    if (!token) {
        return { valid: false };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify_token.php`, {
            method: 'GET',
            credentials: 'include',
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (data.valid && data.user) {
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            return { valid: true, user: data.user };
        }

        // Token inválido, limpiar
        removeToken();
        return { valid: false };
    } catch (error) {
        removeToken();
        return { valid: false };
    }
};

// ============================================
// Recuperación de Contraseña
// ============================================
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string; dev_link?: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/recuperar_password.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al solicitar recuperación');
    }

    return data;
};

export const resetPassword = async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/restablecer_password.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al restablecer contraseña');
    }

    return data;
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/cambiar_password.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar contraseña');
    }

    return data;
};

// ============================================
// Gestión de Usuarios (Admin)
// ============================================
export const getUsuarios = async (): Promise<Usuario[]> => {
    const response = await fetch(`${API_BASE_URL}/auth/usuarios.php`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al obtener usuarios');
    }

    return data.usuarios || [];
};

export const crearUsuario = async (usuario: Partial<Usuario> & { password: string }): Promise<{ success: boolean; message: string; user?: Usuario }> => {
    const response = await fetch(`${API_BASE_URL}/auth/usuarios.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(usuario),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al crear usuario');
    }

    return data;
};

export const actualizarUsuario = async (id: number, usuario: Partial<Usuario>): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/usuarios.php`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, ...usuario }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar usuario');
    }

    return data;
};

export const eliminarUsuario = async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/usuarios.php`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar usuario');
    }

    return data;
};

// ============================================
// Helpers
// ============================================
export const getCurrentUser = (): User | null => {
    const userString = localStorage.getItem(USER_KEY);
    if (userString) {
        try {
            return JSON.parse(userString);
        } catch {
            return null;
        }
    }
    return null;
};

export const hasRole = (user: User | null, roles: string | string[]): boolean => {
    if (!user) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.rol);
};

export const isAdmin = (user: User | null): boolean => {
    return user?.rol === 'admin';
};
