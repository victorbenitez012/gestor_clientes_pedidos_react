import React from 'react';

interface PaginacionProps {
    paginaActual: number;
    totalPaginas: number;
    paginas: number[];
    onCambiarPagina: (pagina: number) => void;
}

export const Paginacion: React.FC<PaginacionProps> = ({
    paginaActual,
    totalPaginas,
    paginas,
    onCambiarPagina
}) => {
    if (totalPaginas <= 1) return null;

    return (
        <div className="pagination">
            <button onClick={() => onCambiarPagina(1)} disabled={paginaActual === 1}>
                ⏮️ Primera
            </button>
            <button onClick={() => onCambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>
                ◀️ Anterior
            </button>
            {paginas.map(pagina => (
                <button
                    key={pagina}
                    onClick={() => onCambiarPagina(pagina)}
                    className={pagina === paginaActual ? 'current' : ''}
                >
                    {pagina}
                </button>
            ))}
            <button onClick={() => onCambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>
                Siguiente ▶️
            </button>
            <button onClick={() => onCambiarPagina(totalPaginas)} disabled={paginaActual === totalPaginas}>
                Última ⏭️
            </button>
        </div>
    );
};