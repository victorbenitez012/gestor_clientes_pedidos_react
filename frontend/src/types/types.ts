export interface Cliente {
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
}

// Agrega esto para evitar el error de módulos aislados
export { };

export interface Pedido {
    id: number;
    tipo_pedido: string;
    estado: string;
    precio: string; // Cambiado a string para coincidir con el backend
    observacion_pedido: string;
    repartidor_id: number | null;
    fecha_creacion: string;
    direccion: string;
    barrio: string;
    telefono: string;
    cliente_nombre: string;
    cliente_observacion: string;
    repartidor_nombre: string | null;
    repartidor_apellido: string | null;
}

// Tipo para las claves editables
export type ClaveEditablePedido = keyof Omit<Pedido, 'id' | 'fecha_creacion' | 'repartidor_nombre' | 'repartidor_apellido'>;

// Tipo que mapea cada clave editable a su tipo correspondiente
export type ValorEditablePedido = {
    tipo_pedido: string;
    estado: string;
    precio: string;
    observacion_pedido: string;
    repartidor_id: number | null;
    direccion: string;
    barrio: string;
    telefono: string;
    cliente_nombre: string;
    cliente_observacion: string;
};