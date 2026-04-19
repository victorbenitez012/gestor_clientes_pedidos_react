import { Pedido } from '../../../../types/types';

export const capitalizarPalabras = (texto: string): string => {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .split(' ')
        .map(palabra => {
            if (palabra.length > 0 && !/^\d+$/.test(palabra)) {
                return palabra.charAt(0).toUpperCase() + palabra.slice(1);
            }
            return palabra;
        })
        .join(' ');
};

export const capitalizarPrimeraLetra = (texto: string): string => {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

export const formatearPedido = (pedido: Pedido): Pedido => {
    return {
        ...pedido,
        tipo_pedido: capitalizarPalabras(pedido.tipo_pedido),
        observacion_pedido: capitalizarPrimeraLetra(pedido.observacion_pedido || ''),
        cliente_nombre: capitalizarPalabras(pedido.cliente_nombre),
        direccion: capitalizarPalabras(pedido.direccion),
        barrio: capitalizarPalabras(pedido.barrio),
        cliente_observacion: capitalizarPrimeraLetra(pedido.cliente_observacion || '')
    };
};

export const formatearFecha = (fecha: string | null | undefined): string => {
    if (!fecha || fecha === '0000-00-00') return 'Inmediato';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
};

export const normalizarFecha = (fecha: string | null | undefined): string | null => {
    if (!fecha || fecha === '0000-00-00') return null;
    return fecha;
};

export const haCambiado = (original: Pedido, actual: Pedido): boolean => {
    const fechaOriginal = original.fecha_entrega_programada === '0000-00-00' ? null : original.fecha_entrega_programada;
    const fechaActual = actual.fecha_entrega_programada === '0000-00-00' ? null : actual.fecha_entrega_programada;

    return original.tipo_pedido !== actual.tipo_pedido ||
        original.garrafa_10kg !== actual.garrafa_10kg ||
        original.garrafa_15kg !== actual.garrafa_15kg ||
        original.garrafa_45kg !== actual.garrafa_45kg ||
        original.estado !== actual.estado ||
        Number(original.precio) !== Number(actual.precio) ||
        original.observacion_pedido !== actual.observacion_pedido ||
        original.repartidor_id !== actual.repartidor_id ||
        fechaOriginal !== fechaActual ||
        (original.es_programado || 0) !== (actual.es_programado || 0);
};

export const obtenerFechaManana = (): string => {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    return manana.toISOString().split('T')[0];
};