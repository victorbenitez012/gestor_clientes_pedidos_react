import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { agregarClienteApi } from '../../services/api';
import '../../css/styles.css';

const ClientesAgregar: React.FC = () => {
    const [form, setForm] = useState({
        nombre: '',
        direccion: '',
        barrio: '',
        telefono: '',
        observacion: '',
    });
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setMsg(null);
        try {
            await agregarClienteApi(form);
            setMsg('Cliente guardado correctamente.');
            setForm({ nombre: '', direccion: '', barrio: '', telefono: '', observacion: '' });
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Error al guardar');
        }
    };

    return (
        <div className="container">
            <h1>Agregar cliente</h1>
            <ul className="menu" style={{ marginBottom: '1rem' }}>
                <li>
                    <Link to="/clientes">Volver a clientes</Link>
                </li>
                <li>
                    <Link to="/dashboard">Inicio</Link>
                </li>
            </ul>
            {msg && <p style={{ color: 'green' }}>{msg}</p>}
            {err && <p style={{ color: 'red' }}>{err}</p>}
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
                <label>
                    Nombre
                    <input name="nombre" value={form.nombre} onChange={onChange} />
                </label>
                <label>
                    Direcci�n *
                    <input name="direccion" value={form.direccion} onChange={onChange} required />
                </label>
                <label>
                    Barrio
                    <input name="barrio" value={form.barrio} onChange={onChange} />
                </label>
                <label>
                    Tel�fono *
                    <input name="telefono" value={form.telefono} onChange={onChange} required />
                </label>
                <label>
                    Observaci�n
                    <textarea name="observacion" value={form.observacion} onChange={onChange} rows={3} />
                </label>
                <button type="submit">Guardar</button>
            </form>
        </div>
    );
};

export default ClientesAgregar;
