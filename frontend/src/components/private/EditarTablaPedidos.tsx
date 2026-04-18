import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Modal from '../common/Modal';

interface Pedido {
    id: number;
    tipo_pedido: string;
    estado: string;
    precio: number;
    observacion_pedido: string;
    repartidor_id: number | null;
    fecha_creacion: string;
    garrafa_10kg: number;
    garrafa_15kg: number;
    garrafa_45kg: number;
    direccion: string;
    barrio: string;
    telefono: string;
    cliente_nombre: string;
    cliente_observacion: string;
    repartidor_nombre?: string;
    repartidor_apellido?: string;
    fecha_entrega_programada?: string | null;
    es_programado?: number;
}

interface Repartidor {
    id: number;
    nombre: string;
    apellido: string;
}

interface ModalState {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    onConfirm?: () => void;
    onCancel?: () => void;
    whatsappUrl?: string | null;
}

const EditarTablaPedidos: React.FC = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [pedidosOriginales, setPedidosOriginales] = useState<Pedido[]>([]);
    const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
    const [search, setSearch] = useState('');
    const [searchSecondary, setSearchSecondary] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [repartidorFiltro, setRepartidorFiltro] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('');
    const [tipoEntregaFiltro, setTipoEntregaFiltro] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [mensajesWhatsapp, setMensajesWhatsapp] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showWhatsappList, setShowWhatsappList] = useState(false);
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const registrosPorPagina = 50;
    const TOTAL_RENGLONES_IMPRESION = 35;

    // Calcular totales
    const totalPrecio = pedidos.reduce((sum, p) => sum + (Number(p.precio) || 0), 0);
    const totalGarrafas10kg = pedidos.reduce((sum, p) => sum + (p.garrafa_10kg || 0), 0);
    const totalGarrafas15kg = pedidos.reduce((sum, p) => sum + (p.garrafa_15kg || 0), 0);
    const totalGarrafas45kg = pedidos.reduce((sum, p) => sum + (p.garrafa_45kg || 0), 0);

    const closeModal = () => {
        setModal({ ...modal, isOpen: false });
    };

    const capitalizarPalabras = (texto: string): string => {
        if (!texto) return '';
        return texto
            .toLowerCase()
            .split(' ')
            .map(palabra => {
                if (palabra.length > 0 && !/^\d+$/.test(palabra)) {
                    return palabra.charAt(0).toUpperCase() + palabra.slice(1);
                }
                return palabra;
            })
            .join(' ');
    };

    const capitalizarPrimeraLetra = (texto: string): string => {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    };

    const formatearPedido = (pedido: Pedido): Pedido => {
        return {
            ...pedido,
            tipo_pedido: capitalizarPalabras(pedido.tipo_pedido),
            observacion_pedido: capitalizarPrimeraLetra(pedido.observacion_pedido || ''),
            cliente_nombre: capitalizarPalabras(pedido.cliente_nombre),
            direccion: capitalizarPalabras(pedido.direccion),
            barrio: capitalizarPalabras(pedido.barrio),
            cliente_observacion: capitalizarPrimeraLetra(pedido.cliente_observacion || '')
        };
    };

    const formatearFecha = (fecha: string | null | undefined): string => {
        if (!fecha || fecha === '0000-00-00') return 'Inmediato';
        const [year, month, day] = fecha.split('-');
        return `${day}/${month}/${year}`;
    };

    // Cargar repartidores
    useEffect(() => {
        const fetchRepartidores = async () => {
            try {
                const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/repartidores/index.php');
                if (response.ok) {
                    const data = await response.json();
                    setRepartidores(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error('Error cargando repartidores:', err);
            }
        };
        fetchRepartidores();
    }, []);

    const haCambiado = (original: Pedido, actual: Pedido): boolean => {
        // Normalizar fechas para comparación
        const fechaOriginal = original.fecha_entrega_programada === '0000-00-00' ? null : original.fecha_entrega_programada;
        const fechaActual = actual.fecha_entrega_programada === '0000-00-00' ? null : actual.fecha_entrega_programada;

        return original.tipo_pedido !== actual.tipo_pedido ||
            original.garrafa_10kg !== actual.garrafa_10kg ||
            original.garrafa_15kg !== actual.garrafa_15kg ||
            original.garrafa_45kg !== actual.garrafa_45kg ||
            original.estado !== actual.estado ||
            Number(original.precio) !== Number(actual.precio) ||
            original.observacion_pedido !== actual.observacion_pedido ||
            original.repartidor_id !== actual.repartidor_id ||
            fechaOriginal !== fechaActual ||
            (original.es_programado || 0) !== (actual.es_programado || 0);
    };

    const obtenerPedidosModificados = (): any[] => {
        return pedidos.filter((pedido, index) => {
            const original = pedidosOriginales[index];
            return original && haCambiado(original, pedido);
        }).map(pedido => {
            // IMPORTANTE: Usar la misma lógica que funciona en agregar_pedido.php
            let esProgramado = pedido.es_programado || 0;
            let fechaProgramada = null;

            // Si el checkbox está marcado O hay una fecha válida
            const tieneFechaValida = pedido.fecha_entrega_programada &&
                pedido.fecha_entrega_programada !== '' &&
                pedido.fecha_entrega_programada !== '0000-00-00';

            if (esProgramado === 1 || tieneFechaValida) {
                esProgramado = 1;
                if (tieneFechaValida) {
                    fechaProgramada = pedido.fecha_entrega_programada;
                } else {
                    // Fecha por defecto: mañana
                    const manana = new Date();
                    manana.setDate(manana.getDate() + 1);
                    fechaProgramada = manana.toISOString().split('T')[0];
                }
            }

            console.log(`Pedido ${pedido.id}: esProgramado=${esProgramado}, fecha=${fechaProgramada}`);

            return {
                id: pedido.id,
                tipo_pedido: pedido.tipo_pedido,
                garrafa_10kg: pedido.garrafa_10kg || 0,
                garrafa_15kg: pedido.garrafa_15kg || 0,
                garrafa_45kg: pedido.garrafa_45kg || 0,
                estado: pedido.estado,
                precio: pedido.precio,
                observacion_pedido: pedido.observacion_pedido || '',
                repartidor_id: pedido.repartidor_id || null,
                es_programado: esProgramado,
                fecha_entrega_programada: fechaProgramada
            };
        });
    };

    const cargarPedidos = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (searchSecondary) params.append('search_secondary', searchSecondary);
            if (fechaDesde) params.append('fecha_desde', fechaDesde);
            if (fechaHasta) params.append('fecha_hasta', fechaHasta);
            if (repartidorFiltro) params.append('repartidor_filtro', repartidorFiltro);
            if (estadoFiltro) params.append('estado_filtro', estadoFiltro);
            if (tipoEntregaFiltro) params.append('tipo_entrega_filtro', tipoEntregaFiltro);
            params.append('pagina', paginaActual.toString());
            params.append('registros_por_pagina', registrosPorPagina.toString());

            const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/pedidos/editar_tabla.php?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            let pedidosData: Pedido[] = [];
            let totalReg = 0;
            let totalPag = 1;

            if (Array.isArray(data)) {
                pedidosData = data;
                totalReg = data.length;
                totalPag = 1;
            } else if (data.pedidos && Array.isArray(data.pedidos)) {
                pedidosData = data.pedidos;
                totalReg = data.total_registros || data.pedidos.length;
                totalPag = data.total_paginas || 1;
            } else {
                setError('Formato de datos inválido');
                setPedidos([]);
                setPedidosOriginales([]);
                setTotalRegistros(0);
                setTotalPaginas(1);
                setLoading(false);
                return;
            }

            // Normalizar fechas al cargar
            const pedidosNormalizados = pedidosData.map(pedido => ({
                ...pedido,
                fecha_entrega_programada: pedido.fecha_entrega_programada === '0000-00-00' ? null : pedido.fecha_entrega_programada,
                es_programado: pedido.es_programado || 0
            }));

            const pedidosFormateados = pedidosNormalizados.map(pedido => formatearPedido(pedido));

            setPedidos(pedidosFormateados);
            setPedidosOriginales(JSON.parse(JSON.stringify(pedidosFormateados)));
            setTotalRegistros(totalReg);
            setTotalPaginas(totalPag);

        } catch (err) {
            console.error('Error cargando pedidos:', err);
            setError('Error al cargar los pedidos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarPedidos();
    }, [search, searchSecondary, fechaDesde, fechaHasta, repartidorFiltro, estadoFiltro, tipoEntregaFiltro, paginaActual]);

    const handlePedidoChange = (index: number, field: keyof Pedido, value: any, aplicarFormateo: boolean = false) => {
        let valorFinal = value;

        if (aplicarFormateo) {
            switch (field) {
                case 'tipo_pedido':
                    valorFinal = capitalizarPalabras(value);
                    break;
                case 'observacion_pedido':
                    valorFinal = capitalizarPrimeraLetra(value);
                    break;
                default:
                    break;
            }
        }

        const nuevosPedidos = [...pedidos];
        nuevosPedidos[index] = { ...nuevosPedidos[index], [field]: valorFinal };
        setPedidos(nuevosPedidos);
    };

    // ============ FUNCIÓN CORREGIDA PARA CAMBIAR FECHA PROGRAMADA ============
    const handleFechaProgramadaChange = (index: number, value: string) => {
        const nuevosPedidos = [...pedidos];
        if (value && value !== '') {
            nuevosPedidos[index] = {
                ...nuevosPedidos[index],
                fecha_entrega_programada: value,
                es_programado: 1
            };
        } else {
            nuevosPedidos[index] = {
                ...nuevosPedidos[index],
                fecha_entrega_programada: null,
                es_programado: 0
            };
        }
        setPedidos(nuevosPedidos);
    };

    // ============ FUNCIÓN CORREGIDA PARA TOGGLE PROGRAMADO ============
    const handleProgramadoToggle = (index: number, checked: boolean) => {
        const nuevosPedidos = [...pedidos];
        if (!checked) {
            nuevosPedidos[index] = {
                ...nuevosPedidos[index],
                es_programado: 0,
                fecha_entrega_programada: null
            };
        } else {
            const fechaActual = nuevosPedidos[index].fecha_entrega_programada;
            if (!fechaActual || fechaActual === '' || fechaActual === '0000-00-00') {
                const manana = new Date();
                manana.setDate(manana.getDate() + 1);
                nuevosPedidos[index] = {
                    ...nuevosPedidos[index],
                    es_programado: 1,
                    fecha_entrega_programada: manana.toISOString().split('T')[0]
                };
            } else {
                nuevosPedidos[index] = {
                    ...nuevosPedidos[index],
                    es_programado: 1
                };
            }
        }
        setPedidos(nuevosPedidos);
    };

    const handleGuardarCambios = async (e: React.FormEvent) => {
        e.preventDefault();

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
            console.log('Enviando pedidos modificados:', pedidosModificados); // Debug

            const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/pedidos/editar_tabla.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pedidos: pedidosModificados,
                    update_all: true
                })
            });

            const data = await response.json();

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

    const limpiarFiltros = () => {
        setSearch('');
        setSearchSecondary('');
        setFechaDesde('');
        setFechaHasta('');
        setRepartidorFiltro('');
        setEstadoFiltro('');
        setTipoEntregaFiltro('');
        setPaginaActual(1);
    };

    const exportarExcel = () => {
        const datosExcel: any[][] = [];

        datosExcel.push([
            '#', 'Dirección', 'Barrio', 'Teléfono', 'Nombre Cliente',
            'Observación Cliente', 'Observación Pedido', '10kg', '15kg', '45kg',
            'Precio', 'Estado', 'Tipo Pedido', 'Repartidor', 'Tipo Entrega', 'Fecha Programada'
        ]);

        pedidos.forEach((pedido, index) => {
            datosExcel.push([
                index + 1 + (paginaActual - 1) * registrosPorPagina,
                pedido.direccion,
                pedido.barrio,
                pedido.telefono,
                pedido.cliente_nombre,
                pedido.cliente_observacion,
                pedido.observacion_pedido,
                pedido.garrafa_10kg || 0,
                pedido.garrafa_15kg || 0,
                pedido.garrafa_45kg || 0,
                pedido.precio || 0,
                pedido.estado,
                pedido.tipo_pedido,
                pedido.repartidor_nombre ? `${pedido.repartidor_nombre} ${pedido.repartidor_apellido}` : 'Sin asignar',
                pedido.es_programado ? 'Programado' : 'Inmediato',
                pedido.es_programado ? formatearFecha(pedido.fecha_entrega_programada) : ''
            ]);
        });

        datosExcel.push([
            'TOTALES', '', '', '', '', '', '',
            totalGarrafas10kg, totalGarrafas15kg, totalGarrafas45kg, totalPrecio, '', '', '', '', ''
        ]);

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        ws['!cols'] = [
            { wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 15 },
            { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 8 },
            { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 12 },
            { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 12 }
        ];
        XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');

        const fecha = new Date();
        const fechaStr = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')}`;
        XLSX.writeFile(wb, `pedidos_${fechaStr}.xlsx`);

        setMensaje('✅ Excel exportado correctamente');
        setTimeout(() => setMensaje(''), 3000);
    };

    const imprimirTabla = () => {
        const ventanaImpresion = window.open('', '_blank');
        if (!ventanaImpresion) return;

        let total10kg = 0, total15kg = 0, total45kg = 0, totalPrecioImpresion = 0;

        let tablaHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Imprimir Pedidos</title>
            <meta charset="UTF-8">
            <style>
                * { 
                    font-family: Arial, sans-serif; 
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body { 
                    margin: 20px; 
                    padding: 0; 
                }
                h1 { 
                    text-align: center; 
                    margin-bottom: 20px; 
                    color: #4b0082; 
                    font-size: 18px;
                }
                table { 
                    border-collapse: collapse; 
                    width: 100%; 
                    margin-bottom: 20px; 
                    font-size: 11px; 
                }
                th, td { 
                    border: 1px solid #000; 
                    padding: 5px; 
                    text-align: left; 
                    vertical-align: top; 
                }
                th { 
                    background-color: #f2f2f2; 
                    font-weight: bold; 
                    text-align: center; 
                }
                .text-center { 
                    text-align: center !important; 
                }
                .text-right { 
                    text-align: right !important; 
                }
                .text-left { 
                    text-align: left !important; 
                }
                .totales { 
                    font-weight: bold; 
                    background-color: #f0f0f0; 
                }
                .precio-columna {
                    text-align: right !important;
                }
                @media print {
                    body { 
                        margin: 0; 
                        padding: 10px; 
                    }
                    th, td { 
                        padding: 4px; 
                    }
                }
            </style>
        </head>
        <body>
            <h1>Planilla de Pedidos</h1>
            <table>
                <thead>
                    <tr>
                        <th class="text-center">#</th>
                        <th class="text-left">Dirección</th>
                        <th class="text-left">Barrio</th>
                        <th class="text-left">Teléfono</th>
                        <th class="text-left">Nombre Cliente</th>
                        <th class="text-left">Observación Cliente</th>
                        <th class="text-left">Observación Pedido</th>
                        <th class="text-center">10kg</th>
                        <th class="text-center">15kg</th>
                        <th class="text-center">45kg</th>
                        <th class="text-right">Precio</th>
                        <th class="text-center">E/T</th>
                        <th class="text-center">✓</th>
                    </tr>
                </thead>
                <tbody>
    `;

        pedidos.forEach((pedido, idx) => {
            const num = idx + 1 + (paginaActual - 1) * registrosPorPagina;
            const kg10 = pedido.garrafa_10kg || 0;
            const kg15 = pedido.garrafa_15kg || 0;
            const kg45 = pedido.garrafa_45kg || 0;
            const precioNum = Number(pedido.precio) || 0;
            const tipoEntrega = pedido.es_programado ? 'P' : 'I';

            total10kg += kg10;
            total15kg += kg15;
            total45kg += kg45;
            totalPrecioImpresion += precioNum;

            tablaHtml += `
            <tr>
                <td class="text-center">${num}</td>
                <td class="text-left">${pedido.direccion || ''}</td>
                <td class="text-left">${pedido.barrio || ''}</td>
                <td class="text-left">${pedido.telefono || ''}</td>
                <td class="text-left">${pedido.cliente_nombre || ''}</td>
                <td class="text-left">${pedido.cliente_observacion || ''}</td>
                <td class="text-left">${pedido.observacion_pedido || ''}</td>
                <td class="text-center">${kg10 > 0 ? kg10 : ''}</td>
                <td class="text-center">${kg15 > 0 ? kg15 : ''}</td>
                <td class="text-center">${kg45 > 0 ? kg45 : ''}</td>
                <td class="text-right">${precioNum > 0 ? '$' + precioNum.toFixed(2) : ''}</td>
                <td class="text-center">${tipoEntrega}</td>
                <td class="text-center"></td>
            </tr>
        `;
        });

        // Renglones vacíos para llegar a 35
        for (let i = pedidos.length + 1; i <= TOTAL_RENGLONES_IMPRESION; i++) {
            const num = i + (paginaActual - 1) * registrosPorPagina;
            tablaHtml += `
            <tr>
                <td class="text-center">${num}</td>
                <td class="text-left"></td>
                <td class="text-left"></td>
                <td class="text-left"></td>
                <td class="text-left"></td>
                <td class="text-left"></td>
                <td class="text-left"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-right"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>
            </tr>
        `;
        }

        tablaHtml += `
                </tbody>
                <tfoot>
                    <tr class="totales">
                        <td colspan="7" class="text-right"><strong>TOTALES:</strong></td>
                        <td class="text-center"><strong>${total10kg > 0 ? total10kg : ''}</strong></td>
                        <td class="text-center"><strong>${total15kg > 0 ? total15kg : ''}</strong></td>
                        <td class="text-center"><strong>${total45kg > 0 ? total45kg : ''}</strong></td>
                        <td class="text-right"><strong>${totalPrecioImpresion > 0 ? '$' + totalPrecioImpresion.toFixed(2) : ''}</strong></td>
                        <td colspan="2"></td>
                    </tr>
                </tfoot>
            </table>
            <p style="text-align: center; font-size: 10px; margin-top: 20px;">
                Fecha de impresión: ${new Date().toLocaleString()}
            </p>
        </body>
        </html>
    `;

        ventanaImpresion.document.write(tablaHtml);
        ventanaImpresion.document.close();
        ventanaImpresion.print();
    };
    const cambiarPagina = (pagina: number) => {
        if (pagina >= 1 && pagina <= totalPaginas) {
            setPaginaActual(pagina);
        }
    };

    const renderPaginacion = () => {
        const paginas = [];
        let inicio = Math.max(1, paginaActual - 2);
        let fin = Math.min(totalPaginas, paginaActual + 2);

        for (let i = inicio; i <= fin; i++) {
            paginas.push(
                <button
                    key={i}
                    onClick={() => cambiarPagina(i)}
                    className={i === paginaActual ? 'current' : ''}
                >
                    {i}
                </button>
            );
        }

        return paginas;
    };

    const pedidosModificados = obtenerPedidosModificados();

    return (
        <div className="editar-pedidos-container">
            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                onConfirm={modal.onConfirm}
                onCancel={modal.onCancel}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                confirmText="Enviar WhatsApp"
                cancelText="Cancelar"
                showConfirm={!!modal.onConfirm}
            />

            {showWhatsappList && mensajesWhatsapp.length > 0 && (
                <div className="whatsapp-modal-overlay">
                    <div className="whatsapp-modal-content">
                        <h3>📱 Mensajes de WhatsApp generados</h3>
                        <p>Se generaron {mensajesWhatsapp.length} mensaje(s) para enviar:</p>
                        <div className="whatsapp-list">
                            {mensajesWhatsapp.map((url, idx) => (
                                <button
                                    key={idx}
                                    className="whatsapp-btn"
                                    onClick={() => window.open(url, '_blank')}
                                >
                                    📱 Enviar WhatsApp - Pedido {idx + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            className="close-whatsapp-btn"
                            onClick={() => setShowWhatsappList(false)}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            <h1>📋 Editar Planilla de Pedidos</h1>

            {mensaje && <div className="mensaje-exito">{mensaje}</div>}
            {error && <div className="mensaje-error">{error}</div>}

            <div className="filters-container">
                <div className="filter-row">
                    <div className="filter-group">
                        <label>🔍 Búsqueda General</label>
                        <input
                            type="text"
                            placeholder="Buscar en todos los campos"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>🔎 Búsqueda Secundaria</label>
                        <input
                            type="text"
                            placeholder="Búsqueda adicional"
                            value={searchSecondary}
                            onChange={(e) => setSearchSecondary(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-row">
                    <div className="filter-group">
                        <label>👤 Filtrar por Repartidor</label>
                        <select
                            value={repartidorFiltro}
                            onChange={(e) => setRepartidorFiltro(e.target.value)}
                        >
                            <option value="">Todos los repartidores</option>
                            <option value="null">Sin asignar</option>
                            {repartidores.map(r => (
                                <option key={r.id} value={r.id}>{r.nombre} {r.apellido}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>📊 Filtrar por Estado</label>
                        <select
                            value={estadoFiltro}
                            onChange={(e) => setEstadoFiltro(e.target.value)}
                        >
                            <option value="">Todos los estados</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Cancelado">Cancelado</option>
                            <option value="Finalizado">Finalizado</option>
                            <option value="Cuenta">Cuenta</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>📅 Tipo de Entrega</label>
                        <select
                            value={tipoEntregaFiltro}
                            onChange={(e) => setTipoEntregaFiltro(e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="programado">📅 Solo Programados</option>
                            <option value="inmediato">⚡ Solo Inmediatos</option>
                        </select>
                    </div>
                </div>

                <div className="filter-row">
                    <div className="filter-group">
                        <label>📅 Desde:</label>
                        <input
                            type="date"
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>📅 Hasta:</label>
                        <input
                            type="date"
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-row">
                    <div className="search-button">
                        <button onClick={cargarPedidos} disabled={loading}>
                            {loading ? '🔄 Cargando...' : '🔍 Filtrar'}
                        </button>
                        <button onClick={limpiarFiltros}>🧹 Limpiar Filtros</button>
                    </div>
                </div>
            </div>

            <div className="pagination-info">
                📄 Mostrando {pedidos.length} de {totalRegistros} registros - Página {paginaActual} de {totalPaginas}
                {pedidosModificados.length > 0 && (
                    <span style={{ color: '#ff9800', marginLeft: '10px', fontWeight: 'bold' }}>
                        ⚠️ ({pedidosModificados.length} pedido(s) modificado(s) sin guardar)
                    </span>
                )}
            </div>

            <form onSubmit={handleGuardarCambios}>
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
                        {loading ? (
                            <tr><td colSpan={16} className="text-center">🔄 Cargando pedidos...</td></tr>
                        ) : pedidos.length === 0 ? (
                            <tr><td colSpan={16} className="text-center">📭 No se encontraron pedidos</td></tr>
                        ) : (
                            pedidos.map((pedido, index) => (
                                <tr key={pedido.id} className={haCambiado(pedidosOriginales[index], pedido) ? 'modificado' : ''}>
                                    <td>{index + 1 + (paginaActual - 1) * registrosPorPagina}</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={pedido.tipo_pedido}
                                            onChange={(e) => handlePedidoChange(index, 'tipo_pedido', e.target.value, false)}
                                            onBlur={(e) => handlePedidoChange(index, 'tipo_pedido', e.target.value, true)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={pedido.garrafa_10kg || 0}
                                            onChange={(e) => handlePedidoChange(index, 'garrafa_10kg', parseInt(e.target.value) || 0, false)}
                                            min="0"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={pedido.garrafa_15kg || 0}
                                            onChange={(e) => handlePedidoChange(index, 'garrafa_15kg', parseInt(e.target.value) || 0, false)}
                                            min="0"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={pedido.garrafa_45kg || 0}
                                            onChange={(e) => handlePedidoChange(index, 'garrafa_45kg', parseInt(e.target.value) || 0, false)}
                                            min="0"
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
                                            onChange={(e) => handlePedidoChange(index, 'estado', e.target.value, false)}
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
                                            type="number"
                                            step="0.01"
                                            value={pedido.precio}
                                            onChange={(e) => handlePedidoChange(index, 'precio', parseFloat(e.target.value) || 0, false)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={pedido.observacion_pedido}
                                            onChange={(e) => handlePedidoChange(index, 'observacion_pedido', e.target.value, false)}
                                            onBlur={(e) => handlePedidoChange(index, 'observacion_pedido', e.target.value, true)}
                                        />
                                    </td>
                                    <td>{pedido.fecha_creacion}</td>
                                    <td>
                                        <div className="fecha-programada-cell">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={pedido.es_programado === 1}
                                                    onChange={(e) => handleProgramadoToggle(index, e.target.checked)}
                                                />
                                                <span>📅 Programar</span>
                                            </label>
                                            {pedido.es_programado === 1 && (
                                                <input
                                                    type="date"
                                                    value={pedido.fecha_entrega_programada || ''}
                                                    onChange={(e) => handleFechaProgramadaChange(index, e.target.value)}
                                                    className="fecha-input"
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            )}
                                            {!pedido.es_programado && (
                                                <span className="fecha-inmediato-badge">⚡ Inmediato</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <select
                                            value={pedido.repartidor_id || ''}
                                            onChange={(e) => handlePedidoChange(index, 'repartidor_id', e.target.value ? parseInt(e.target.value) : null, false)}
                                        >
                                            <option value="">Sin asignar</option>
                                            {repartidores.map(r => (
                                                <option key={r.id} value={r.id}>{r.nombre} {r.apellido}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={11} className="text-right"><strong>💰 Total Precio:</strong></td>
                            <td colSpan={5}><strong>${totalPrecio.toFixed(2)}</strong></td>
                        </tr>
                        <tr style={{ backgroundColor: '#e8f4f8' }}>
                            <td colSpan={2} className="text-right"><strong>📦 Totales Garrafas:</strong></td>
                            <td><strong>{totalGarrafas10kg}</strong> <small>(10kg)</small></td>
                            <td><strong>{totalGarrafas15kg}</strong> <small>(15kg)</small></td>
                            <td><strong>{totalGarrafas45kg}</strong> <small>(45kg)</small></td>
                            <td colSpan={11}></td>
                        </tr>
                    </tfoot>
                </table>

                <div className="botones">
                    <button type="submit" disabled={saving || loading || pedidosModificados.length === 0}>
                        {saving ? '💾 Guardando...' : `💾 Guardar Cambios (${pedidosModificados.length})`}
                    </button>
                    <button type="button" onClick={imprimirTabla}>🖨️ Imprimir Tabla</button>
                    <button type="button" onClick={exportarExcel}>📊 Exportar a Excel</button>
                </div>
            </form>

            {totalPaginas > 1 && (
                <div className="pagination">
                    <button onClick={() => cambiarPagina(1)} disabled={paginaActual === 1}>
                        ⏮️ Primera
                    </button>
                    <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>
                        ◀️ Anterior
                    </button>
                    {renderPaginacion()}
                    <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>
                        Siguiente ▶️
                    </button>
                    <button onClick={() => cambiarPagina(totalPaginas)} disabled={paginaActual === totalPaginas}>
                        Última ⏭️
                    </button>
                </div>
            )}

            <ul className="menu">
                <li><a href="/gestor_clientes_pedidos_react/pedidos">🔙 Volver</a></li>
            </ul>
        </div>
    );
};

export default EditarTablaPedidos;