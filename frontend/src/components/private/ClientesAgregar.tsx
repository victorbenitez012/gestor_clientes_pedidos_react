import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { agregarClienteApi } from '../../services/api';
import '../../css/styles.css';

const ClientesAgregar: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nombre: '',
        direccion: '',
        barrio: '',
        telefono: '',
        observacion: '',
    });
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
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

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setMsg(null);
        setLoading(true);

        try {
            // Formatear datos antes de enviar
            const datosFormateados = {
                nombre: capitalizarPalabras(form.nombre),
                direccion: capitalizarPalabras(form.direccion),
                barrio: capitalizarPalabras(form.barrio),
                telefono: form.telefono.replace(/[^0-9]/g, ''),
                observacion: form.observacion.charAt(0).toUpperCase() + form.observacion.slice(1).toLowerCase()
            };

            await agregarClienteApi(datosFormateados);
            setMsg('✅ Cliente guardado correctamente.');
            setForm({ nombre: '', direccion: '', barrio: '', telefono: '', observacion: '' });

            // Redirigir después de 2 segundos
            setTimeout(() => {
                navigate('/clientes');
            }, 2000);
        } catch (e) {
            setErr(e instanceof Error ? e.message : '❌ Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>➕ Agregar Cliente</h1>
            <ul className="menu" style={{ marginBottom: '1rem' }}>
                <li>
                    <Link to="/clientes">🔙 Volver a clientes</Link>
                </li>
                <li>
                    <Link to="/dashboard">📊 Inicio</Link>
                </li>
            </ul>

            {msg && <div className="mensaje-exito">{msg}</div>}
            {err && <div className="mensaje-error">{err}</div>}

            <form onSubmit={onSubmit} className="formulario-cliente">
                <div className="form-group">
                    <label>Nombre *</label>
                    <input
                        name="nombre"
                        value={form.nombre}
                        onChange={onChange}
                        placeholder="Ingrese el nombre completo"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Dirección *</label>
                    <input
                        name="direccion"
                        value={form.direccion}
                        onChange={onChange}
                        placeholder="Ingrese la dirección"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Barrio</label>
                    <input
                        name="barrio"
                        value={form.barrio}
                        onChange={onChange}
                        placeholder="Ingrese el barrio"
                    />
                </div>

                <div className="form-group">
                    <label>Teléfono *</label>
                    <input
                        name="telefono"
                        value={form.telefono}
                        onChange={onChange}
                        placeholder="Ingrese el teléfono"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Observación</label>
                    <textarea
                        name="observacion"
                        value={form.observacion}
                        onChange={onChange}
                        rows={3}
                        placeholder="Observaciones adicionales"
                    />
                </div>

                <div className="form-buttons">
                    <button type="submit" disabled={loading}>
                        {loading ? '💾 Guardando...' : '💾 Guardar Cliente'}
                    </button>
                    <button type="button" onClick={() => navigate('/clientes')}>
                        🔙 Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClientesAgregar;