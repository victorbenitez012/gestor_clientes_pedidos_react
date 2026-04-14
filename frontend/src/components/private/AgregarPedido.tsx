import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    agregarPedidoCompleto,
    buscarClientesParaAgregarPedido,
    buscarClientesPorDireccionAgregar,
    buscarRepartidores,
    obtenerUltimosPedidosClienteAgregar,
} from '../../services/api';
import { ClienteRow, RepartidorRow } from '../../types/types';
import styles from './AgregarPedido.module.css';

type PedidoResumen = {
    id: number;
    tipo_pedido: string;
    observacion_pedido: string | null;
    estado: string;
    precio: string | number;
    fecha_creacion: string;
    direccion?: string;
    barrio?: string;
    telefono?: string;
    cliente_nombre?: string;
    observacion_cliente?: string | null;
    repartidor_nombre?: string | null;
    repartidor_apellido?: string | null;
};

const initialForm = {
    buscar_total: '',
    nombre_cliente: '',
    direccion_cliente: '',
    barrio_cliente: '',
    telefono_cliente: '',
    observacion_cliente: '',
    observacion_pedido: '',
    estado: 'Pendiente',
    precio: '',
    repartidor_id: '',
    garrafa_10kg: 0,
    garrafa_15kg: 0,
    garrafa_45kg: 0,
};

const AgregarPedido = () => {
    const [form, setForm] = useState(initialForm);
    const [sugTotal, setSugTotal] = useState<ClienteRow[]>([]);
    const [sugDir, setSugDir] = useState<ClienteRow[]>([]);
    const [repartidores, setRepartidores] = useState<RepartidorRow[]>([]);
    const [ultimos, setUltimos] = useState<PedidoResumen[]>([]);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        buscarRepartidores()
            .then(setRepartidores)
            .catch((e) => {
                console.error(e);
                setError('No se pudieron cargar los repartidores.');
            });
    }, []);

    const cargarUltimos = useCallback(async (clienteId: number) => {
        try {
            const rows = await obtenerUltimosPedidosClienteAgregar(clienteId);
            setUltimos(rows);
        } catch (e) {
            console.error(e);
            setUltimos([]);
        }
    }, []);

    useEffect(() => {
        const q = form.buscar_total.trim();
        if (q.length <= 2) {
            setSugTotal([]);
            return;
        }
        const t = window.setTimeout(() => {
            buscarClientesParaAgregarPedido(q)
                .then(setSugTotal)
                .catch(() => setSugTotal([]));
        }, 350);
        return () => window.clearTimeout(t);
    }, [form.buscar_total]);

    useEffect(() => {
        const d = form.direccion_cliente.trim();
        if (d.length <= 2) {
            setSugDir([]);
            return;
        }
        const t = window.setTimeout(() => {
            buscarClientesPorDireccionAgregar(d)
                .then(setSugDir)
                .catch(() => setSugDir([]));
        }, 350);
        return () => window.clearTimeout(t);
    }, [form.direccion_cliente]);

    const setField = (name: keyof typeof initialForm, value: string | number) => {
        setForm((f) => ({ ...f, [name]: value }));
    };

    const seleccionarCliente = (c: ClienteRow) => {
        setForm((f) => ({
            ...f,
            direccion_cliente: c.direccion || '',
            nombre_cliente: c.nombre || '',
            barrio_cliente: c.barrio || '',
            telefono_cliente: c.telefono || '',
            observacion_cliente: c.observacion || '',
            buscar_total: '',
        }));
        setSugTotal([]);
        setSugDir([]);
        void cargarUltimos(c.id);
    };

    const cambiarGarrafa = (campo: 'garrafa_10kg' | 'garrafa_15kg' | 'garrafa_45kg', delta: number) => {
        setForm((f) => {
            const v = Math.max(0, (f[campo] as number) + delta);
            return { ...f, [campo]: v };
        });
    };

    const limpiar = () => {
        setForm(initialForm);
        setSugTotal([]);
        setSugDir([]);
        setUltimos([]);
        setMensaje(null);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMensaje(null);

        const precioNum = parseFloat(String(form.precio).replace(',', '.'));
        if (Number.isNaN(precioNum) || precioNum < 0) {
            setError('Precio invalido.');
            return;
        }

        try {
            const res = await agregarPedidoCompleto({
                nombre_cliente: form.nombre_cliente,
                direccion_cliente: form.direccion_cliente.trim(),
                barrio_cliente: form.barrio_cliente,
                telefono_cliente: form.telefono_cliente.trim(),
                observacion_cliente: form.observacion_cliente,
                observacion_pedido: form.observacion_pedido,
                estado: form.estado,
                precio: precioNum,
                repartidor_id: form.repartidor_id ? parseInt(form.repartidor_id, 10) : null,
                garrafa_10kg: form.garrafa_10kg,
                garrafa_15kg: form.garrafa_15kg,
                garrafa_45kg: form.garrafa_45kg,
            });
            setMensaje(res.message + (res.tipo_pedido ? ` (${res.tipo_pedido})` : ''));

            if (res.whatsapp_url && window.confirm('¿Enviar los detalles del pedido al repartidor por WhatsApp?')) {
                window.open(res.whatsapp_url, '_blank', 'noopener,noreferrer');
            }

            setForm((f) => ({
                ...initialForm,
                direccion_cliente: f.direccion_cliente,
                nombre_cliente: f.nombre_cliente,
                barrio_cliente: f.barrio_cliente,
                telefono_cliente: f.telefono_cliente,
                observacion_cliente: f.observacion_cliente,
            }));
            if (res.cliente_id) {
                void cargarUltimos(res.cliente_id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar');
        }
    };

    return (
        <div className={styles.container}>
            <p className={styles.navTop}>
                <Link to="/pedidos">Volver a pedidos</Link>
                {' · '}
                <Link to="/dashboard">Inicio</Link>
            </p>
            <h1 className={styles.title}>Agregar pedido</h1>
            {mensaje && <p className={`${styles.message} ${styles.success}`}>{mensaje}</p>}
            {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}

            <form className={styles.form} onSubmit={handleSubmit}>
                <fieldset className={styles.fieldset}>
                    <legend className={styles.legend}>Datos del cliente</legend>

                    <label htmlFor="buscar_total">Buscar cliente (nombre, direccion, telefono…)</label>
                    <div className={styles.wrapSuggest}>
                        <input
                            id="buscar_total"
                            type="text"
                            value={form.buscar_total}
                            onChange={(e) => setField('buscar_total', e.target.value)}
                            autoComplete="off"
                        />
                        {sugTotal.length > 0 && (
                            <div className={styles.suggestions}>
                                {sugTotal.map((c) => (
                                    <div
                                        key={c.id}
                                        className={styles.suggestion}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => seleccionarCliente(c)}
                                        onKeyDown={(ev) => {
                                            if (ev.key === 'Enter') {
                                                seleccionarCliente(c);
                                            }
                                        }}
                                    >
                                        {(c.nombre || '—') + ' — ' + c.direccion + ' (' + c.telefono + ')'}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <label htmlFor="nombre_cliente">Nombre del cliente</label>
                    <input
                        id="nombre_cliente"
                        value={form.nombre_cliente}
                        onChange={(e) => setField('nombre_cliente', e.target.value)}
                    />

                    <label htmlFor="direccion_cliente">Direccion *</label>
                    <div className={styles.wrapSuggest}>
                        <input
                            id="direccion_cliente"
                            required
                            value={form.direccion_cliente}
                            onChange={(e) => setField('direccion_cliente', e.target.value)}
                            autoComplete="off"
                        />
                        {sugDir.length > 0 && (
                            <div className={styles.suggestions}>
                                {sugDir.map((c) => (
                                    <div
                                        key={c.id}
                                        className={styles.suggestion}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => seleccionarCliente(c)}
                                        onKeyDown={(ev) => {
                                            if (ev.key === 'Enter') {
                                                seleccionarCliente(c);
                                            }
                                        }}
                                    >
                                        {c.direccion} {c.barrio ? `(${c.barrio})` : ''} — {c.nombre || '—'}{' '}
                                        ({c.telefono})
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <label htmlFor="barrio_cliente">Barrio</label>
                    <input
                        id="barrio_cliente"
                        value={form.barrio_cliente}
                        onChange={(e) => setField('barrio_cliente', e.target.value)}
                    />

                    <label htmlFor="telefono_cliente">Telefono *</label>
                    <input
                        id="telefono_cliente"
                        required
                        value={form.telefono_cliente}
                        onChange={(e) => setField('telefono_cliente', e.target.value)}
                    />

                    <label htmlFor="observacion_cliente">Observaciones del cliente</label>
                    <textarea
                        id="observacion_cliente"
                        rows={3}
                        value={form.observacion_cliente}
                        onChange={(e) => setField('observacion_cliente', e.target.value)}
                    />
                </fieldset>

                <fieldset className={styles.fieldset}>
                    <legend className={styles.legend}>Datos del pedido (garrafas)</legend>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                        Indique al menos una cantidad mayor a 0. El tipo de pedido se arma automaticamente.
                    </p>
                    <div className={styles.garrafas}>
                        {(['garrafa_10kg', 'garrafa_15kg', 'garrafa_45kg'] as const).map((id, idx) => {
                            const labels = ['10 kg', '15 kg', '45 kg'];
                            return (
                                <div key={id} className={styles.garrafaItem}>
                                    <span>{labels[idx]}</span>
                                    <div className={styles.counter}>
                                        <button type="button" onClick={() => cambiarGarrafa(id, -1)}>
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            min={0}
                                            value={form[id]}
                                            onChange={(e) =>
                                                setField(id, Math.max(0, parseInt(e.target.value, 10) || 0))
                                            }
                                        />
                                        <button type="button" onClick={() => cambiarGarrafa(id, 1)}>
                                            +
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <label htmlFor="observacion_pedido">Observaciones del pedido</label>
                    <textarea
                        id="observacion_pedido"
                        rows={2}
                        value={form.observacion_pedido}
                        onChange={(e) => setField('observacion_pedido', e.target.value)}
                    />

                    <label htmlFor="estado">Estado</label>
                    <select
                        id="estado"
                        value={form.estado}
                        onChange={(e) => setField('estado', e.target.value)}
                        required
                    >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                        <option value="Finalizado">Finalizado</option>
                        <option value="Cuenta">Cuenta</option>
                    </select>

                    <label htmlFor="precio">Precio *</label>
                    <input
                        id="precio"
                        type="number"
                        step="0.01"
                        min={0}
                        required
                        value={form.precio}
                        onChange={(e) => setField('precio', e.target.value)}
                    />

                    <label htmlFor="repartidor_id">Repartidor</label>
                    <select
                        id="repartidor_id"
                        value={form.repartidor_id}
                        onChange={(e) => setField('repartidor_id', e.target.value)}
                    >
                        <option value="">(Sin asignar)</option>
                        {repartidores.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.nombre} {r.apellido}
                            </option>
                        ))}
                    </select>
                </fieldset>

                <div className={styles.actions}>
                    <button type="submit" className={styles.submitButton}>
                        Guardar pedido
                    </button>
                    <button type="button" className={styles.secondaryButton} onClick={limpiar}>
                        Limpiar
                    </button>
                </div>
            </form>

            <div className={styles.tableWrap}>
                <h2 style={{ textAlign: 'center', color: '#4b3d69' }}>Ultimos 10 pedidos del cliente</h2>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tipo</th>
                            <th>Dir.</th>
                            <th>Barrio</th>
                            <th>Tel.</th>
                            <th>Cliente</th>
                            <th>Obs. cliente</th>
                            <th>Estado</th>
                            <th>Precio</th>
                            <th>Obs. pedido</th>
                            <th>Fecha</th>
                            <th>Repartidor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ultimos.length === 0 ? (
                            <tr>
                                <td colSpan={12} style={{ textAlign: 'center' }}>
                                    Elija un cliente en la busqueda para ver sus pedidos recientes.
                                </td>
                            </tr>
                        ) : (
                            ultimos.map((p, i) => (
                                <tr key={p.id}>
                                    <td>{i + 1}</td>
                                    <td>{p.tipo_pedido}</td>
                                    <td>{p.direccion ?? '—'}</td>
                                    <td>{p.barrio ?? '—'}</td>
                                    <td>{p.telefono ?? '—'}</td>
                                    <td>{p.cliente_nombre ?? '—'}</td>
                                    <td>{p.observacion_cliente ?? '—'}</td>
                                    <td>{p.estado}</td>
                                    <td>{Number(p.precio).toFixed(2)}</td>
                                    <td>{p.observacion_pedido ?? '—'}</td>
                                    <td>{p.fecha_creacion}</td>
                                    <td>
                                        {p.repartidor_nombre
                                            ? `${p.repartidor_nombre} ${p.repartidor_apellido || ''}`
                                            : 'Sin asignar'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AgregarPedido;
