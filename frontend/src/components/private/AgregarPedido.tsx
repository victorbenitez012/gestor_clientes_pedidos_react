/* eslint-disable no-restricted-globals */
import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';

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
    telefono?: string;
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

interface ModalState {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    onConfirm?: () => void;
    onCancel?: () => void;
    onAlternative?: () => void;
    showAlternative?: boolean;
    alternativeText?: string;
    confirmText?: string;
    cancelText?: string;
}

const AgregarPedido: React.FC = () => {
    const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
    const [sugerenciasTotal, setSugerenciasTotal] = useState<Cliente[]>([]);
    const [sugerenciasDireccion, setSugerenciasDireccion] = useState<Cliente[]>([]);
    const [ultimosPedidos, setUltimosPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(false);
    const [clienteId, setClienteId] = useState<number | null>(null);
    const [mostrarSugerenciasTotal, setMostrarSugerenciasTotal] = useState(false);
    const [mostrarSugerenciasDireccion, setMostrarSugerenciasDireccion] = useState(false);
    const [clienteOriginal, setClienteOriginal] = useState<Cliente | null>(null);
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const inputTotalRef = useRef<HTMLInputElement>(null);
    const inputDireccionRef = useRef<HTMLInputElement>(null);
    const sugerenciasTotalRef = useRef<HTMLDivElement>(null);
    const sugerenciasDireccionRef = useRef<HTMLDivElement>(null);

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

    // Funciones de formateo de texto
    const capitalizarPalabras = (texto: string): string => {
        if (!texto) return '';
        return texto.toLowerCase().split(' ').map(palabra => {
            if (palabra.length === 0) return palabra;
            return palabra.charAt(0).toUpperCase() + palabra.slice(1);
        }).join(' ');
    };

    const capitalizarPrimeraLetra = (texto: string): string => {
        if (!texto) return '';
        const textoLower = texto.toLowerCase();
        return textoLower.charAt(0).toUpperCase() + textoLower.slice(1);
    };

    // Función para generar el texto de garrafas solo con valores > 0
    const generarTextoGarrafas = (): string => {
        const partes = [];
        if (formData.garrafa_10kg > 0) partes.push(`${formData.garrafa_10kg} x 10kg`);
        if (formData.garrafa_15kg > 0) partes.push(`${formData.garrafa_15kg} x 15kg`);
        if (formData.garrafa_45kg > 0) partes.push(`${formData.garrafa_45kg} x 45kg`);
        return partes.join(', ');
    };

    const closeModal = () => {
        setModal({ ...modal, isOpen: false });
    };

    // Cerrar sugerencias al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sugerenciasTotalRef.current && !sugerenciasTotalRef.current.contains(event.target as Node) &&
                inputTotalRef.current && !inputTotalRef.current.contains(event.target as Node)) {
                setMostrarSugerenciasTotal(false);
            }
            if (sugerenciasDireccionRef.current && !sugerenciasDireccionRef.current.contains(event.target as Node) &&
                inputDireccionRef.current && !inputDireccionRef.current.contains(event.target as Node)) {
                setMostrarSugerenciasDireccion(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    // Verificar si los datos del cliente fueron modificados (comparación profunda)
    const clienteModificado = (): boolean => {
        if (!clienteOriginal) return false;

        const nombreOriginal = capitalizarPalabras(clienteOriginal.nombre);
        const direccionOriginal = capitalizarPalabras(clienteOriginal.direccion);
        const barrioOriginal = capitalizarPalabras(clienteOriginal.barrio);
        const observacionOriginal = capitalizarPrimeraLetra(clienteOriginal.observacion || '');

        return nombreOriginal !== formData.nombre_cliente ||
            direccionOriginal !== formData.direccion_cliente ||
            barrioOriginal !== formData.barrio_cliente ||
            clienteOriginal.telefono !== formData.telefono_cliente ||
            observacionOriginal !== formData.observacion_cliente;
    };

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

    // Seleccionar cliente (carga directa sin modal)
    const seleccionarCliente = (cliente: Cliente) => {
        setFormData({
            ...formData,
            nombre_cliente: capitalizarPalabras(cliente.nombre),
            direccion_cliente: capitalizarPalabras(cliente.direccion),
            barrio_cliente: capitalizarPalabras(cliente.barrio),
            telefono_cliente: cliente.telefono,
            observacion_cliente: capitalizarPrimeraLetra(cliente.observacion || '')
        });
        setClienteId(cliente.id);
        setClienteOriginal(cliente);
        setSugerenciasTotal([]);
        setSugerenciasDireccion([]);
        setMostrarSugerenciasTotal(false);
        setMostrarSugerenciasDireccion(false);

        if (inputTotalRef.current) inputTotalRef.current.value = '';

        obtenerUltimosPedidos(cliente.id);
    };

    // Cambiar cantidad de garrafas
    const cambiarCantidad = (campo: string, cambio: number) => {
        const valorActual = formData[campo as keyof typeof formData] as number;
        const nuevoValor = Math.max(0, valorActual + cambio);
        setFormData({ ...formData, [campo]: nuevoValor });
    };

    // Manejar cambio en inputs con formateo
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'nombre_cliente') {
            setFormData({ ...formData, [name]: capitalizarPalabras(value) });
        } else if (name === 'direccion_cliente') {
            setFormData({ ...formData, [name]: capitalizarPalabras(value) });
        } else if (name === 'barrio_cliente') {
            setFormData({ ...formData, [name]: capitalizarPalabras(value) });
        } else if (name === 'observacion_cliente') {
            setFormData({ ...formData, [name]: capitalizarPrimeraLetra(value) });
        } else if (name === 'observacion_pedido') {
            setFormData({ ...formData, [name]: capitalizarPrimeraLetra(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleDireccionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, direccion_cliente: capitalizarPalabras(value) });
        buscarClientesDireccion(value);
    };

    const handleBusquedaTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        buscarClientesTotal(e.target.value);
    };

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
        setClienteOriginal(null);
        setUltimosPedidos([]);
        setSugerenciasTotal([]);
        setSugerenciasDireccion([]);
        setMostrarSugerenciasTotal(false);
        setMostrarSugerenciasDireccion(false);

        if (inputTotalRef.current) inputTotalRef.current.value = '';
        if (inputDireccionRef.current) inputDireccionRef.current.value = '';
    };

    const formatearPrecio = (precio: number | string): string => {
        const num = typeof precio === 'string' ? parseFloat(precio) : precio;
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const realizarSubmit = async (actualizarCliente: boolean = false) => {
        setLoading(true);

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

        if (actualizarCliente && clienteId) {
            submitFormData.append('cliente_id', clienteId.toString());
        }

        try {
            const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/pedidos/agregar.php', {
                method: 'POST',
                body: submitFormData
            });

            const text = await response.text();
            console.log('Respuesta:', text);

            const whatsappMatch = text.match(/https:\/\/api\.whatsapp\.com\/send\?phone=[^&]+&text=[^'\s"]+/);

            if (text.includes('confirm') || text.includes('WhatsApp') || text.includes('Pedido registrado')) {
                setModal({
                    isOpen: true,
                    title: '¡Éxito!',
                    message: 'Pedido registrado exitosamente',
                    type: 'success',
                    onConfirm: () => closeModal(),
                    showAlternative: false,
                    confirmText: 'Aceptar',
                    cancelText: 'Cerrar'
                });

                const urlWhatsapp = whatsappMatch ? whatsappMatch[0] : null;

                if (urlWhatsapp) {
                    setTimeout(() => {
                        setModal({
                            isOpen: true,
                            title: 'Enviar WhatsApp',
                            message: '¿Quieres enviar los detalles del pedido al repartidor por WhatsApp?',
                            type: 'info',
                            onConfirm: () => {
                                window.open(urlWhatsapp, '_blank');
                                closeModal();
                            },
                            onCancel: () => closeModal(),
                            showAlternative: false,
                            confirmText: 'Enviar WhatsApp',
                            cancelText: 'No enviar'
                        });
                    }, 500);
                }

                setFormData(prev => ({
                    ...prev,
                    observacion_pedido: '',
                    precio: '',
                    garrafa_10kg: 0,
                    garrafa_15kg: 0,
                    garrafa_45kg: 0
                }));

                if (clienteId || formData.direccion_cliente) {
                    const buscarClienteResp = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/pedidos/agregar.php?buscar_cliente=1&direccion_busqueda=${encodeURIComponent(formData.direccion_cliente)}`);
                    const clientesEncontrados = await buscarClienteResp.json();
                    if (clientesEncontrados && clientesEncontrados.length > 0) {
                        const nuevoClienteId = clientesEncontrados[0].id;
                        setClienteId(nuevoClienteId);
                        setClienteOriginal(clientesEncontrados[0]);
                        obtenerUltimosPedidos(nuevoClienteId);
                    }
                }
            } else if (text.includes('error')) {
                setModal({
                    isOpen: true,
                    title: 'Error',
                    message: 'Error al guardar el pedido',
                    type: 'error',
                    onConfirm: () => closeModal(),
                    showAlternative: false,
                    confirmText: 'Aceptar',
                    cancelText: 'Cerrar'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Error al guardar el pedido',
                type: 'error',
                onConfirm: () => closeModal(),
                showAlternative: false,
                confirmText: 'Aceptar',
                cancelText: 'Cerrar'
            });
        } finally {
            setLoading(false);
        }
    };

    // Enviar formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.garrafa_10kg === 0 && formData.garrafa_15kg === 0 && formData.garrafa_45kg === 0) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Debes agregar al menos una garrafa.',
                type: 'error',
                onConfirm: () => closeModal(),
                showAlternative: false,
                confirmText: 'Aceptar',
                cancelText: 'Cerrar'
            });
            return;
        }

        if (!formData.direccion_cliente || !formData.telefono_cliente || !formData.precio) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Por favor completa todos los campos obligatorios.',
                type: 'error',
                onConfirm: () => closeModal(),
                showAlternative: false,
                confirmText: 'Aceptar',
                cancelText: 'Cerrar'
            });
            return;
        }

        if (clienteId && clienteModificado()) {
            setModal({
                isOpen: true,
                title: 'Cliente modificado',
                message: 'Los datos del cliente han sido modificados.\n\n¿Qué deseas hacer?\n\n• ACTUALIZAR: Modificar el cliente existente\n• NUEVO CLIENTE: Crear un cliente nuevo con estos datos\n• CANCELAR: Volver atrás sin guardar',
                type: 'warning',
                onConfirm: () => {
                    closeModal();
                    realizarSubmit(true);
                },
                onCancel: () => {
                    closeModal();
                },
                onAlternative: () => {
                    closeModal();
                    setClienteId(null);
                    setClienteOriginal(null);
                    setTimeout(() => {
                        realizarSubmit(false);
                    }, 100);
                },
                showAlternative: true,
                alternativeText: 'Nuevo Cliente',
                confirmText: 'Actualizar Cliente',
                cancelText: 'Cancelar'
            });
            return;
        }

        realizarSubmit(false);
    };

    const textoGarrafasMostrar = generarTextoGarrafas();

    return (
        <div className="agregar-pedido-container">
            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                onConfirm={modal.onConfirm}
                onCancel={modal.onCancel}
                onAlternative={modal.onAlternative}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                confirmText={modal.confirmText || 'Aceptar'}
                cancelText={modal.cancelText || 'Cancelar'}
                alternativeText={modal.alternativeText || 'Nuevo Cliente'}
                showConfirm={!!modal.onConfirm}
                showAlternative={modal.showAlternative || false}
            />

            <form onSubmit={handleSubmit} className="formulario-pedido">
                <input type="hidden" name="cliente_id" value={clienteId || ''} />

                <div className="campo-busqueda-cliente">
                    <label>🔍 Buscar Cliente Existente (nombre, dirección, barrio o teléfono):</label>
                    <input
                        type="text"
                        ref={inputTotalRef}
                        className="input-busqueda"
                        placeholder="Escribe para buscar un cliente existente..."
                        autoComplete="off"
                        onChange={handleBusquedaTotalChange}
                    />
                    {mostrarSugerenciasTotal && sugerenciasTotal.length > 0 && (
                        <div ref={sugerenciasTotalRef} className="sugerencias">
                            {sugerenciasTotal.map(cliente => (
                                <div key={cliente.id} className="sugerencia" onClick={() => seleccionarCliente(cliente)}>
                                    <strong>{capitalizarPalabras(cliente.nombre)}</strong><br />
                                    <small>{capitalizarPalabras(cliente.direccion)} - {capitalizarPalabras(cliente.barrio)} | Tel: {cliente.telefono}</small>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="three-columns">
                    <div className="columna-cliente">
                        <fieldset>
                            <legend>👤 Datos del Cliente</legend>

                            <div className="form-group">
                                <label>Nombre del Cliente:</label>
                                <input type="text" name="nombre_cliente" value={formData.nombre_cliente} onChange={handleChange} />
                            </div>

                            <div className="form-group" style={{ position: 'relative' }}>
                                <label>Dirección del Cliente:</label>
                                <input
                                    type="text"
                                    ref={inputDireccionRef}
                                    name="direccion_cliente"
                                    value={formData.direccion_cliente}
                                    onChange={handleDireccionChange}
                                    placeholder="Ej: Calle Principal 123"
                                    autoComplete="off"
                                    required
                                />
                                {mostrarSugerenciasDireccion && sugerenciasDireccion.length > 0 && (
                                    <div ref={sugerenciasDireccionRef} className="sugerencias-direccion">
                                        {sugerenciasDireccion.map(cliente => (
                                            <div key={cliente.id} className="sugerencia" onClick={() => seleccionarCliente(cliente)}>
                                                <strong>{capitalizarPalabras(cliente.direccion)}</strong><br />
                                                <small>{capitalizarPalabras(cliente.barrio)} - {capitalizarPalabras(cliente.nombre)} | Tel: {cliente.telefono}</small>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Barrio:</label>
                                    <input type="text" name="barrio_cliente" value={formData.barrio_cliente} onChange={handleChange} placeholder="Ej: Centro" />
                                </div>

                                <div className="form-group">
                                    <label>Teléfono del Cliente:</label>
                                    <input type="text" name="telefono_cliente" value={formData.telefono_cliente} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Observaciones del Cliente:</label>
                                <textarea name="observacion_cliente" value={formData.observacion_cliente} onChange={handleChange} rows={3} placeholder="Referencias, datos adicionales..."></textarea>
                            </div>
                        </fieldset>
                    </div>

                    <div className="columna-pedido">
                        <fieldset>
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

                            {textoGarrafasMostrar && (
                                <div className="resumen-garrafas">
                                    <strong>📊 Resumen:</strong> {textoGarrafasMostrar}
                                </div>
                            )}

                            <div className="form-group">
                                <label>Observaciones del Pedido:</label>
                                <textarea name="observacion_pedido" value={formData.observacion_pedido} onChange={handleChange} rows={2} placeholder="Instrucciones especiales, horario de entrega, etc."></textarea>
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
                        </fieldset>
                    </div>

                    <div className="columna-botones">
                        <div className="botones-vertical">
                            <button type="submit" disabled={loading} className="btn-guardar-vertical">
                                {loading ? 'Guardando...' : '💾 Guardar Pedido'}
                            </button>
                            <button type="button" onClick={limpiarFormulario} className="btn-limpiar-vertical">
                                🧹 Limpiar Formulario
                            </button>
                            <a href="/gestor_clientes_pedidos_react/pedidos" className="btn-volver-vertical">
                                ← Volver
                            </a>
                        </div>
                    </div>
                </div>
            </form>

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
        </div>
    );
};

export default AgregarPedido;