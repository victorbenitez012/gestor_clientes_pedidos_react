export const validarNumero = (value: number, min: number = 0): number => {
    return isNaN(value) || value < min ? 0 : value;
};

export const validarPrecio = (value: number): number => {
    return isNaN(value) ? 0 : Number(value.toFixed(2));
};