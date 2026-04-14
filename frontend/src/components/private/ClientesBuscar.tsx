import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buscarClientes, actualizarCliente } from '../../services/api';
import { ClienteRow } from '../../types/types';
import '../../css/styles.css';

const ClientesBuscar: React.FC = () => {
    const [q, setQ] = useState('');
    const [applied, setApplied] = useState('');
    const [rows, setRows] = useState<ClienteRow[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [editando, setEditando] = useState<ClienteRow | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);

    const registrosPorPagina = 50;

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await buscarClientes(applied || undefined, paginaActual, registrosPorPagina);
                setRows(data.clientes || []);
                setTotalRegistros(data.total_registros || 0);
                setTotalPaginas(data.total_paginas || 1);
            } catch (e) {
                setError('❌ No se pudieron cargar los clientes.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [applied, paginaActual]);

    const handleBuscar = () => {
        setApplied(q.trim());
        setPaginaActual(1);
    };

    const handleLimpiar = () => {
        setQ('');
        setApplied('');
        setPaginaActual(1);
    };

    const handleEditar = (cliente: ClienteRow) => {
        setEditando(cliente);
    };

    const handleGuardarEdicion = async () => {
        if (!editando) return;

        setLoading(true);
        try {
            await actualizarCliente(editando.id, editando);
            setMensaje('✅ Cliente actualizado correctamente');
            setTimeout(() => setMensaje(null), 3000);

            // Recargar la página actual
            const data = await buscarClientes(applied || undefined, paginaActual, registrosPorPagina);
            setRows(data.clientes || []);
            setTotalRegistros(data.total_registros || 0);
            setTotalPaginas(data.total_paginas || 1);
            setEditando(null);
        } catch (e) {
            setError('❌ Error al actualizar el cliente');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCambioEdicion = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (editando) {
            setEditando({ ...editando, [e.target.name]: e.target.value });
        }
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

    // Capitalizar palabras
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

    return (
        <div className="container">
            {/* Modal de edición */}
            {editando && (
                <div className="modal-overlay" onClick={() => setEditando(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>✏️ Editar Cliente</h2>
                            <button className="modal-close" onClick={() => setEditando(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={editando.nombre || ''}
                                    onChange={handleCambioEdicion}
                                    onBlur={(e) => {
                                        const valor = capitalizarPalabras(e.target.value);
                                        setEditando({ ...editando, nombre: valor });
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Dirección</label>
                                <input
                                    type="text"
                                    name="direccion"
                                    value={editando.direccion || ''}
                                    onChange={handleCambioEdicion}
                                    onBlur={(e) => {
                                        const valor = capitalizarPalabras(e.target.value);
                                        setEditando({ ...editando, direccion: valor });
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Barrio</label>
                                <input
                                    type="text"
                                    name="barrio"
                                    value={editando.barrio || ''}
                                    onChange={handleCambioEdicion}
                                    onBlur={(e) => {
                                        const valor = capitalizarPalabras(e.target.value);
                                        setEditando({ ...editando, barrio: valor });
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={editando.telefono || ''}
                                    onChange={handleCambioEdicion}
                                />
                            </div>
                            <div className="form-group">
                                <label>Observación</label>
                                <textarea
                                    name="observacion"
                                    value={editando.observacion || ''}
                                    onChange={handleCambioEdicion}
                                    rows={3}
                                    onBlur={(e) => {
                                        const valor = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1).toLowerCase();
                                        setEditando({ ...editando, observacion: valor });
                                    }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancelar" onClick={() => setEditando(null)}>
                                Cancelar
                            </button>
                            <button className="btn-guardar" onClick={handleGuardarEdicion}>
                                💾 Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <img src="/logoprincipal.png" alt="Logo Principal" className="logo" />
            <h1>🔍 Buscar Clientes</h1>

            <nav>
                <ul className="menu">
                    <li><Link to="/clientes">← Volver a Clientes</Link></li>
                    <li><Link to="/dashboard">📊 Dashboard</Link></li>
                </ul>
            </nav>

            <div className="buscador-clientes">
                <input
                    type="search"
                    placeholder="Buscar por nombre, teléfono, dirección..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                />
                <button className="btn-buscar" onClick={handleBuscar}>
                    🔍 Buscar
                </button>
                <button className="btn-limpiar" onClick={handleLimpiar}>
                    🧹 Limpiar
                </button>
            </div>

            {mensaje && <div className="mensaje-exito">{mensaje}</div>}
            {error && <div className="mensaje-error">{error}</div>}

            {loading && <div className="loading">🔄 Cargando clientes...</div>}

            {!loading && !error && (
                <>
                    <div className="tabla-info">
                        📄 Mostrando {rows.length} de {totalRegistros} clientes - Página {paginaActual} de {totalPaginas}
                    </div>

                    <div className="tabla-container">
                        <table className="tabla-clientes">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Dirección</th>
                                    <th>Barrio</th>
                                    <th>Teléfono</th>
                                    <th>Observación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center">
                                            📭 No se encontraron clientes
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((c) => (
                                        <tr key={c.id}>
                                            <td>{c.id}</td>
                                            <td>{c.nombre || '—'}</td>
                                            <td>{c.direccion || '—'}</td>
                                            <td>{c.barrio || '—'}</td>
                                            <td>{c.telefono || '—'}</td>
                                            <td>{c.observacion || '—'}</td>
                                            <td className="acciones">
                                                <button
                                                    className="btn-editar"
                                                    onClick={() => handleEditar(c)}
                                                    title="Editar cliente"
                                                >
                                                    ✏️ Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {totalPaginas > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => cambiarPagina(1)}
                                disabled={paginaActual === 1}
                                className="btn-pagina"
                            >
                                ⏮️ Primera
                            </button>
                            <button
                                onClick={() => cambiarPagina(paginaActual - 1)}
                                disabled={paginaActual === 1}
                                className="btn-pagina"
                            >
                                ◀️ Anterior
                            </button>
                            {renderPaginacion()}
                            <button
                                onClick={() => cambiarPagina(paginaActual + 1)}
                                disabled={paginaActual === totalPaginas}
                                className="btn-pagina"
                            >
                                Siguiente ▶️
                            </button>
                            <button
                                onClick={() => cambiarPagina(totalPaginas)}
                                disabled={paginaActual === totalPaginas}
                                className="btn-pagina"
                            >
                                Última ⏭️
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ClientesBuscar;