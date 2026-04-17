// frontend/src/components/private/agregar-pedido/AgregarPedido.tsx
/* eslint-disable no-restricted-globals */
import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../common/Modal';
import BuscadorCliente from './BuscadorCliente';
import FormularioCliente from './FormularioCliente';
import FormularioPedido from './FormularioPedido';
import BotonesAccion from './BotonesAccion';
import TablaUltimosPedidos from './TablaUltimosPedidos';
import { useFormateoTexto } from './hooks/useFormateoTexto';
import { useBuscarCliente } from './hooks/useBuscarCliente';
import { useGuardarPedido } from './hooks/useGuardarPedido';
import { Cliente, Repartidor, FormDataPedido, Pedido } from './types';

const AgregarPedido: React.FC = () => {
    // Hooks personalizados
    const { capitalizarPalabras, capitalizarPrimeraLetra, generarTextoGarrafas } = useFormateoTexto();
    const {
        sugerenciasTotal,
        sugerenciasDireccion,
        mostrarSugerenciasTotal,
        mostrarSugerenciasDireccion,
        buscarClientesTotal,
        buscarClientesDireccion,
        limpiarSugerencias,
        setMostrarSugerenciasTotal,
        setMostrarSugerenciasDireccion
    } = useBuscarCliente();
    const { loading, modal, setModal, closeModal, realizarSubmit } = useGuardarPedido();

    // Estado local
    const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
    const [ultimosPedidos, setUltimosPedidos] = useState<Pedido[]>([]);
    const [clienteId, setClienteId] = useState<number | null>(null);
    const [clienteOriginal, setClienteOriginal] = useState<Cliente | null>(null);

    // Refs
    const inputTotalRef = useRef<HTMLInputElement>(null);
    const inputDireccionRef = useRef<HTMLInputElement>(null);

    // Estado del formulario
    const [formData, setFormData] = useState<FormDataPedido>({
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
        garrafa_45kg: 0,
        fecha_entrega_programada: '',
        es_programado: false
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

    // Verificar si los datos del cliente fueron modificados
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

    // Seleccionar cliente
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
        limpiarSugerencias();
        setMostrarSugerenciasTotal(false);
        setMostrarSugerenciasDireccion(false);

        if (inputTotalRef.current) inputTotalRef.current.value = '';
        obtenerUltimosPedidos(cliente.id);
    };

    // Manejar cambios en el formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'nombre_cliente' || name === 'direccion_cliente' || name === 'barrio_cliente') {
            setFormData({ ...formData, [name]: capitalizarPalabras(value) });
        } else if (name === 'observacion_cliente' || name === 'observacion_pedido') {
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

    const handleBusquedaTotalChange = (busqueda: string) => {
        buscarClientesTotal(busqueda);
    };

    const handleGarrafaChange = (campo: string, valor: number) => {
        setFormData({ ...formData, [campo]: valor });
    };

    const handleFechaChange = (fecha: string) => {
        setFormData(prev => ({ ...prev, fecha_entrega_programada: fecha }));
    };

    const handleProgramadoChange = (esProgramado: boolean) => {
        setFormData(prev => ({ ...prev, es_programado: esProgramado }));
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
            garrafa_45kg: 0,
            fecha_entrega_programada: '',
            es_programado: false
        });
        setClienteId(null);
        setClienteOriginal(null);
        setUltimosPedidos([]);
        limpiarSugerencias();

        if (inputTotalRef.current) inputTotalRef.current.value = '';
        if (inputDireccionRef.current) inputDireccionRef.current.value = '';
    };

    const mostrarModalWhatsApp = (urlWhatsapp: string) => {
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
    };

    // Enviar formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones
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

        // Validar fecha programada
        if (formData.es_programado && !formData.fecha_entrega_programada) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Por favor selecciona una fecha para la entrega programada.',
                type: 'error',
                onConfirm: () => closeModal(),
                showAlternative: false,
                confirmText: 'Aceptar',
                cancelText: 'Cerrar'
            });
            return;
        }

        // Si el cliente existe y fue modificado, preguntar qué hacer
        if (clienteId && clienteModificado()) {
            setModal({
                isOpen: true,
                title: 'Cliente modificado',
                message: 'Los datos del cliente han sido modificados.\n\n¿Qué deseas hacer?\n\n• ACTUALIZAR: Modificar el cliente existente\n• NUEVO CLIENTE: Crear un cliente nuevo con estos datos\n• CANCELAR: Volver atrás sin guardar',
                type: 'warning',
                onConfirm: async () => {
                    closeModal();
                    const result = await realizarSubmit(formData, clienteId, true);
                    if (result.success && result.whatsappUrl) {
                        mostrarModalWhatsApp(result.whatsappUrl);
                        limpiarFormulario();
                    }
                },
                onCancel: () => closeModal(),
                onAlternative: async () => {
                    closeModal();
                    setClienteId(null);
                    setClienteOriginal(null);
                    setTimeout(async () => {
                        const result = await realizarSubmit(formData, null, false);
                        if (result.success && result.whatsappUrl) {
                            mostrarModalWhatsApp(result.whatsappUrl);
                            limpiarFormulario();
                        }
                    }, 100);
                },
                showAlternative: true,
                alternativeText: 'Nuevo Cliente',
                confirmText: 'Actualizar Cliente',
                cancelText: 'Cancelar'
            });
            return;
        }

        const result = await realizarSubmit(formData, clienteId, false);
        if (result.success && result.whatsappUrl) {
            mostrarModalWhatsApp(result.whatsappUrl);
            limpiarFormulario();

            // Recargar últimos pedidos si es necesario
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
        }
    };

    const textoGarrafasMostrar = generarTextoGarrafas({
        garrafa_10kg: formData.garrafa_10kg,
        garrafa_15kg: formData.garrafa_15kg,
        garrafa_45kg: formData.garrafa_45kg
    });

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

                <BuscadorCliente
                    onClienteSeleccionado={seleccionarCliente}
                    onBusquedaChange={handleBusquedaTotalChange}
                    sugerencias={sugerenciasTotal}
                    mostrarSugerencias={mostrarSugerenciasTotal}
                    setMostrarSugerencias={setMostrarSugerenciasTotal}
                    inputRef={inputTotalRef}
                />

                <div className="three-columns">
                    <FormularioCliente
                        data={formData}
                        onChange={handleChange}
                        onDireccionChange={handleDireccionChange}
                        inputDireccionRef={inputDireccionRef}
                        sugerenciasDireccion={sugerenciasDireccion}
                        mostrarSugerenciasDireccion={mostrarSugerenciasDireccion}
                        onSeleccionarCliente={seleccionarCliente}
                        setMostrarSugerenciasDireccion={setMostrarSugerenciasDireccion}
                    />

                    <FormularioPedido
                        garrafas={{
                            garrafa_10kg: formData.garrafa_10kg,
                            garrafa_15kg: formData.garrafa_15kg,
                            garrafa_45kg: formData.garrafa_45kg
                        }}
                        onGarrafaChange={handleGarrafaChange}
                        textoGarrafasMostrar={textoGarrafasMostrar}
                        observacion_pedido={formData.observacion_pedido}
                        estado={formData.estado}
                        precio={formData.precio}
                        repartidor={formData.repartidor}
                        repartidores={repartidores}
                        fecha_entrega_programada={formData.fecha_entrega_programada}
                        es_programado={formData.es_programado}
                        onChange={handleChange}
                        onFechaChange={handleFechaChange}
                        onProgramadoChange={handleProgramadoChange}
                    />

                    <BotonesAccion
                        onGuardar={handleSubmit as any}
                        onLimpiar={limpiarFormulario}
                        loading={loading}
                    />
                </div>
            </form>

            <TablaUltimosPedidos pedidos={ultimosPedidos} />
        </div>
    );
};

export default AgregarPedido;