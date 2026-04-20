import React from 'react';
import { Pedido, Repartidor, TotalesPedidos } from '../../../../types/types';
import { FilaPedido } from './FilaPedido';
import { haCambiado } from '../utils/formateadores';

interface TablaPedidosProps {
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

export const TablaPedidos: React.FC<TablaPedidosProps> = ({
    pedidos,
    pedidosOriginales,
    repartidores,
    paginaActual,
    registrosPorPagina,
    loading,
    totales,
    onUpdatePedido,
    onFechaProgramadaChange,
    onProgramadoToggle
}) => {
    if (loading) {
        return <tr><td colSpan={16} className="text-center">🔄 Cargando pedidos...</td></tr>;
    }

    if (pedidos.length === 0) {
        return <tr><td colSpan={16} className="text-center">📭 No se encontraron pedidos</td></tr>;
    }

    return (
        <>
            {pedidos.map((pedido, index) => (
                <FilaPedido
                    key={pedido.id}
                    pedido={pedido}
                    index={index}
                    numero={index + 1 + (paginaActual - 1) * registrosPorPagina}
                    repartidores={repartidores}
                    esModificado={haCambiado(pedidosOriginales[index], pedido)}
                    onUpdate={(field, value) => onUpdatePedido(index, field, value)}
                    onFechaProgramadaChange={(value) => onFechaProgramadaChange(index, value)}
                    onProgramadoToggle={(checked) => onProgramadoToggle(index, checked)}
                />
            ))}
            {/* Fila de Total Precio - alineado debajo de la columna Precio (columna 12) */}
            <tr style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                <td colSpan={11} style={{ textAlign: 'right', border: '1px solid #ddd' }}>Total Precio:</td>
                <td style={{ textAlign: 'right', border: '1px solid #ddd', fontWeight: 'bold' }}>
                    ${totales.totalPrecio.toFixed(2)}
                </td>
                <td colSpan={4} style={{ border: '1px solid #ddd' }}></td>
            </tr>
            {/* Fila de Totales Garrafas - alineado debajo de las columnas 10kg, 15kg, 45kg (columnas 3, 4, 5) */}
            <tr style={{ backgroundColor: '#e8f4f8' }}>
                <td colSpan={2} style={{ textAlign: 'right', border: '1px solid #ddd', fontWeight: 'bold' }}>Totales Garrafas:</td>
                <td style={{ textAlign: 'center', border: '1px solid #ddd', fontWeight: 'bold' }}>
                    {totales.totalGarrafas10kg}
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #ddd', fontWeight: 'bold' }}>
                    {totales.totalGarrafas15kg}
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #ddd', fontWeight: 'bold' }}>
                    {totales.totalGarrafas45kg}
                </td>
                <td colSpan={11} style={{ border: '1px solid #ddd' }}></td>
            </tr>
        </>
    );
};

export default TablaPedidos;