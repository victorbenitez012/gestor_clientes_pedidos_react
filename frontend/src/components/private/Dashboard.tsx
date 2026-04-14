import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contarRegistros, contarPedidosPorEstado } from '../../services/api';
import '../../css/styles.css'; // Importa el archivo CSS

const Dashboard: React.FC = () => {
    const [estadisticas, setEstadisticas] = useState({
        totalClientes: 0,
        totalPedidos: 0,
        totalRepartidores: 0,
        pedidosPendientes: 0,
        pedidosEnProceso: 0,
        pedidosEntregados: 0,
        pedidosFinalizados: 0,
        pedidosEnCuenta: 0,
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarEstadisticas = async () => {
            try {
                const totalClientes = await contarRegistros('clientes');
                const totalPedidos = await contarRegistros('pedidos');
                const totalRepartidores = await contarRegistros('repartidores');
                const pedidosPendientes = await contarPedidosPorEstado('pendiente');
                const pedidosEnProceso = await contarPedidosPorEstado('en proceso');
                const pedidosEntregados = await contarPedidosPorEstado('entregado');
                const pedidosFinalizados = await contarPedidosPorEstado('finalizado');
                const pedidosEnCuenta = await contarPedidosPorEstado('cuenta');

                console.log('Estad�sticas cargadas:', {
                    totalClientes,
                    totalPedidos,
                    totalRepartidores,
                    pedidosPendientes,
                    pedidosEnProceso,
                    pedidosEntregados,
                    pedidosFinalizados,
                    pedidosEnCuenta,
                }); // Depuraci�n

                setEstadisticas({
                    totalClientes,
                    totalPedidos,
                    totalRepartidores,
                    pedidosPendientes,
                    pedidosEnProceso,
                    pedidosEntregados,
                    pedidosFinalizados,
                    pedidosEnCuenta,
                });
            } catch (err) {
                setError('Error al cargar las estad�sticas. Int�ntalo de nuevo.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        cargarEstadisticas();
    }, []);

    if (loading) {
        return <p>Cargando estad�sticas...</p>;
    }

    return (
        <div className="container">
            <img src="/logoprincipal.png" alt="Logo Principal" />
            <h1>Gestion� tus clientes y pedidos de forma f�cil y r�pida</h1>
            <p>Administra tus <strong>Clientes, Pedidos y Repartidores</strong> desde esta plataforma de manera eficiente.</p>

            <nav>
                <ul className="menu">
                    <li><Link to="/clientes">Gestionar Clientes</Link></li>
                    <li><Link to="/pedidos">Gestionar Pedidos</Link></li>
                    <li><Link to="/repartidores">Gestionar Repartidores</Link></li>
                </ul>
            </nav>

            <section>
                <h2>Estad�sticas r�pidas</h2>
                {error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    <>
                        <p>Obt�n un resumen r�pido de los datos registrados en el sistema:</p>
                        <ul className="stats">
                            <li>Total de Clientes registrados: <strong className="total-clientes">{estadisticas.totalClientes}</strong></li>
                            <li>Total de Pedidos registrados: <strong className="total-pedidos">{estadisticas.totalPedidos}</strong></li>
                            <li>Total de Repartidores disponibles: <strong className="total-repartidores">{estadisticas.totalRepartidores}</strong></li>
                            <li>Pedidos Pendientes: <strong className="pedidos-pendientes">{estadisticas.pedidosPendientes}</strong></li>
                            <li>Pedidos En proceso: <strong className="pedidos-en-proceso">{estadisticas.pedidosEnProceso}</strong></li>
                            <li>Pedidos Entregados: <strong className="pedidos-entregados">{estadisticas.pedidosEntregados}</strong></li>
                            <li>Pedidos Finalizados: <strong className="pedidos-finalizados">{estadisticas.pedidosFinalizados}</strong></li>
                            <li>Pedidos En Cuenta: <strong className="pedidos-en-cuenta">{estadisticas.pedidosEnCuenta}</strong></li>
                        </ul>
                    </>
                )}
            </section>
        </div>
    );
};

export default Dashboard;