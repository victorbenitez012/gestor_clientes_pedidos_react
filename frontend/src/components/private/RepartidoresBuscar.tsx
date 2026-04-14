import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buscarRepartidores } from '../../services/api';
import { RepartidorRow } from '../../types/types';
import '../../css/styles.css';

const RepartidoresBuscar: React.FC = () => {
    const [q, setQ] = useState('');
    const [applied, setApplied] = useState('');
    const [rows, setRows] = useState<RepartidorRow[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await buscarRepartidores(applied || undefined);
                setRows(data);
            } catch (e) {
                setError('No se pudieron cargar los repartidores.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [applied]);

    return (
        <div className="container">
            <h1>Buscar repartidores</h1>
            <ul className="menu" style={{ marginBottom: '1rem' }}>
                <li>
                    <Link to="/repartidores">Volver</Link>
                </li>
                <li>
                    <Link to="/dashboard">Inicio</Link>
                </li>
            </ul>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
                <input
                    type="search"
                    placeholder="Nombre, apellido, tel�fono�"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    style={{ minWidth: 240 }}
                />
                <button type="button" onClick={() => setApplied(q.trim())}>
                    Buscar
                </button>
                <button type="button" onClick={() => { setQ(''); setApplied(''); }}>
                    Ver todos
                </button>
            </div>
            {loading && <p>Cargando�</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>ID</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Nombre</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Apellido</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Direcci�n</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Tel�fono</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Obs.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.id}>
                                <td style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>{r.id}</td>
                                <td style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>{r.nombre}</td>
                                <td style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>{r.apellido}</td>
                                <td style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>{r.direccion}</td>
                                <td style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>{r.telefono}</td>
                                <td style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>{r.observacion || '�'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default RepartidoresBuscar;
