// frontend/src/components/private/agregar-pedido/hooks/useFormateoTexto.ts

export const useFormateoTexto = () => {
    const capitalizarPalabras = (texto: string): string => {
        if (!texto) return '';
        return texto.toLowerCase().split(' ').map(palabra => {
            if (palabra.length === 0) return palabra;
            return palabra.charAt(0).toUpperCase() + palabra.slice(1);
        }).join(' ');
    };

    const capitalizarPrimeraLetra = (texto: string): string => {
        if (!texto) return '';
        const textoLower = texto.toLowerCase();
        return textoLower.charAt(0).toUpperCase() + textoLower.slice(1);
    };

    const formatearPrecio = (precio: number | string): string => {
        const num = typeof precio === 'string' ? parseFloat(precio) : precio;
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const generarTextoGarrafas = (garrafas: { garrafa_10kg: number; garrafa_15kg: number; garrafa_45kg: number }): string => {
        const partes = [];
        if (garrafas.garrafa_10kg > 0) partes.push(`${garrafas.garrafa_10kg} x 10kg`);
        if (garrafas.garrafa_15kg > 0) partes.push(`${garrafas.garrafa_15kg} x 15kg`);
        if (garrafas.garrafa_45kg > 0) partes.push(`${garrafas.garrafa_45kg} x 45kg`);
        return partes.join(', ');
    };

    return { capitalizarPalabras, capitalizarPrimeraLetra, formatearPrecio, generarTextoGarrafas };
};