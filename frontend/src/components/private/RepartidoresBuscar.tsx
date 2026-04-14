import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buscarRepartidores, buscarRepartidoresPorTermino, eliminarRepartidorApi } from '../../services/api';
import '../../css/styles.css';

const RepartidoresBuscar: React.FC = () => {
    const [q, setQ] = useState('');
    const [applied, setApplied] = useState('');
    const [rows, setRows] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                let data;
                if (applied) {
                    // Si hay búsqueda, usar la función con parámetro
                    data = await buscarRepartidoresPorTermino(applied);
                } else {
                    // Si no hay búsqueda, usar la función sin parámetros
                    data = await buscarRepartidores();
                }
                setRows(data);
            } catch (e) {
                setError('❌ No se pudieron cargar los repartidores.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [applied]);

    const handleBuscar = () => {
        setApplied(q.trim());
    };

    const handleLimpiar = () => {
        setQ('');
        setApplied('');
    };

    const handleEliminar = async (id: number, nombre: string) => {
        if (window.confirm(`¿Estás seguro de eliminar al repartidor ${nombre}?`)) {
            try {
                await eliminarRepartidorApi(id);
                setMensaje(`✅ Repartidor ${nombre} eliminado correctamente`);
                // Recargar la lista
                const data = await buscarRepartidores();
                setRows(data);
                setTimeout(() => setMensaje(null), 3000);
            } catch (e) {
                setError('❌ Error al eliminar el repartidor');
                console.error(e);
                setTimeout(() => setError(null), 3000);
            }
        }
    };

    return (
        <div className="container">
            <img src="/logoprincipal.png" alt="Logo Principal" className="logo" />
            <h1>🔍 Buscar Repartidores</h1>

            <nav>
                <ul className="menu">
                    <li><Link to="/repartidores">← Volver a Repartidores</Link></li>
                    <li><Link to="/dashboard">📊 Dashboard</Link></li>
                </ul>
            </nav>

            <div className="buscador-clientes">
                <input
                    type="search"
                    placeholder="Buscar por nombre, apellido o teléfono..."
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

            {loading && <div className="loading">🔄 Cargando repartidores...</div>}

            {!loading && !error && (
                <>
                    <div className="tabla-info">
                        📄 Mostrando {rows.length} repartidor(es)
                    </div>

                    <div className="tabla-container">
                        <table className="tabla-clientes">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Teléfono</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center">
                                            📭 No se encontraron repartidores
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((r) => (
                                        <tr key={r.id}>
                                            <td>{r.id}</td>
                                            <td>{r.nombre || '—'}</td>
                                            <td>{r.apellido || '—'}</td>
                                            <td>{r.telefono || '—'}</td>
                                            <td className="acciones">
                                                <button
                                                    className="btn-editar"
                                                    onClick={() => window.location.href = `/repartidores/editar/${r.id}`}
                                                    title="Editar repartidor"
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    className="btn-eliminar"
                                                    onClick={() => handleEliminar(r.id, r.nombre)}
                                                    title="Eliminar repartidor"
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default RepartidoresBuscar;