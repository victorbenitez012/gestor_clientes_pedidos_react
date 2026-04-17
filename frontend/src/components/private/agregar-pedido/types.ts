// frontend/src/components/private/agregar-pedido/types.ts

export interface Cliente {
    id: number;
    nombre: string;
    direccion: string;
    barrio: string;
    telefono: string;
    observacion: string;
}

export interface Repartidor {
    id: number;
    nombre: string;
    apellido: string;
    telefono?: string;
}


export interface FormDataPedido {
    nombre_cliente: string;
    direccion_cliente: string;
    barrio_cliente: string;
    telefono_cliente: string;
    observacion_cliente: string;
    observacion_pedido: string;
    estado: string;
    precio: string;
    repartidor: string;
    garrafa_10kg: number;
    garrafa_15kg: number;
    garrafa_45kg: number;
    fecha_entrega_programada: string; // NUEVO
    es_programado: boolean; // NUEVO
}

export interface Pedido {
    id: number;
    tipo_pedido: string;
    direccion: string;
    barrio: string;
    telefono: string;
    cliente_nombre: string;
    observacion_cliente: string;
    estado: string;
    precio: number | string;
    observacion_pedido: string;
    fecha_creacion: string;
    fecha_entrega_programada?: string; // NUEVO
    fecha_entrega_real?: string; // NUEVO
    es_programado?: number; // NUEVO
    repartidor_nombre?: string;
    repartidor_apellido?: string;
}

export interface ModalState {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    onConfirm?: () => void;
    onCancel?: () => void;
    onAlternative?: () => void;
    showAlternative?: boolean;
    alternativeText?: string;
    confirmText?: string;
    cancelText?: string;
}