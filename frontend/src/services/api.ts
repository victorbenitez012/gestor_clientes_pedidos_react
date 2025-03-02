import { Pedido } from '../types/types';

// Ejemplo de contenido para api.ts
export const buscarClientes = async () => {
    const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/clientes/buscar.php');
    return await response.json();
};

// Función genérica para convertir 'total' a número
const convertirTotalANumero = (data: { total: string | number }) => {
    return typeof data.total === 'string' ? parseInt(data.total, 10) : data.total;
};

// Ejemplo en contarRegistros
export const contarRegistros = async (tabla: string) => {
    try {
        const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/contar_registros.php?tabla=${tabla}`);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        return convertirTotalANumero(data) || 0;
    } catch (error) {
        console.error('Error contando registros:', error);
        throw error;
    }
};

// Ejemplo en contarPedidosPorEstado
export const contarPedidosPorEstado = async (estado: string) => {
    try {
        const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/contar_pedidos.php?estado=${estado}`);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        return convertirTotalANumero(data) || 0;
    } catch (error) {
        console.error('Error contando pedidos por estado:', error);
        throw error;
    }
};

/**
 * Función para obtener los pedidos desde el backend.
 */
export const fetchPedidos = async (
    search: string,
    searchSecondary: string,
    fechaDesde: string,
    fechaHasta: string
): Promise<Pedido[]> => {
    try {
        // Construir la URL con los parámetros de búsqueda
        const url = new URL('http://localhost/gestor_clientes_pedidos_react/backend/pedidos/editar_tabla.php');
        url.searchParams.append('search', search);
        url.searchParams.append('search_secondary', searchSecondary);
        url.searchParams.append('fecha_desde', fechaDesde);
        url.searchParams.append('fecha_hasta', fechaHasta);

        // Realizar la solicitud HTTP
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        // Parsear la respuesta como JSON
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en fetchPedidos:', error);
        throw error;
    }
};
export const guardarCambios = async (pedidos: Pedido[]): Promise<void> => {
    try {
        const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/pedidos/editar_tabla.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pedidos }),
        });

        if (!response.ok) {
            throw new Error('Error al guardar los cambios');
        }

        const data = await response.json();
        console.log('Cambios guardados:', data);
    } catch (error) {
        console.error('Error al guardar cambios:', error);
        throw error;
    }
};
