import { Pedido } from '../types/types';

// ============ FUNCIONES PARA CLIENTES ============

export const buscarClientes = async (termino?: string) => {
    const url = termino
        ? `http://localhost/gestor_clientes_pedidos_react/backend/clientes/buscar.php?termino=${termino}`
        : 'http://localhost/gestor_clientes_pedidos_react/backend/clientes/buscar.php';

    const response = await fetch(url);
    return await response.json();
};

export const buscarClientesParaAgregarPedido = async (termino: string) => {
    try {
        const response = await fetch(`/gestor_clientes_pedidos_react/backend/clientes/buscar.php?termino=${termino}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al buscar clientes:', error);
        return [];
    }
};

export const buscarClientesPorDireccionAgregar = async (direccion: string) => {
    try {
        const response = await fetch(`/gestor_clientes_pedidos_react/backend/clientes/buscar_direccion.php?direccion=${direccion}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al buscar por dirección:', error);
        return [];
    }
};

export const agregarClienteApi = async (clienteData: any) => {
    try {
        const response = await fetch('/gestor_clientes_pedidos_react/backend/clientes/agregar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteData)
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al agregar cliente:', error);
        throw error;
    }
};

export const actualizarClienteApi = async (id: number, clienteData: any) => {
    try {
        const response = await fetch(`/gestor_clientes_pedidos_react/backend/clientes/editar.php?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteData)
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        throw error;
    }
};

export const eliminarClienteApi = async (id: number) => {
    try {
        const response = await fetch(`/gestor_clientes_pedidos_react/backend/clientes/eliminar.php?id=${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        throw error;
    }
};

export const buscarClientePorIdApi = async (id: number) => {
    try {
        const response = await fetch(`/gestor_clientes_pedidos_react/backend/clientes/buscar_por_id.php?id=${id}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al buscar cliente:', error);
        throw error;
    }
};

// ============ FUNCIONES PARA REPARTIDORES ============

export const buscarRepartidores = async (termino?: string) => {
    try {
        const url = termino
            ? `/gestor_clientes_pedidos_react/backend/repartidores/buscar.php?termino=${termino}`
            : '/gestor_clientes_pedidos_react/backend/repartidores/index.php';

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al buscar repartidores:', error);
        return [];
    }
};

export const agregarRepartidorApi = async (repartidorData: any) => {
    try {
        const response = await fetch('/gestor_clientes_pedidos_react/backend/repartidores/agregar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(repartidorData)
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al agregar repartidor:', error);
        throw error;
    }
};

export const actualizarRepartidorApi = async (id: number, repartidorData: any) => {
    try {
        const response = await fetch(`/gestor_clientes_pedidos_react/backend/repartidores/editar.php?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(repartidorData)
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al actualizar repartidor:', error);
        throw error;
    }
};

export const eliminarRepartidorApi = async (id: number) => {
    try {
        const response = await fetch(`/gestor_clientes_pedidos_react/backend/repartidores/eliminar.php?id=${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al eliminar repartidor:', error);
        throw error;
    }
};

export const buscarRepartidorPorIdApi = async (id: number) => {
    try {
        const response = await fetch(`/gestor_clientes_pedidos_react/backend/repartidores/buscar_por_id.php?id=${id}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al buscar repartidor:', error);
        throw error;
    }
};

// ============ FUNCIONES PARA PEDIDOS ============

export const fetchPedidos = async (
    search: string,
    searchSecondary: string,
    fechaDesde: string,
    fechaHasta: string
): Promise<Pedido[]> => {
    try {
        const url = new URL('http://localhost/gestor_clientes_pedidos_react/backend/pedidos/editar_tabla.php');
        if (search) url.searchParams.append('search', search);
        if (searchSecondary) url.searchParams.append('search_secondary', searchSecondary);
        if (fechaDesde) url.searchParams.append('fecha_desde', fechaDesde);
        if (fechaHasta) url.searchParams.append('fecha_hasta', fechaHasta);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();

        if (Array.isArray(data)) {
            return data;
        } else if (data.pedidos && Array.isArray(data.pedidos)) {
            return data.pedidos;
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error en fetchPedidos:', error);
        throw error;
    }
};

export const guardarCambios = async (pedidos: Pedido[]): Promise<void> => {
    try {
        const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/pedidos/editar_tabla.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pedidos, update_all: true }),
        });

        if (!response.ok) throw new Error('Error al guardar los cambios');

        const data = await response.json();
        console.log('Cambios guardados:', data);
    } catch (error) {
        console.error('Error al guardar cambios:', error);
        throw error;
    }
};

export const agregarPedidoCompleto = async (pedidoData: any) => {
    try {
        const response = await fetch('/gestor_clientes_pedidos_react/backend/pedidos/agregar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoData)
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al agregar pedido:', error);
        throw error;
    }
};

export const obtenerUltimosPedidosClienteAgregar = async (clienteId: number) => {
    try {
        const response = await fetch(`/gestor_clientes_pedidos_react/backend/pedidos/obtener_ultimos_pedidos.php?cliente_id=${clienteId}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al obtener últimos pedidos:', error);
        return [];
    }
};

// ============ FUNCIONES PARA CONTADORES ============

const convertirTotalANumero = (data: { total: string | number }) => {
    return typeof data.total === 'string' ? parseInt(data.total, 10) : data.total;
};

export const contarRegistros = async (tabla: string) => {
    try {
        const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/contar_registros.php?tabla=${tabla}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        return convertirTotalANumero(data) || 0;
    } catch (error) {
        console.error('Error contando registros:', error);
        throw error;
    }
};

export const contarPedidosPorEstado = async (estado: string) => {
    try {
        const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/contar_pedidos.php?estado=${estado}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        return convertirTotalANumero(data) || 0;
    } catch (error) {
        console.error('Error contando pedidos por estado:', error);
        throw error;
    }
};
