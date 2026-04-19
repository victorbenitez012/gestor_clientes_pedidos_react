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
            <tfoot>
                <tr>
                    <td colSpan={11} className="text-right"><strong>💰 Total Precio:</strong></td>
                    <td colSpan={5}><strong>${totales.totalPrecio.toFixed(2)}</strong></td>
                </tr>
                <tr style={{ backgroundColor: '#e8f4f8' }}>
                    <td colSpan={2} className="text-right"><strong>📦 Totales Garrafas:</strong></td>
                    <td><strong>{totales.totalGarrafas10kg}</strong> <small>(10kg)</small></td>
                    <td><strong>{totales.totalGarrafas15kg}</strong> <small>(15kg)</small></td>
                    <td><strong>{totales.totalGarrafas45kg}</strong> <small>(45kg)</small></td>
                    <td colSpan={11}></td>
                </tr>
            </tfoot>
        </>
    );
};

export default TablaPedidos;