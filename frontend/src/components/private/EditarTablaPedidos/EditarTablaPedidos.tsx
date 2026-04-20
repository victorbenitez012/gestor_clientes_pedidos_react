import React, { useState, useEffect } from 'react';
import { Repartidor } from '../../../types/types';
import { api } from '../../../services/api';
import { usePedidos } from './hooks/usePedidos';
import { useFiltros } from './hooks/useFiltros';
import { usePaginacion } from './hooks/usePaginacion';
import { FiltrosPedidosComponent } from './components/FiltrosPedidos';
import { TablaPedidos } from './components/TablaPedidos';
import { BotonesAccion } from './components/BotonesAccion';
import { ModalWhatsapp } from './components/ModalWhatsapp';
import { InfoPedidos } from './components/InfoPedidos';
import { Paginacion } from './components/Paginacion';
import { exportarExcel, generarHtmlImpresion } from './utils/exportadores';
import Modal from '../../common/Modal';

const REGISTROS_POR_PAGINA = 50;

export const EditarTablaPedidos: React.FC = () => {
    const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
    const [saving, setSaving] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [mensajesWhatsapp, setMensajesWhatsapp] = useState<string[]>([]);
    const [showWhatsappList, setShowWhatsappList] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' as const });

    const { filtros, actualizarFiltro, limpiarFiltros } = useFiltros();

    // Estado local para la página actual
    const [paginaActual, setPaginaActual] = useState(1);

    const {
        pedidos,
        pedidosOriginales,
        loading,
        totalRegistros,
        totalPaginas,
        error: pedidosError,
        totales,
        cargarPedidos,
        actualizarPedido,
        actualizarFechaProgramada,
        toggleProgramado,
        obtenerPedidosModificados
    } = usePedidos(filtros, paginaActual, REGISTROS_POR_PAGINA);

    // Hook de paginación usando el totalPaginas real
    const { cambiarPagina, renderPaginacion } = usePaginacion(totalPaginas);

    // Sincronizar página actual cuando cambia totalPaginas
    useEffect(() => {
        if (paginaActual > totalPaginas && totalPaginas > 0) {
            setPaginaActual(1);
        }
    }, [totalPaginas, paginaActual]);

    // Cargar repartidores
    useEffect(() => {
        const fetchRepartidores = async () => {
            try {
                const data = await api.getRepartidores();
                setRepartidores(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error cargando repartidores:', err);
            }
        };
        fetchRepartidores();
    }, []);

    // Efecto para recargar cuando cambian los filtros o página
    useEffect(() => {
        cargarPedidos();
    }, [filtros.search, filtros.searchSecondary, filtros.fechaDesde, filtros.fechaHasta,
    filtros.repartidorId, filtros.estado, filtros.tipoEntrega, paginaActual, cargarPedidos]);

    const handleGuardarCambios = async () => {
        const pedidosModificados = obtenerPedidosModificados();

        if (pedidosModificados.length === 0) {
            setMensaje('✅ No hay cambios para guardar');
            setTimeout(() => setMensaje(''), 3000);
            return;
        }

        setSaving(true);
        setError('');
        setMensaje('');

        try {
            const data = await api.guardarPedidos(pedidosModificados);

            if (data.mensaje) setMensaje(`✅ ${data.mensaje}`);
            if (data.error) setError(`❌ ${data.error}`);

            if (data.mensajesWhatsapp && data.mensajesWhatsapp.length > 0) {
                setMensajesWhatsapp(data.mensajesWhatsapp);
                setShowWhatsappList(true);
            }

            await cargarPedidos();

            setTimeout(() => {
                setMensaje('');
                setError('');
            }, 5000);
        } catch (err) {
            console.error('Error guardando:', err);
            setError('❌ Error al guardar los cambios');
        } finally {
            setSaving(false);
        }
    };

    const handleImprimir = () => {
        const ventanaImpresion = window.open('', '_blank');
        if (!ventanaImpresion) return;

        let total10kg = 0, total15kg = 0, total45kg = 0, totalPrecio = 0;

        pedidos.forEach(pedido => {
            total10kg += pedido.garrafa_10kg || 0;
            total15kg += pedido.garrafa_15kg || 0;
            total45kg += pedido.garrafa_45kg || 0;
            totalPrecio += Number(pedido.precio) || 0;
        });

        const totalesImpresion = {
            total10kg,
            total15kg,
            total45kg,
            totalPrecio
        };

        const html = generarHtmlImpresion(pedidos, paginaActual, REGISTROS_POR_PAGINA, totalesImpresion);
        ventanaImpresion.document.write(html);
        ventanaImpresion.document.close();
        ventanaImpresion.print();
    };

    const handleExportar = () => {
        exportarExcel(pedidos, paginaActual, REGISTROS_POR_PAGINA, totales);
        setMensaje('✅ Excel exportado correctamente');
        setTimeout(() => setMensaje(''), 3000);
    };

    const pedidosModificadosCount = obtenerPedidosModificados().length;
    const paginas = renderPaginacion();

    // Función para manejar cambio de página
    const handleCambiarPagina = (pagina: number) => {
        cambiarPagina(pagina);
        setPaginaActual(pagina);
    };

    return (
        <div className="editar-pedidos-container">
            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />

            <ModalWhatsapp
                isOpen={showWhatsappList}
                mensajes={mensajesWhatsapp}
                onClose={() => setShowWhatsappList(false)}
            />

            <h1>📋 Editar Planilla de Pedidos</h1>

            {mensaje && <div className="mensaje-exito">{mensaje}</div>}
            {error && <div className="mensaje-error">{error}</div>}
            {pedidosError && <div className="mensaje-error">{pedidosError}</div>}

            <FiltrosPedidosComponent
                filtros={filtros}
                repartidores={repartidores}
                loading={loading}
                onFiltroChange={actualizarFiltro}
                onFiltrar={cargarPedidos}
                onLimpiar={() => {
                    limpiarFiltros();
                    setPaginaActual(1);
                }}
            />

            <InfoPedidos
                totalRegistros={totalRegistros}
                pedidosCount={pedidos.length}
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                pedidosModificadosCount={pedidosModificadosCount}
            />

            <form onSubmit={(e) => { e.preventDefault(); handleGuardarCambios(); }}>
                <table className="editable-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tipo Pedido</th>
                            <th>10kg</th>
                            <th>15kg</th>
                            <th>45kg</th>
                            <th>Dirección</th>
                            <th>Barrio</th>
                            <th>Teléfono</th>
                            <th>Nombre Cliente</th>
                            <th>Observación Cliente</th>
                            <th>Estado</th>
                            <th>Precio</th>
                            <th>Observación Pedido</th>
                            <th>Fecha Creación</th>
                            <th>📅 Fecha Programada</th>
                            <th>Repartidor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <TablaPedidos
                            pedidos={pedidos}
                            pedidosOriginales={pedidosOriginales}
                            repartidores={repartidores}
                            paginaActual={paginaActual}
                            registrosPorPagina={REGISTROS_POR_PAGINA}
                            loading={loading}
                            totales={totales}
                            onUpdatePedido={actualizarPedido}
                            onFechaProgramadaChange={actualizarFechaProgramada}
                            onProgramadoToggle={toggleProgramado}
                        />
                    </tbody>
                </table>

                <BotonesAccion
                    pedidosModificadosCount={pedidosModificadosCount}
                    saving={saving}
                    loading={loading}
                    onGuardar={handleGuardarCambios}
                    onImprimir={handleImprimir}
                    onExportar={handleExportar}
                />
            </form>

            <Paginacion
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                paginas={paginas}
                onCambiarPagina={handleCambiarPagina}
            />

            <ul className="menu">
                <li><a href="/gestor_clientes_pedidos_react/pedidos">🔙 Volver</a></li>
            </ul>
        </div>
    );
};

export default EditarTablaPedidos;