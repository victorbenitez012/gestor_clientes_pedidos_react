// frontend/src/components/private/agregar-pedido/TablaUltimosPedidos.tsx
import React from 'react';
import { Pedido } from './types';
import { useFormateoTexto } from './hooks/useFormateoTexto';

interface TablaUltimosPedidosProps {
    pedidos: Pedido[];
}

const TablaUltimosPedidos: React.FC<TablaUltimosPedidosProps> = ({ pedidos }) => {
    const { formatearPrecio } = useFormateoTexto();

    if (pedidos.length === 0) return null;

    return (
        <div className="ultimos-pedidos">
            <h2>📋 Últimos 10 Pedidos del Cliente</h2>
            <div className="tabla-container">
                <table className="tabla-pedidos">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Garrafas</th>
                            <th>Dirección</th>
                            <th>Barrio</th>
                            <th>Teléfono</th>
                            <th>Cliente</th>
                            <th>Estado</th>
                            <th>Precio</th>
                            <th>Observación</th>
                            <th>Fecha</th>
                            <th>Repartidor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidos.map((pedido, index) => (
                            <tr key={pedido.id}>
                                <td>{index + 1}</td>
                                <td>{pedido.tipo_pedido || '-'}</td>
                                <td>{pedido.direccion || ''}</td>
                                <td>{pedido.barrio || ''}</td>
                                <td>{pedido.telefono || ''}</td>
                                <td>{pedido.cliente_nombre || ''}</td>
                                <td className="estado">{pedido.estado || ''}</td>
                                <td>${formatearPrecio(pedido.precio)}</td>
                                <td>{pedido.observacion_pedido || '-'}</td>
                                <td>{pedido.fecha_creacion || ''}</td>
                                <td>{pedido.repartidor_nombre ? `${pedido.repartidor_nombre} ${pedido.repartidor_apellido}` : 'Sin asignar'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TablaUltimosPedidos;