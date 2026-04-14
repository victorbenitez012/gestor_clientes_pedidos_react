import React, { useState, useEffect } from 'react';

interface Cliente {
    id: number;
    nombre: string;
    direccion: string;
    barrio: string;
    telefono: string;
    observacion: string;
}

interface Repartidor {
    id: number;
    nombre: string;
    apellido: string;
}

interface Pedido {
    id: number;
    tipo_pedido: string;
    direccion: string;
    barrio: string;
    telefono: string;
    cliente_nombre: string;
    observacion_cliente: string;
    estado: string;
    precio: number | string;
    observacion_pedido: string;
    fecha_creacion: string;
    repartidor_nombre?: string;
    repartidor_apellido?: string;
}

const AgregarPedido: React.FC = () => {
    const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
    const [sugerenciasTotal, setSugerenciasTotal] = useState<Cliente[]>([]);
    const [sugerenciasDireccion, setSugerenciasDireccion] = useState<Cliente[]>([]);
    const [ultimosPedidos, setUltimosPedidos] = useState<Pedido[]>([]);
    const [mensaje, setMensaje] = useState<{ texto: string; tipo: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [clienteId, setClienteId] = useState<number | null>(null);
    const [mostrarSugerenciasTotal, setMostrarSugerenciasTotal] = useState(false);
    const [mostrarSugerenciasDireccion, setMostrarSugerenciasDireccion] = useState(false);

    // Estado del formulario
    const [formData, setFormData] = useState({
        nombre_cliente: '',
        direccion_cliente: '',
        barrio_cliente: '',
        telefono_cliente: '',
        observacion_cliente: '',
        observacion_pedido: '',
        estado: 'Pendiente',
        precio: '',
        repartidor: '',
        garrafa_10kg: 0,
        garrafa_15kg: 0,
        garrafa_45kg: 0
    });

    // Cargar repartidores
    useEffect(() => {
        const fetchRepartidores = async () => {
            try {
                const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/repartidores/index.php');
                const data = await response.json();
                setRepartidores(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error cargando repartidores:', error);
            }
        };
        fetchRepartidores();
    }, []);

    // Buscar clientes (búsqueda general)
    const buscarClientesTotal = async (busqueda: string) => {
        if (busqueda.length > 2) {
            try {
                const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/pedidos/agregar.php?buscar_cliente_total=1&buscar_busqueda=${encodeURIComponent(busqueda)}`);
                const data = await response.json();
                if (!data.error && Array.isArray(data)) {
                    setSugerenciasTotal(data);
                    setMostrarSugerenciasTotal(true);
                } else {
                    setSugerenciasTotal([]);
                    setMostrarSugerenciasTotal(false);
                }
            } catch (error) {
                console.error('Error buscando clientes:', error);
                setSugerenciasTotal([]);
                setMostrarSugerenciasTotal(false);
            }
        } else {
            setSugerenciasTotal([]);
            setMostrarSugerenciasTotal(false);
        }
    };

    // Buscar clientes por dirección
    const buscarClientesDireccion = async (direccion: string) => {
        if (direccion.length > 2) {
            try {
                const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/pedidos/agregar.php?buscar_cliente=1&direccion_busqueda=${encodeURIComponent(direccion)}`);
                const data = await response.json();
                if (!data.error && Array.isArray(data)) {
                    setSugerenciasDireccion(data);
                    setMostrarSugerenciasDireccion(true);
                } else {
                    setSugerenciasDireccion([]);
                    setMostrarSugerenciasDireccion(false);
                }
            } catch (error) {
                console.error('Error buscando por dirección:', error);
                setSugerenciasDireccion([]);
                setMostrarSugerenciasDireccion(false);
            }
        } else {
            setSugerenciasDireccion([]);
            setMostrarSugerenciasDireccion(false);
        }
    };

    // Obtener últimos pedidos del cliente
    const obtenerUltimosPedidos = async (clienteId: number) => {
        try {
            const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/pedidos/agregar.php?obtener_pedidos=1&cliente_id=${clienteId}`);
            const data = await response.json();
            if (!data.error && Array.isArray(data)) {
                setUltimosPedidos(data);
            } else {
                setUltimosPedidos([]);
            }
        } catch (error) {
            console.error('Error obteniendo pedidos:', error);
            setUltimosPedidos([]);
        }
    };

    // Seleccionar cliente (desde búsqueda general)
    const seleccionarClienteTotal = (cliente: Cliente) => {
        setFormData({
            ...formData,
            nombre_cliente: cliente.nombre,
            direccion_cliente: cliente.direccion,
            barrio_cliente: cliente.barrio,
            telefono_cliente: cliente.telefono,
            observacion_cliente: cliente.observacion || ''
        });
        setClienteId(cliente.id);
        setSugerenciasTotal([]);
        setMostrarSugerenciasTotal(false);
        // Limpiar input de búsqueda
        const inputTotal = document.getElementById('direccion_cliente_total') as HTMLInputElement;
        if (inputTotal) inputTotal.value = '';
        // Obtener últimos pedidos
        obtenerUltimosPedidos(cliente.id);
    };

    // Seleccionar cliente (desde búsqueda por dirección)
    const seleccionarClienteDireccion = (cliente: Cliente) => {
        setFormData({
            ...formData,
            nombre_cliente: cliente.nombre,
            direccion_cliente: cliente.direccion,
            barrio_cliente: cliente.barrio,
            telefono_cliente: cliente.telefono,
            observacion_cliente: cliente.observacion || ''
        });
        setClienteId(cliente.id);
        setSugerenciasDireccion([]);
        setMostrarSugerenciasDireccion(false);
        // Obtener últimos pedidos
        obtenerUltimosPedidos(cliente.id);
    };

    // Cambiar cantidad de garrafas
    const cambiarCantidad = (campo: string, cambio: number) => {
        const valorActual = formData[campo as keyof typeof formData] as number;
        const nuevoValor = Math.max(0, valorActual + cambio);
        setFormData({ ...formData, [campo]: nuevoValor });
    };

    // Manejar cambio en inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Si es el campo de dirección, buscar sugerencias
        if (name === 'direccion_cliente') {
            buscarClientesDireccion(value);
        }
    };

    // Manejar cambio en búsqueda general
    const handleBusquedaTotal = (e: React.ChangeEvent<HTMLInputElement>) => {
        buscarClientesTotal(e.target.value);
    };

    // Limpiar formulario
    const limpiarFormulario = () => {
        setFormData({
            nombre_cliente: '',
            direccion_cliente: '',
            barrio_cliente: '',
            telefono_cliente: '',
            observacion_cliente: '',
            observacion_pedido: '',
            estado: 'Pendiente',
            precio: '',
            repartidor: '',
            garrafa_10kg: 0,
            garrafa_15kg: 0,
            garrafa_45kg: 0
        });
        setClienteId(null);
        setUltimosPedidos([]);
        setSugerenciasTotal([]);
        setSugerenciasDireccion([]);
        setMostrarSugerenciasTotal(false);
        setMostrarSugerenciasDireccion(false);
        setMensaje(null);

        // Limpiar inputs de búsqueda
        const inputTotal = document.getElementById('direccion_cliente_total') as HTMLInputElement;
        const inputDireccion = document.getElementById('direccion_cliente') as HTMLInputElement;
        if (inputTotal) inputTotal.value = '';
        if (inputDireccion) inputDireccion.value = '';
    };

    // Formatear precio para mostrar
    const formatearPrecio = (precio: number | string): string => {
        const num = typeof precio === 'string' ? parseFloat(precio) : precio;
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    // Enviar formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar garrafas
        if (formData.garrafa_10kg === 0 && formData.garrafa_15kg === 0 && formData.garrafa_45kg === 0) {
            setMensaje({ texto: 'Debes agregar al menos una garrafa.', tipo: 'error' });
            return;
        }

        // Validar campos obligatorios
        if (!formData.direccion_cliente || !formData.telefono_cliente || !formData.precio) {
            setMensaje({ texto: 'Por favor completa todos los campos obligatorios.', tipo: 'error' });
            return;
        }

        setLoading(true);

        // Crear FormData para enviar como POST
        const submitFormData = new FormData();
        submitFormData.append('direccion_cliente', formData.direccion_cliente);
        submitFormData.append('barrio_cliente', formData.barrio_cliente);
        submitFormData.append('nombre_cliente', formData.nombre_cliente);
        submitFormData.append('telefono_cliente', formData.telefono_cliente);
        submitFormData.append('observacion_cliente', formData.observacion_cliente);
        submitFormData.append('observacion_pedido', formData.observacion_pedido);
        submitFormData.append('estado', formData.estado);
        submitFormData.append('precio', formData.precio);
        submitFormData.append('repartidor', formData.repartidor);
        submitFormData.append('garrafa_10kg', formData.garrafa_10kg.toString());
        submitFormData.append('garrafa_15kg', formData.garrafa_15kg.toString());
        submitFormData.append('garrafa_45kg', formData.garrafa_45kg.toString());
        if (clienteId) submitFormData.append('cliente_id', clienteId.toString());

        try {
            const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/pedidos/agregar.php', {
                method: 'POST',
                body: submitFormData
            });

            const text = await response.text();

            if (text.includes('confirm')) {
                setMensaje({ texto: 'Pedido registrado exitosamente', tipo: 'success' });

                // Extraer la URL de WhatsApp si existe
                const match = text.match(/window\.location\.href = '([^']+)'/);
                if (match && match[1]) {
                    const confirmar = window.confirm('¿Quieres enviar los detalles del pedido al repartidor por WhatsApp?');
                    if (confirmar) {
                        window.open(match[1], '_blank');
                    }
                }

                // Limpiar campos del pedido
                setFormData(prev => ({
                    ...prev,
                    observacion_pedido: '',
                    precio: '',
                    garrafa_10kg: 0,
                    garrafa_15kg: 0,
                    garrafa_45kg: 0
                }));

                // Recargar últimos pedidos si hay cliente seleccionado
                if (clienteId) {
                    obtenerUltimosPedidos(clienteId);
                }
            } else if (text.includes('error')) {
                setMensaje({ texto: 'Error al guardar el pedido', tipo: 'error' });
            } else {
                setMensaje({ texto: 'Pedido registrado exitosamente', tipo: 'success' });
            }
        } catch (error) {
            console.error('Error:', error);
            setMensaje({ texto: 'Error al guardar el pedido', tipo: 'error' });
        } finally {
            setLoading(false);
            setTimeout(() => setMensaje(null), 3000);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1>Agregar Pedido</h1>

            {mensaje && (
                <div style={{
                    padding: '10px',
                    marginBottom: '15px',
                    borderRadius: '4px',
                    backgroundColor: mensaje.tipo === 'success' ? '#f0fff0' : '#fff0f0',
                    color: mensaje.tipo === 'success' ? 'green' : 'red',
                    border: `1px solid ${mensaje.tipo === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                    {mensaje.texto}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <input type="hidden" name="cliente_id" value={clienteId || ''} />

                {/* Buscar Cliente */}
                <fieldset style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                    <legend>Buscar Cliente Existente</legend>
                    <label>Buscar Cliente (nombre, dirección, barrio o teléfono):</label>
                    <input
                        type="text"
                        id="direccion_cliente_total"
                        autoComplete="off"
                        onChange={handleBusquedaTotal}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                    {mostrarSugerenciasTotal && sugerenciasTotal.length > 0 && (
                        <div style={{
                            border: '1px solid #ccc',
                            maxHeight: '150px',
                            overflowY: 'auto',
                            backgroundColor: '#fff',
                            position: 'absolute',
                            width: '300px',
                            zIndex: 1000,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {sugerenciasTotal.map(cliente => (
                                <div
                                    key={cliente.id}
                                    onClick={() => seleccionarClienteTotal(cliente)}
                                    style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                                >
                                    {cliente.nombre} - {cliente.direccion} ({cliente.telefono})
                                </div>
                            ))}
                        </div>
                    )}
                </fieldset>

                {/* Datos del Cliente */}
                <fieldset style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                    <legend>Datos del Cliente</legend>

                    <label>Nombre del Cliente:</label>
                    <input type="text" name="nombre_cliente" value={formData.nombre_cliente} onChange={handleChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />

                    <label>Dirección del Cliente:</label>
                    <input
                        type="text"
                        name="direccion_cliente"
                        id="direccion_cliente"
                        value={formData.direccion_cliente}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                    {mostrarSugerenciasDireccion && sugerenciasDireccion.length > 0 && (
                        <div style={{
                            border: '1px solid #ccc',
                            maxHeight: '150px',
                            overflowY: 'auto',
                            backgroundColor: '#fff',
                            position: 'absolute',
                            width: 'calc(100% - 40px)',
                            zIndex: 1000,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {sugerenciasDireccion.map(cliente => (
                                <div
                                    key={cliente.id}
                                    onClick={() => seleccionarClienteDireccion(cliente)}
                                    style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                                >
                                    {cliente.direccion} {cliente.barrio} - {cliente.nombre} ({cliente.telefono})
                                </div>
                            ))}
                        </div>
                    )}

                    <label>Barrio:</label>
                    <input type="text" name="barrio_cliente" value={formData.barrio_cliente} onChange={handleChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />

                    <label>Teléfono del Cliente:</label>
                    <input type="text" name="telefono_cliente" value={formData.telefono_cliente} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />

                    <label>Observaciones del Cliente:</label>
                    <textarea name="observacion_cliente" value={formData.observacion_cliente} onChange={handleChange} rows={2} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                </fieldset>

                {/* Datos del Pedido */}
                <fieldset style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                    <legend>Datos del Pedido</legend>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <label>10kg</label>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '5px' }}>
                                <button type="button" onClick={() => cambiarCantidad('garrafa_10kg', -1)} style={{ width: '30px', height: '30px', backgroundColor: '#6a4c9c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>−</button>
                                <input type="number" name="garrafa_10kg" value={formData.garrafa_10kg} onChange={handleChange} min="0" style={{ width: '60px', textAlign: 'center', padding: '5px' }} />
                                <button type="button" onClick={() => cambiarCantidad('garrafa_10kg', 1)} style={{ width: '30px', height: '30px', backgroundColor: '#6a4c9c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                            </div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <label>15kg</label>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '5px' }}>
                                <button type="button" onClick={() => cambiarCantidad('garrafa_15kg', -1)} style={{ width: '30px', height: '30px', backgroundColor: '#6a4c9c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>−</button>
                                <input type="number" name="garrafa_15kg" value={formData.garrafa_15kg} onChange={handleChange} min="0" style={{ width: '60px', textAlign: 'center', padding: '5px' }} />
                                <button type="button" onClick={() => cambiarCantidad('garrafa_15kg', 1)} style={{ width: '30px', height: '30px', backgroundColor: '#6a4c9c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                            </div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <label>45kg</label>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '5px' }}>
                                <button type="button" onClick={() => cambiarCantidad('garrafa_45kg', -1)} style={{ width: '30px', height: '30px', backgroundColor: '#6a4c9c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>−</button>
                                <input type="number" name="garrafa_45kg" value={formData.garrafa_45kg} onChange={handleChange} min="0" style={{ width: '60px', textAlign: 'center', padding: '5px' }} />
                                <button type="button" onClick={() => cambiarCantidad('garrafa_45kg', 1)} style={{ width: '30px', height: '30px', backgroundColor: '#6a4c9c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                            </div>
                        </div>
                    </div>

                    <label>Observaciones del Pedido:</label>
                    <textarea name="observacion_pedido" value={formData.observacion_pedido} onChange={handleChange} rows={2} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />

                    <label>Estado:</label>
                    <select name="estado" value={formData.estado} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                        <option value="Finalizado">Finalizado</option>
                        <option value="Cuenta">Cuenta</option>
                    </select>

                    <label>Precio:</label>
                    <input type="number" step="0.01" name="precio" value={formData.precio} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />

                    <label>Repartidor:</label>
                    <select name="repartidor" value={formData.repartidor} onChange={handleChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                        <option value="">(Sin asignar)</option>
                        {repartidores.map(r => (
                            <option key={r.id} value={r.id}>{r.nombre} {r.apellido}</option>
                        ))}
                    </select>
                </fieldset>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {loading ? 'Guardando...' : 'Guardar Pedido'}
                    </button>
                    <button type="button" onClick={limpiarFormulario} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        🧹 Limpiar
                    </button>
                </div>
            </form>

            {/* Tabla de últimos pedidos */}
            {ultimosPedidos.length > 0 && (
                <>
                    <h2 style={{ marginTop: '30px' }}>Últimos 10 Pedidos del Cliente</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }} border={1}>
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
                                    <th>Fecha Creación</th>
                                    <th>Repartidor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ultimosPedidos.map((pedido, index) => (
                                    <tr key={pedido.id}>
                                        <td>{index + 1}</td>
                                        <td>{pedido.tipo_pedido || '-'}</td>
                                        <td>{pedido.direccion || ''}</td>
                                        <td>{pedido.barrio || ''}</td>
                                        <td>{pedido.telefono || ''}</td>
                                        <td>{pedido.cliente_nombre || ''}</td>
                                        <td>{pedido.observacion_cliente || ''}</td>
                                        <td>{pedido.estado || ''}</td>
                                        <td>${formatearPrecio(pedido.precio)}</td>
                                        <td>{pedido.observacion_pedido || ''}</td>
                                        <td>{pedido.fecha_creacion || ''}</td>
                                        <td>{pedido.repartidor_nombre ? `${pedido.repartidor_nombre} ${pedido.repartidor_apellido}` : 'Sin asignar'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
                <li><a href="/gestor_clientes_pedidos_react/pedidos/index.php" style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Volver</a></li>
            </ul>
        </div>
    );
};

export default AgregarPedido;