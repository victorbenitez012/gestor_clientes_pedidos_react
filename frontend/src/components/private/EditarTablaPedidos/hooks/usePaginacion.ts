import { useState, useCallback } from 'react';

export const usePaginacion = (totalPaginasInicial: number = 1) => {
    const [paginaActual, setPaginaActual] = useState(1);

    const cambiarPagina = useCallback((pagina: number) => {
        if (pagina >= 1 && pagina <= totalPaginasInicial) {
            setPaginaActual(pagina);
        }
    }, [totalPaginasInicial]);

    const renderPaginacion = useCallback(() => {
        const paginas: number[] = [];
        let inicio = Math.max(1, paginaActual - 2);
        let fin = Math.min(totalPaginasInicial, paginaActual + 2);

        for (let i = inicio; i <= fin; i++) {
            paginas.push(i);
        }

        return paginas;
    }, [paginaActual, totalPaginasInicial]);

    return {
        paginaActual,
        setPaginaActual,
        cambiarPagina,
        renderPaginacion
    };
};