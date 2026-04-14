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

    // Seleccionar cliente
    const seleccionarCliente = (cliente: Cliente, tipo: 'total' | 'direccion') => {
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
        setSugerenciasDireccion([]);
        setMostrarSugerenciasTotal(false);
        setMostrarSugerenciasDireccion(false);

        // Limpiar inputs de búsqueda
        const inputTotal = document.getElementById('buscar_cliente_total') as HTMLInputElement;
        const inputDireccion = document.getElementById('direccion_cliente') as HTMLInputElement;
        if (inputTotal) inputTotal.value = '';
        if (inputDireccion && tipo === 'direccion') inputDireccion.value = cliente.direccion;

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
    };

    // Manejar cambio en dirección con búsqueda
    const handleDireccionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, direccion_cliente: value });
        buscarClientesDireccion(value);
    };

    // Manejar cambio en búsqueda general
    const handleBusquedaTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const inputTotal = document.getElementById('buscar_cliente_total') as HTMLInputElement;
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

        if (formData.garrafa_10kg === 0 && formData.garrafa_15kg === 0 && formData.garrafa_45kg === 0) {
            setMensaje({ texto: 'Debes agregar al menos una garrafa.', tipo: 'error' });
            return;
        }

        if (!formData.direccion_cliente || !formData.telefono_cliente || !formData.precio) {
            setMensaje({ texto: 'Por favor completa todos los campos obligatorios.', tipo: 'error' });
            return;
        }

        setLoading(true);
        setMensaje(null);

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
                setMensaje({ texto: '¡Pedido registrado exitosamente!', tipo: 'success' });

                const match = text.match(/window\.location\.href = '([^']+)'/);
                if (match && match[1]) {
                    const confirmar = window.confirm('¿Quieres enviar los detalles del pedido al repartidor por WhatsApp?');
                    if (confirmar) {
                        window.open(match[1], '_blank');
                    }
                }

                setFormData(prev => ({
                    ...prev,
                    observacion_pedido: '',
                    precio: '',
                    garrafa_10kg: 0,
                    garrafa_15kg: 0,
                    garrafa_45kg: 0
                }));

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
            setTimeout(() => setMensaje(null), 5000);
        }
    };

    return (
        <div className="agregar-pedido-container">
            <h1>Agregar Pedido</h1>

            {mensaje && (
                <div className={mensaje.tipo === 'success' ? 'mensaje-exito' : 'mensaje-error'}>
                    {mensaje.texto}
                </div>
            )}

            <form onSubmit={handleSubmit} className="formulario-pedido">
                <input type="hidden" name="cliente_id" value={clienteId || ''} />

                {/* Buscar Cliente Existente */}
                <fieldset className="fieldset-buscar">
                    <legend>🔍 Buscar Cliente Existente</legend>
                    <div className="campo-busqueda">
                        <label>Buscar Cliente (nombre, dirección, barrio o teléfono):</label>
                        <input
                            type="text"
                            id="buscar_cliente_total"
                            className="input-busqueda"
                            placeholder="Escribe para buscar..."
                            autoComplete="off"
                            onChange={handleBusquedaTotalChange}
                        />
                        {mostrarSugerenciasTotal && sugerenciasTotal.length > 0 && (
                            <div className="sugerencias">
                                {sugerenciasTotal.map(cliente => (
                                    <div key={cliente.id} className="sugerencia" onClick={() => seleccionarCliente(cliente, 'total')}>
                                        <strong>{cliente.nombre}</strong><br />
                                        <small>{cliente.direccion} - {cliente.barrio} | Tel: {cliente.telefono}</small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </fieldset>

                {/* Datos del Cliente */}
                <fieldset className="fieldset-cliente">
                    <legend>👤 Datos del Cliente</legend>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombre del Cliente:</label>
                            <input type="text" name="nombre_cliente" value={formData.nombre_cliente} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Teléfono del Cliente:</label>
                            <input type="text" name="telefono_cliente" value={formData.telefono_cliente} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Dirección del Cliente:</label>
                            <input
                                type="text"
                                id="direccion_cliente"
                                name="direccion_cliente"
                                value={formData.direccion_cliente}
                                onChange={handleDireccionChange}
                                placeholder="Ej: Calle Principal 123"
                                autoComplete="off"
                                required
                            />
                            {mostrarSugerenciasDireccion && sugerenciasDireccion.length > 0 && (
                                <div className="sugerencias sugerencias-direccion">
                                    {sugerenciasDireccion.map(cliente => (
                                        <div key={cliente.id} className="sugerencia" onClick={() => seleccionarCliente(cliente, 'direccion')}>
                                            <strong>{cliente.direccion}</strong><br />
                                            <small>{cliente.barrio} - {cliente.nombre} | Tel: {cliente.telefono}</small>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Barrio:</label>
                            <input type="text" name="barrio_cliente" value={formData.barrio_cliente} onChange={handleChange} placeholder="Ej: Centro" />
                        </div>

                        <div className="form-group">
                            <label>Observaciones del Cliente:</label>
                            <textarea name="observacion_cliente" value={formData.observacion_cliente} onChange={handleChange} rows={2} placeholder="Referencias, datos adicionales..."></textarea>
                        </div>
                    </div>
                </fieldset>

                {/* Datos del Pedido */}
                <fieldset className="fieldset-pedido">
                    <legend>📦 Datos del Pedido</legend>

                    <div className="garrafas-container">
                        <div className="garrafa-card">
                            <div className="garrafa-icon">🫙</div>
                            <div className="garrafa-label">10 kg</div>
                            <div className="control-cantidad">
                                <button type="button" onClick={() => cambiarCantidad('garrafa_10kg', -1)} className="btn-cantidad">−</button>
                                <input type="number" name="garrafa_10kg" value={formData.garrafa_10kg} onChange={handleChange} min="0" />
                                <button type="button" onClick={() => cambiarCantidad('garrafa_10kg', 1)} className="btn-cantidad">+</button>
                            </div>
                        </div>

                        <div className="garrafa-card">
                            <div className="garrafa-icon">🫙</div>
                            <div className="garrafa-label">15 kg</div>
                            <div className="control-cantidad">
                                <button type="button" onClick={() => cambiarCantidad('garrafa_15kg', -1)} className="btn-cantidad">−</button>
                                <input type="number" name="garrafa_15kg" value={formData.garrafa_15kg} onChange={handleChange} min="0" />
                                <button type="button" onClick={() => cambiarCantidad('garrafa_15kg', 1)} className="btn-cantidad">+</button>
                            </div>
                        </div>

                        <div className="garrafa-card">
                            <div className="garrafa-icon">🫙</div>
                            <div className="garrafa-label">45 kg</div>
                            <div className="control-cantidad">
                                <button type="button" onClick={() => cambiarCantidad('garrafa_45kg', -1)} className="btn-cantidad">−</button>
                                <input type="number" name="garrafa_45kg" value={formData.garrafa_45kg} onChange={handleChange} min="0" />
                                <button type="button" onClick={() => cambiarCantidad('garrafa_45kg', 1)} className="btn-cantidad">+</button>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Observaciones del Pedido:</label>
                            <textarea name="observacion_pedido" value={formData.observacion_pedido} onChange={handleChange} rows={2} placeholder="Instrucciones especiales, horario de entrega, etc."></textarea>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Estado:</label>
                            <select name="estado" value={formData.estado} onChange={handleChange} required>
                                <option value="Pendiente">⏳ Pendiente</option>
                                <option value="En Proceso">🔄 En Proceso</option>
                                <option value="Entregado">✅ Entregado</option>
                                <option value="Cancelado">❌ Cancelado</option>
                                <option value="Finalizado">🏁 Finalizado</option>
                                <option value="Cuenta">💰 Cuenta</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Precio:</label>
                            <input type="number" step="0.01" name="precio" value={formData.precio} onChange={handleChange} placeholder="0.00" required />
                        </div>

                        <div className="form-group">
                            <label>Repartidor:</label>
                            <select name="repartidor" value={formData.repartidor} onChange={handleChange}>
                                <option value="">(Sin asignar)</option>
                                {repartidores.map(r => (
                                    <option key={r.id} value={r.id}>🚚 {r.nombre} {r.apellido}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <div className="acciones-formulario">
                    <button type="submit" disabled={loading} className="btn-guardar">
                        {loading ? 'Guardando...' : '💾 Guardar Pedido'}
                    </button>
                    <button type="button" onClick={limpiarFormulario} className="btn-limpiar">
                        🧹 Limpiar Formulario
                    </button>
                </div>
            </form>

            {/* Tabla de últimos pedidos */}
            {ultimosPedidos.length > 0 && (
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
                                {ultimosPedidos.map((pedido, index) => (
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
            )}

            <ul className="menu">
                <li><a href="/gestor_clientes_pedidos_react/pedidos/index.php" className="btn-volver">← Volver al listado de pedidos</a></li>
            </ul>
        </div>
    );
};

export default AgregarPedido;