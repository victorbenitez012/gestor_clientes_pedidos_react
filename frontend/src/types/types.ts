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