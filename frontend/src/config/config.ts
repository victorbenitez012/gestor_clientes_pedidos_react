// ============================================
// Configuración de la aplicación
// ============================================

// URL base de la API (sin trailing slash)
export const API_BASE_URL = (() => {
    const envUrl = process.env.REACT_APP_API_URL;
    if (envUrl) return envUrl.replace(/\/$/, '');
    return 'http://localhost/gestor_clientes_pedidos_react/backend';
})();

// Configuración de paginación
export const DEFAULT_PAGE_SIZE = 50;

// Estados de pedidos
export const ESTADOS_PEDIDO = ['Pendiente', 'En Proceso', 'Entregado', 'Cancelado', 'Finalizado', 'Cuenta'] as const;

// Tipos de entrega
export const TIPOS_ENTREGA = ['inmediato', 'programado'] as const;

// Tiempo de expiración del token (en milisegundos)
export const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000; // 24 horas
