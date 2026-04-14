// ============ CLIENTES ============

// Buscar clientes con paginación
export const buscarClientes = async (search?: string, pagina: number = 1, registrosPorPagina: number = 50) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('pagina', pagina.toString());
    params.append('registros_por_pagina', registrosPorPagina.toString());

    const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/clientes/buscar.php?${params.toString()}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || 'Error al buscar clientes');
    }

    return data;
};

// Buscar clientes para agregar pedido (autocompletado)
export const buscarClientesParaAgregarPedido = async (search: string) => {
    const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/clientes/buscar.php?search=${encodeURIComponent(search)}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error('Error al buscar clientes');
    }

    if (data.clientes && Array.isArray(data.clientes)) {
        return data.clientes;
    }

    return Array.isArray(data) ? data : [];
};

// Buscar clientes por dirección para agregar pedido
export const buscarClientesPorDireccionAgregar = async (search: string) => {
    const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/clientes/buscar_direccion.php?search=${encodeURIComponent(search)}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error('Error al buscar por dirección');
    }

    return Array.isArray(data) ? data : [];
};

// Actualizar cliente
export const actualizarCliente = async (id: number, cliente: any) => {
    const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/clientes/actualizar.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...cliente }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || 'Error al actualizar el cliente');
    }

    return data;
};

// Agregar cliente
export const agregarClienteApi = async (cliente: any) => {
    const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/clientes/agregar.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cliente),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || 'Error al guardar el cliente');
    }

    return data;
};

// ============ PEDIDOS ============

// Cargar pedidos con filtros y paginación
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

    const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/pedidos/editar_tabla.php?${queryParams.toString()}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error('Error al cargar pedidos');
    }

    return data;
};

// Guardar cambios de pedidos
export const guardarCambios = async (pedidos: any[]) => {
    const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/pedidos/editar_tabla.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pedidos, update_all: true }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Error al guardar cambios');
    }

    return data;
};

// Agregar pedido completo
export const agregarPedidoCompleto = async (pedidoData: any) => {
    const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/pedidos/agregar.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedidoData),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || 'Error al agregar pedido');
    }

    return data;
};

// Obtener últimos pedidos de un cliente
export const obtenerUltimosPedidosClienteAgregar = async (clienteId: number) => {
    const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/pedidos/obtener_ultimos_pedidos.php?cliente_id=${clienteId}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error('Error al cargar últimos pedidos');
    }

    return Array.isArray(data) ? data : [];
};

// ============ REPARTIDORES ============

// Obtener todos los repartidores (activos) - SIN parámetros
export const buscarRepartidores = async () => {
    const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/repartidores/index.php', {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error('Error al cargar repartidores');
    }

    return Array.isArray(data) ? data : [];
};

// Buscar repartidores por término (nombre, apellido, teléfono) - CON búsqueda
export const buscarRepartidoresPorTermino = async (search: string) => {
    const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/repartidores/buscar.php?search=${encodeURIComponent(search)}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error('Error al buscar repartidores');
    }

    return Array.isArray(data) ? data : [];
};

// Agregar repartidor
export const agregarRepartidorApi = async (repartidor: any) => {
    const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/repartidores/agregar.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(repartidor),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || 'Error al guardar el repartidor');
    }

    return data;
};

// Actualizar repartidor
export const actualizarRepartidorApi = async (id: number, repartidor: any) => {
    const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/repartidores/actualizar.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...repartidor }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || 'Error al actualizar el repartidor');
    }

    return data;
};

// Eliminar repartidor
export const eliminarRepartidorApi = async (id: number) => {
    const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/repartidores/eliminar.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || 'Error al eliminar el repartidor');
    }

    return data;
};

// ============ ESTADÍSTICAS ============

// Contar registros de una tabla
export const contarRegistros = async (tabla: string) => {
    const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/contar_registros.php?tabla=${tabla}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || 'Error al contar registros');
    }

    return data.total || 0;
};

// Contar pedidos por estado - CORREGIDO
export const contarPedidosPorEstado = async (estado: string) => {
    const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/contar_pedidos_estado.php?estado=${estado}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || 'Error al contar pedidos');
    }

    return data.total || 0;
};