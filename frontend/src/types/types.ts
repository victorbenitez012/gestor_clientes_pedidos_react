export interface Pedido {
    id: number;
    tipo_pedido: string;
    estado: string;
    precio: number;
    observacion_pedido: string;
    repartidor_id: number | null;
    fecha_creacion: string;
    garrafa_10kg: number;
    garrafa_15kg: number;
    garrafa_45kg: number;
    direccion: string;
    barrio: string;
    telefono: string;
    cliente_nombre: string;
    cliente_observacion: string;
    repartidor_nombre?: string;
    repartidor_apellido?: string;
    fecha_entrega_programada?: string | null;
    es_programado?: number;
}

export interface Repartidor {
    id: number;
    nombre: string;
    apellido: string;
    telefono?: string;
}

export interface Cliente {
    id: number;
    nombre: string;
    direccion: string;
    barrio: string;
    telefono: string;
    observacion: string;
    fecha_registro?: string;
}

export interface ClienteRow {
    id: number;
    nombre: string;
    direccion: string;
    barrio: string;
    telefono: string;
    observacion?: string;
}

export interface RepartidorRow {
    id: number;
    nombre: string;
    apellido: string;
    telefono?: string;
    direccion?: string;
    observacion?: string;
}

export type ClaveEditablePedido = keyof Pick<Pedido,
    'tipo_pedido' | 'estado' | 'precio' | 'observacion_pedido' | 'repartidor_id' |
    'garrafa_10kg' | 'garrafa_15kg' | 'garrafa_45kg'
>;

export type ValorEditablePedido = {
    [K in ClaveEditablePedido]: Pedido[K];
};

export interface FiltrosPedidos {
    search: string;
    searchSecondary: string;
    fechaDesde: string;
    fechaHasta: string;
    repartidorId: string;
    estado: string;
    tipoEntrega: string;
}

export interface PedidoModificado {
    id: number;
    tipo_pedido: string;
    garrafa_10kg: number;
    garrafa_15kg: number;
    garrafa_45kg: number;
    estado: string;
    precio: number;
    observacion_pedido: string;
    repartidor_id: number | null;
    es_programado: number;
    fecha_entrega_programada: string | null;
}

// ========== INTERFACES ADICIONALES PARA EditarTablaPedidos ==========

export interface ModalState {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    onConfirm?: () => void;
    onCancel?: () => void;
    whatsappUrl?: string | null;
}

// Para los parámetros de API
export interface GetPedidosParams {
    search?: string;
    search_secondary?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    repartidor_filtro?: string;
    estado_filtro?: string;
    tipo_entrega_filtro?: string;
    pagina?: number;
    registros_por_pagina?: number;
}

// Respuesta de la API de pedidos
export interface GetPedidosResponse {
    pedidos: Pedido[];
    total_registros: number;
    total_paginas: number;
}

// Respuesta de guardar pedidos
export interface GuardarPedidosResponse {
    mensaje?: string;
    error?: string;
    mensajesWhatsapp?: string[];
}

// Totales para mostrar en la tabla
export interface TotalesPedidos {
    totalPrecio: number;
    totalGarrafas10kg: number;
    totalGarrafas15kg: number;
    totalGarrafas45kg: number;
}

// Totales para impresión
export interface TotalesImpresion {
    total10kg: number;
    total15kg: number;
    total45kg: number;
    totalPrecio: number;
}

// Props para componentes
export interface InputTextProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: (value: string) => void;
    placeholder?: string;
}

export interface InputNumberProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    step?: number;
}

export interface InputPrecioProps {
    value: number;
    onChange: (value: number) => void;
}

export interface SelectEstadoProps {
    value: string;
    onChange: (value: string) => void;
}

export interface SelectRepartidorProps {
    value: number | null;
    onChange: (value: number | null) => void;
    repartidores: Repartidor[];
}

export interface FechaProgramadaProps {
    esProgramado: number;
    fecha: string | null | undefined;
    onToggle: (checked: boolean) => void;
    onFechaChange: (fecha: string) => void;
}

export interface FilaPedidoProps {
    pedido: Pedido;
    index: number;
    numero: number;
    repartidores: Repartidor[];
    esModificado: boolean;
    onUpdate: (field: keyof Pedido, value: any) => void;
    onFechaProgramadaChange: (value: string) => void;
    onProgramadoToggle: (checked: boolean) => void;
}

export interface TablaPedidosProps {
    pedidos: Pedido[];
    pedidosOriginales: Pedido[];
    repartidores: Repartidor[];
    paginaActual: number;
    registrosPorPagina: number;
    loading: boolean;
    totales: TotalesPedidos;
    onUpdatePedido: (index: number, field: keyof Pedido, value: any) => void;
    onFechaProgramadaChange: (index: number, value: string) => void;
    onProgramadoToggle: (index: number, checked: boolean) => void;
}

export interface FiltrosPedidosComponentProps {
    filtros: FiltrosPedidos;
    repartidores: Repartidor[];
    loading: boolean;
    onFiltroChange: (key: keyof FiltrosPedidos, value: string) => void;
    onFiltrar: () => void;
    onLimpiar: () => void;
}

export interface BotonesAccionProps {
    pedidosModificadosCount: number;
    saving: boolean;
    loading: boolean;
    onGuardar: () => void;
    onImprimir: () => void;
    onExportar: () => void;
}

export interface ModalWhatsappProps {
    isOpen: boolean;
    mensajes: string[];
    onClose: () => void;
}

export interface InfoPedidosProps {
    totalRegistros: number;
    pedidosCount: number;
    paginaActual: number;
    totalPaginas: number;
    pedidosModificadosCount: number;
}

export interface PaginacionProps {
    paginaActual: number;
    totalPaginas: number;
    paginas: number[];
    onCambiarPagina: (pagina: number) => void;
}

// Constantes
export const ESTADOS_PEDIDO = ['Pendiente', 'En Proceso', 'Entregado', 'Cancelado', 'Finalizado', 'Cuenta'] as const;
export type EstadoPedido = typeof ESTADOS_PEDIDO[number];

export const TIPOS_ENTREGA = ['inmediato', 'programado'] as const;
export type TipoEntrega = typeof TIPOS_ENTREGA[number];

export const REGISTROS_POR_PAGINA_DEFAULT = 50;
export const TOTAL_RENGLONES_IMPRESION = 35;