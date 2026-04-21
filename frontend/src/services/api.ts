import { API_BASE_URL } from '../config/config';
import { getToken, removeToken } from './authService';

// ============================================
// Helper para manejar respuestas
// ============================================
const handleResponse = async (response: Response) => {
    // Manejar errores de autenticación
    if (response.status === 401) {
        // Limpiar token y redirigir a login
        removeToken();
        window.location.href = '/gestor_clientes_pedidos_react/login';
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }

    if (response.status === 403) {
        throw new Error('No tiene permisos para realizar esta acción.');
    }

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || data.message || `Error HTTP ${response.status}`);
    }

    return data;
};

// ============================================
// Opciones por defecto para fetch
// ============================================
const getDefaultOptions = (): RequestInit => {
    const token = getToken();
    return {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
    };
};

// ============================================
// CLIENTES
// ============================================

export const buscarClientes = async (search?: string, pagina: number = 1, registrosPorPagina: number = 50) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('pagina', pagina.toString());
    params.append('registros_por_pagina', registrosPorPagina.toString());

    const response = await fetch(
        `${API_BASE_URL}/clientes/buscar.php?${params.toString()}`,
        getDefaultOptions()
    );
    return handleResponse(response);
};

export const buscarClientesParaAgregarPedido = async (search: string) => {
    const response = await fetch(
        `${API_BASE_URL}/clientes/buscar.php?search=${encodeURIComponent(search)}`,
        getDefaultOptions()
    );
    const data = await handleResponse(response);
    return data.clientes || data;
};

export const buscarClientesPorDireccionAgregar = async (search: string) => {
    const response = await fetch(
        `${API_BASE_URL}/clientes/buscar_direccion.php?search=${encodeURIComponent(search)}`,
        getDefaultOptions()
    );
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
};

export const actualizarCliente = async (id: number, cliente: any) => {
    const response = await fetch(`${API_BASE_URL}/clientes/actualizar.php`, {
        ...getDefaultOptions(),
        method: 'POST',
        body: JSON.stringify({ id, ...cliente }),
    });
    return handleResponse(response);
};

export const agregarClienteApi = async (cliente: any) => {
    const response = await fetch(`${API_BASE_URL}/clientes/agregar.php`, {
        ...getDefaultOptions(),
        method: 'POST',
        body: JSON.stringify(cliente),
    });
    return handleResponse(response);
};

// ============================================
// PEDIDOS
// ============================================

export const fetchPedidos = async (params: {
    search?: string;
    search_secondary?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    repartidor_filtro?: string;
    estado_filtro?: string;
    pagina?: number;
    registros_por_pagina?: number;
}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            queryParams.append(key, value.toString());
        }
    });

    const response = await fetch(
        `${API_BASE_URL}/pedidos/editar_tabla.php?${queryParams.toString()}`,
        getDefaultOptions()
    );
    return handleResponse(response);
};

export const guardarCambios = async (pedidos: any[]) => {
    const response = await fetch(`${API_BASE_URL}/pedidos/editar_tabla.php`, {
        ...getDefaultOptions(),
        method: 'POST',
        body: JSON.stringify({ pedidos, update_all: true }),
    });
    return handleResponse(response);
};

export const agregarPedidoCompleto = async (pedidoData: any) => {
    const response = await fetch(`${API_BASE_URL}/pedidos/agregar.php`, {
        method: 'POST',
        credentials: 'include',
        body: pedidoData, // FormData no necesita Content-Type: application/json
    });
    return handleResponse(response);
};

export const obtenerUltimosPedidosClienteAgregar = async (clienteId: number) => {
    const response = await fetch(
        `${API_BASE_URL}/pedidos/obtener_ultimos_pedidos.php?cliente_id=${clienteId}`,
        getDefaultOptions()
    );
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
};

// ============================================
// REPARTIDORES
// ============================================

export const buscarRepartidores = async () => {
    const response = await fetch(`${API_BASE_URL}/repartidores/index.php`, getDefaultOptions());
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
};

export const buscarRepartidoresPorTermino = async (search: string) => {
    const response = await fetch(
        `${API_BASE_URL}/repartidores/buscar.php?search=${encodeURIComponent(search)}`,
        getDefaultOptions()
    );
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
};

export const agregarRepartidorApi = async (repartidor: any) => {
    const response = await fetch(`${API_BASE_URL}/repartidores/agregar.php`, {
        ...getDefaultOptions(),
        method: 'POST',
        body: JSON.stringify(repartidor),
    });
    return handleResponse(response);
};

export const actualizarRepartidorApi = async (id: number, repartidor: any) => {
    const response = await fetch(`${API_BASE_URL}/repartidores/actualizar.php`, {
        ...getDefaultOptions(),
        method: 'POST',
        body: JSON.stringify({ id, ...repartidor }),
    });
    return handleResponse(response);
};

export const eliminarRepartidorApi = async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/repartidores/eliminar.php`, {
        ...getDefaultOptions(),
        method: 'POST',
        body: JSON.stringify({ id }),
    });
    return handleResponse(response);
};

// ============================================
// ESTADÍSTICAS
// ============================================

export const contarRegistros = async (tabla: string) => {
    const response = await fetch(
        `${API_BASE_URL}/contar_registros.php?tabla=${tabla}`,
        getDefaultOptions()
    );
    const data = await handleResponse(response);
    return data.total || 0;
};

export const contarPedidosPorEstado = async (estado: string) => {
    const response = await fetch(
        `${API_BASE_URL}/contar_pedidos_estado.php?estado=${estado}`,
        getDefaultOptions()
    );
    const data = await handleResponse(response);
    return data.total || 0;
};

// ============================================
// API PARA EditarTablaPedidos
// ============================================

export const pedidosApi = {
    getPedidos: async (params: any) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(
            `${API_BASE_URL}/pedidos/editar_tabla.php?${queryString}`,
            getDefaultOptions()
        );
        return handleResponse(response);
    },

    updatePedidos: async (pedidos: any[]) => {
        const response = await fetch(`${API_BASE_URL}/pedidos/editar_tabla.php`, {
            ...getDefaultOptions(),
            method: 'POST',
            body: JSON.stringify({ pedidos, update_all: true }),
        });
        return handleResponse(response);
    },

    getRepartidores: async () => {
        const response = await fetch(`${API_BASE_URL}/repartidores/index.php`, getDefaultOptions());
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : [];
    },
};

// ============================================
// EXPORT LEGACY (para compatibilidad)
// ============================================

export const api = {
    getRepartidores: pedidosApi.getRepartidores,
    getPedidos: pedidosApi.getPedidos,
    guardarPedidos: pedidosApi.updatePedidos,
};

export default api;
