import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contarRegistros, contarPedidosPorEstado } from '../../services/api';
import '../../css/styles.css';

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
                console.log('🟢 Iniciando carga de estadísticas...');

                console.log('📊 Cargando totalClientes...');
                const totalClientes = await contarRegistros('clientes');
                console.log('✅ totalClientes:', totalClientes);

                console.log('📊 Cargando totalPedidos...');
                const totalPedidos = await contarRegistros('pedidos');
                console.log('✅ totalPedidos:', totalPedidos);

                console.log('📊 Cargando totalRepartidores...');
                const totalRepartidores = await contarRegistros('repartidores');
                console.log('✅ totalRepartidores:', totalRepartidores);

                console.log('📊 Cargando pedidosPendientes...');
                const pedidosPendientes = await contarPedidosPorEstado('Pendiente');
                console.log('✅ pedidosPendientes:', pedidosPendientes);

                console.log('📊 Cargando pedidosEnProceso...');
                const pedidosEnProceso = await contarPedidosPorEstado('En Proceso');
                console.log('✅ pedidosEnProceso:', pedidosEnProceso);

                console.log('📊 Cargando pedidosEntregados...');
                const pedidosEntregados = await contarPedidosPorEstado('Entregado');
                console.log('✅ pedidosEntregados:', pedidosEntregados);

                console.log('📊 Cargando pedidosFinalizados...');
                const pedidosFinalizados = await contarPedidosPorEstado('Finalizado');
                console.log('✅ pedidosFinalizados:', pedidosFinalizados);

                console.log('📊 Cargando pedidosEnCuenta...');
                const pedidosEnCuenta = await contarPedidosPorEstado('Cuenta');
                console.log('✅ pedidosEnCuenta:', pedidosEnCuenta);

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

                console.log('🎉 Todas las estadísticas cargadas correctamente!');
            } catch (err) {
                console.error('❌ ERROR EN LA PETICIÓN:', err);
                setError('Error al cargar las estadísticas. Inténtalo de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        cargarEstadisticas();
    }, []);

    if (loading) {
        return <p>Cargando estadísticas...</p>;
    }

    return (
        <div className="container">
            <img src="/logoprincipal.png" alt="Logo Principal" onError={(e) => console.error('Error cargando logo:', e)} />
            <h1>Gestiona tus clientes y pedidos de forma fácil y rápida</h1>
            <p>Administra tus <strong>Clientes, Pedidos y Repartidores</strong> desde esta plataforma de manera eficiente.</p>

            <nav>
                <ul className="menu">
                    <li><Link to="/clientes">Gestionar Clientes</Link></li>
                    <li><Link to="/pedidos">Gestionar Pedidos</Link></li>
                    <li><Link to="/repartidores">Gestionar Repartidores</Link></li>
                </ul>
            </nav>

            <section>
                <h2>Estadísticas rápidas</h2>
                {error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    <>
                        <p>Obtén un resumen rápido de los datos registrados en el sistema:</p>
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