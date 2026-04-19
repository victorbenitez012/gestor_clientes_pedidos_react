import React from 'react';

interface InfoPedidosProps {
    totalRegistros: number;
    pedidosCount: number;
    paginaActual: number;
    totalPaginas: number;
    pedidosModificadosCount: number;
}

export const InfoPedidos: React.FC<InfoPedidosProps> = ({
    totalRegistros,
    pedidosCount,
    paginaActual,
    totalPaginas,
    pedidosModificadosCount
}) => {
    return (
        <div className="pagination-info">
            📄 Mostrando {pedidosCount} de {totalRegistros} registros - Página {paginaActual} de {totalPaginas}
            {pedidosModificadosCount > 0 && (
                <span style={{ color: '#ff9800', marginLeft: '10px', fontWeight: 'bold' }}>
                    ⚠️ ({pedidosModificadosCount} pedido(s) modificado(s) sin guardar)
                </span>
            )}
        </div>
    );
};