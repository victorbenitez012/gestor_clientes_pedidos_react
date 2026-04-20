import { useState, useCallback } from 'react';
import { Pedido, PedidoModificado, FiltrosPedidos, GetPedidosResponse } from '../../../../types/types';
import { api } from '../../../../services/api';
import { haCambiado, formatearPedido, normalizarFecha, obtenerFechaManana } from '../utils/formateadores';

export const usePedidos = (filtros: FiltrosPedidos, paginaActual: number, registrosPorPagina: number = 50) => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [pedidosOriginales, setPedidosOriginales] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [error, setError] = useState('');

    console.log('🔄 usePedidos INIT - filtros:', filtros);
    console.log('🔄 usePedidos INIT - paginaActual:', paginaActual);
    console.log('🔄 usePedidos INIT - registrosPorPagina:', registrosPorPagina);

    const cargarPedidos = useCallback(async () => {
        console.log('🚀 cargarPedidos START');
        setLoading(true);
        setError('');

        try {
            // Construir params correctamente tipados
            const params: any = {
                pagina: paginaActual,
                registros_por_pagina: registrosPorPagina
            };

            // Filtros de texto
            if (filtros.search && filtros.search.trim() !== '') params.search = filtros.search;
            if (filtros.searchSecondary && filtros.searchSecondary.trim() !== '') params.search_secondary = filtros.searchSecondary;
            if (filtros.fechaDesde && filtros.fechaDesde.trim() !== '') params.fecha_desde = filtros.fechaDesde;
            if (filtros.fechaHasta && filtros.fechaHasta.trim() !== '') params.fecha_hasta = filtros.fechaHasta;
            if (filtros.estado && filtros.estado.trim() !== '') params.estado_filtro = filtros.estado;
            if (filtros.tipoEntrega && filtros.tipoEntrega.trim() !== '') params.tipo_entrega_filtro = filtros.tipoEntrega;

            // ⚠️ IMPORTANTE: Convertir repartidorId correctamente
            if (filtros.repartidorId && filtros.repartidorId.trim() !== '') {
                if (filtros.repartidorId === 'null') {
                    params.repartidor_filtro = 'null';  // Buscar sin repartidor
                } else {
                    params.repartidor_filtro = parseInt(filtros.repartidorId, 10);  // Convertir a número
                }
            }

            console.log('📤 Params enviados a API:', params);

            const data: GetPedidosResponse = await api.getPedidos(params);

            console.log('📥 Respuesta completa de API:', data);
            console.log('📊 Total registros:', data.total_registros);
            console.log('📄 Total páginas:', data.total_paginas);
            console.log('📋 Cantidad de pedidos en respuesta:', data.pedidos?.length);

            if (!data.pedidos || !Array.isArray(data.pedidos)) {
                console.error('❌ Error: data.pedidos no es un array', data);
                setError('Formato de datos inválido');
                setLoading(false);
                return;
            }

            const pedidosNormalizados: Pedido[] = data.pedidos.map((pedido: Pedido) => ({
                ...pedido,
                fecha_entrega_programada: normalizarFecha(pedido.fecha_entrega_programada),
                es_programado: pedido.es_programado || 0
            }));

            const pedidosFormateados: Pedido[] = pedidosNormalizados.map((pedido: Pedido) => formatearPedido(pedido));

            console.log('✅ Pedidos formateados:', pedidosFormateados.length);

            setPedidos(pedidosFormateados);
            setPedidosOriginales(JSON.parse(JSON.stringify(pedidosFormateados)));
            setTotalRegistros(data.total_registros);
            setTotalPaginas(data.total_paginas);

            console.log('✅ Estado actualizado - pedidos:', pedidosFormateados.length);

        } catch (err) {
            console.error('❌ Error en cargarPedidos:', err);
            setError('Error al cargar los pedidos');
        } finally {
            setLoading(false);
            console.log('🏁 cargarPedidos END');
        }
    }, [filtros, paginaActual, registrosPorPagina]);

    const actualizarPedido = (index: number, field: keyof Pedido, value: any) => {
        const nuevosPedidos = [...pedidos];
        nuevosPedidos[index] = { ...nuevosPedidos[index], [field]: value };
        setPedidos(nuevosPedidos);
    };

    const actualizarFechaProgramada = (index: number, value: string) => {
        const nuevosPedidos = [...pedidos];
        if (value && value !== '') {
            nuevosPedidos[index] = {
                ...nuevosPedidos[index],
                fecha_entrega_programada: value,
                es_programado: 1
            };
        } else {
            nuevosPedidos[index] = {
                ...nuevosPedidos[index],
                fecha_entrega_programada: null,
                es_programado: 0
            };
        }
        setPedidos(nuevosPedidos);
    };

    const toggleProgramado = (index: number, checked: boolean) => {
        const nuevosPedidos = [...pedidos];
        if (!checked) {
            nuevosPedidos[index] = {
                ...nuevosPedidos[index],
                es_programado: 0,
                fecha_entrega_programada: null
            };
        } else {
            const fechaActual = nuevosPedidos[index].fecha_entrega_programada;
            if (!fechaActual || fechaActual === '' || fechaActual === '0000-00-00') {
                nuevosPedidos[index] = {
                    ...nuevosPedidos[index],
                    es_programado: 1,
                    fecha_entrega_programada: obtenerFechaManana()
                };
            } else {
                nuevosPedidos[index] = {
                    ...nuevosPedidos[index],
                    es_programado: 1
                };
            }
        }
        setPedidos(nuevosPedidos);
    };

    const obtenerPedidosModificados = (): PedidoModificado[] => {
        return pedidos.filter((pedido: Pedido, index: number) => {
            const original = pedidosOriginales[index];
            return original && haCambiado(original, pedido);
        }).map((pedido: Pedido) => {
            let esProgramado = pedido.es_programado || 0;
            let fechaProgramada = null;

            const tieneFechaValida = pedido.fecha_entrega_programada &&
                pedido.fecha_entrega_programada !== '' &&
                pedido.fecha_entrega_programada !== '0000-00-00';

            if (esProgramado === 1 || tieneFechaValida) {
                esProgramado = 1;
                if (tieneFechaValida) {
                    fechaProgramada = pedido.fecha_entrega_programada || null;
                } else {
                    fechaProgramada = obtenerFechaManana();
                }
            }

            return {
                id: pedido.id,
                tipo_pedido: pedido.tipo_pedido,
                garrafa_10kg: pedido.garrafa_10kg || 0,
                garrafa_15kg: pedido.garrafa_15kg || 0,
                garrafa_45kg: pedido.garrafa_45kg || 0,
                estado: pedido.estado,
                precio: pedido.precio,
                observacion_pedido: pedido.observacion_pedido || '',
                repartidor_id: pedido.repartidor_id || null,
                es_programado: esProgramado,
                fecha_entrega_programada: fechaProgramada
            };
        });
    };

    const totales = {
        totalPrecio: pedidos.reduce((sum: number, p: Pedido) => sum + (Number(p.precio) || 0), 0),
        totalGarrafas10kg: pedidos.reduce((sum: number, p: Pedido) => sum + (p.garrafa_10kg || 0), 0),
        totalGarrafas15kg: pedidos.reduce((sum: number, p: Pedido) => sum + (p.garrafa_15kg || 0), 0),
        totalGarrafas45kg: pedidos.reduce((sum: number, p: Pedido) => sum + (p.garrafa_45kg || 0), 0),
    };

    return {
        pedidos,
        pedidosOriginales,
        loading,
        totalRegistros,
        totalPaginas,
        error,
        totales,
        cargarPedidos,
        actualizarPedido,
        actualizarFechaProgramada,
        toggleProgramado,
        obtenerPedidosModificados,
        setPedidos
    };
};