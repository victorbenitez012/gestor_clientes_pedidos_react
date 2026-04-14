import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { agregarRepartidorApi } from '../../services/api';
import '../../css/styles.css';

const RepartidoresAgregar: React.FC = () => {
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        direccion: '',
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
            await agregarRepartidorApi(form);
            setMsg('Repartidor guardado correctamente.');
            setForm({ nombre: '', apellido: '', direccion: '', telefono: '', observacion: '' });
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Error al guardar');
        }
    };

    return (
        <div className="container">
            <h1>Agregar repartidor</h1>
            <ul className="menu" style={{ marginBottom: '1rem' }}>
                <li>
                    <Link to="/repartidores">Volver</Link>
                </li>
                <li>
                    <Link to="/dashboard">Inicio</Link>
                </li>
            </ul>
            {msg && <p style={{ color: 'green' }}>{msg}</p>}
            {err && <p style={{ color: 'red' }}>{err}</p>}
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
                <label>
                    Nombre *
                    <input name="nombre" value={form.nombre} onChange={onChange} required />
                </label>
                <label>
                    Apellido *
                    <input name="apellido" value={form.apellido} onChange={onChange} required />
                </label>
                <label>
                    Direcci�n *
                    <input name="direccion" value={form.direccion} onChange={onChange} required />
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

export default RepartidoresAgregar;
