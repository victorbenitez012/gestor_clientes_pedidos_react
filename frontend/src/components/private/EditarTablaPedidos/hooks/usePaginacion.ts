import { useState, useCallback, useEffect } from 'react';

export const usePaginacion = (totalPaginas: number) => {
    const [paginaActual, setPaginaActual] = useState(1);

    // Resetear a página 1 si la actual es mayor que el total
    useEffect(() => {
        if (paginaActual > totalPaginas && totalPaginas > 0) {
            setPaginaActual(1);
        }
    }, [totalPaginas, paginaActual]);

    const cambiarPagina = useCallback((pagina: number) => {
        if (pagina >= 1 && pagina <= totalPaginas) {
            setPaginaActual(pagina);
            return pagina;
        }
        return paginaActual;
    }, [totalPaginas, paginaActual]);

    const renderPaginacion = useCallback(() => {
        const paginas: number[] = [];
        let inicio = Math.max(1, paginaActual - 2);
        let fin = Math.min(totalPaginas, paginaActual + 2);

        for (let i = inicio; i <= fin; i++) {
            paginas.push(i);
        }

        return paginas;
    }, [paginaActual, totalPaginas]);

    return {
        paginaActual,
        setPaginaActual,
        cambiarPagina,
        renderPaginacion
    };
};