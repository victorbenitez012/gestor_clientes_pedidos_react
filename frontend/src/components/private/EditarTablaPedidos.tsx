import React, { useState, useEffect } from 'react';
import { fetchPedidos, guardarCambios } from '../../services/api';
import { Pedido, ClaveEditablePedido, ValorEditablePedido } from '../../types/types';
import styles from './EditarTablaPedidos.module.css'; // Si usas CSS Modules

const EditarTablaPedidos = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [search, setSearch] = useState('');
    const [searchSecondary, setSearchSecondary] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Cargar pedidos al montar el componente o al cambiar los filtros
    useEffect(() => {
        const cargarPedidos = async () => {
            try {
                const datos = await fetchPedidos(search, searchSecondary, fechaDesde, fechaHasta);
                console.log('Datos recibidos:', datos); // Verifica la estructura de los datos
                setPedidos(datos);
                setError(null);
            } catch (err) {
                console.error('Error cargando pedidos:', err);
                setError('Error al cargar los pedidos. Inténtalo de nuevo.');
            }
        };

        cargarPedidos();
    }, [search, searchSecondary, fechaDesde, fechaHasta]);

    // Manejar cambios en los campos editables
    const handleCambioPedido = (index: number, campo: ClaveEditablePedido, valor: ValorEditablePedido[ClaveEditablePedido]) => {
        const nuevosPedidos = [...pedidos];
        nuevosPedidos[index] = {
            ...nuevosPedidos[index],
            [campo]: valor,
        };
        setPedidos(nuevosPedidos);
    };

    // Guardar cambios en el backend
    const handleGuardarCambios = async () => {
        try {
            await guardarCambios(pedidos);
            setMensaje('Cambios guardados correctamente');
            setError(null);
        } catch (err) {
            console.error('Error guardando cambios:', err);
            setError('Error al guardar los cambios.');
        }
    };

    // Exportar a Excel
    const handleExportarExcel = () => {
        import('xlsx').then((XLSX) => {
            const tabla = document.querySelector('table');
            const workbook = XLSX.utils.table_to_book(tabla);
            XLSX.writeFile(workbook, 'pedidos.xlsx');
        });
    };

    // Imprimir la tabla
    const handleImprimir = () => {
        window.print();
    };

    return (
        <div className={styles.container}>
            <h1>Editar Planilla de Pedidos</h1>
            {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Formulario de búsqueda */}
            <form className={styles.form}>
                <input
                    type="text"
                    placeholder="Buscar"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Buscar secundario"
                    value={searchSecondary}
                    onChange={(e) => setSearchSecondary(e.target.value)}
                />
                <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                />
                <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                />
                <button type="button" onClick={() => setPedidos([])}>Filtrar</button>
            </form>

            {/* Tabla de pedidos */}
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tipo Pedido</th>
                        <th>Dirección</th>
                        <th>Barrio</th>
                        <th>Teléfono</th>
                        <th>Nombre Cliente</th>
                        <th>Observación Cliente</th>
                        <th>Estado</th>
                        <th>Precio</th>
                        <th>Observación Pedido</th>
                        <th>Fecha de Creación</th>
                        <th>Repartidor</th>
                    </tr>
                </thead>
                <tbody>
                    {pedidos.map((pedido, index) => (
                        <tr key={pedido.id}>
                            <td>{index + 1}</td>
                            <td>
                                <input
                                    type="text"
                                    value={pedido.tipo_pedido}
                                    onChange={(e) => handleCambioPedido(index, 'tipo_pedido', e.target.value)}
                                />
                            </td>
                            <td>{pedido.direccion}</td>
                            <td>{pedido.barrio}</td>
                            <td>{pedido.telefono}</td>
                            <td>{pedido.cliente_nombre}</td>
                            <td>{pedido.cliente_observacion}</td>
                            <td>
                                <select
                                    value={pedido.estado}
                                    onChange={(e) => handleCambioPedido(index, 'estado', e.target.value)}
                                >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="En Proceso">En Proceso</option>
                                    <option value="Entregado">Entregado</option>
                                    <option value="Cancelado">Cancelado</option>
                                    <option value="Finalizado">Finalizado</option>
                                    <option value="Cuenta">Cuenta</option>
                                </select>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={pedido.precio}
                                    onChange={(e) => handleCambioPedido(index, 'precio', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={pedido.observacion_pedido}
                                    onChange={(e) => handleCambioPedido(index, 'observacion_pedido', e.target.value)}
                                />
                            </td>
                            <td>{pedido.fecha_creacion}</td>
                            <td>
                                <select
                                    value={pedido.repartidor_id || ''}
                                    onChange={(e) => handleCambioPedido(index, 'repartidor_id', e.target.value ? parseInt(e.target.value) : null)}
                                >
                                    <option value="">Sin asignar</option>
                                    {/* Aquí deberías mapear la lista de repartidores si la tienes */}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Botones */}
            <div className={styles.botones}>
                <button onClick={handleGuardarCambios}>Guardar Cambios</button>
                <button onClick={handleImprimir}>Imprimir</button>
                <button onClick={handleExportarExcel}>Exportar a Excel</button>
            </div>
        </div>
    );
};

export default EditarTablaPedidos;
