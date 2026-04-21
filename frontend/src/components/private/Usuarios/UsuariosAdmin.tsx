import React, { useState, useEffect } from 'react';
import { getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario, Usuario } from '../../../services/authService';
import './UsuariosAdmin.css';

interface FormData {
    username: string;
    password: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    rol: 'admin' | 'usuario' | 'repartidor';
}

const UsuariosAdmin: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);
    const [formData, setFormData] = useState<FormData>({
        username: '',
        password: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        rol: 'usuario'
    });

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const data = await getUsuarios();
            setUsuarios(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleOpenModal = (user?: Usuario) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                password: '',
                nombre: user.nombre,
                apellido: user.apellido || '',
                email: user.email || '',
                telefono: user.telefono || '',
                rol: user.rol as any
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                nombre: '',
                apellido: '',
                email: '',
                telefono: '',
                rol: 'usuario'
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (editingUser) {
                // Actualizar usuario existente
                const updateData: any = {
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    email: formData.email,
                    telefono: formData.telefono,
                    rol: formData.rol
                };

                if (formData.password) {
                    updateData.password = formData.password;
                }

                await actualizarUsuario(editingUser.id, updateData);
            } else {
                // Crear nuevo usuario
                if (!formData.password) {
                    setError('La contraseña es requerida para nuevos usuarios');
                    return;
                }

                await crearUsuario({
                    username: formData.username,
                    password: formData.password,
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    email: formData.email,
                    telefono: formData.telefono,
                    rol: formData.rol
                });
            }

            await fetchUsuarios();
            handleCloseModal();
        } catch (err: any) {
            setError(err.message || 'Error al guardar usuario');
        }
    };

    const handleDelete = async (user: Usuario) => {
        if (user.id === 1) {
            alert('No se puede eliminar el usuario administrador principal');
            return;
        }

        if (window.confirm(`¿Está seguro que desea eliminar al usuario ${user.username}?`)) {
            try {
                await eliminarUsuario(user.id);
                await fetchUsuarios();
            } catch (err: any) {
                alert(err.message || 'Error al eliminar usuario');
            }
        }
    };

    const getRolBadge = (rol: string) => {
        const colors: Record<string, string> = {
            admin: '#dc2626',
            usuario: '#2563eb',
            repartidor: '#059669'
        };

        return (
            <span
                className="rol-badge"
                style={{ backgroundColor: colors[rol] || '#666' }}
            >
                {rol === 'admin' && '👑 '}
                {rol === 'usuario' && '👤 '}
                {rol === 'repartidor' && '🛵 '}
                {rol}
            </span>
        );
    };

    if (loading) return <div className="usuarios-loading">Cargando usuarios...</div>;

    return (
        <div className="usuarios-admin">
            <div className="usuarios-header">
                <h1>Gestión de Usuarios</h1>
                <button className="btn-agregar" onClick={() => handleOpenModal()}>
                    + Nuevo Usuario
                </button>
            </div>

            {error && <div className="usuarios-error">⚠️ {error}</div>}

            <div className="usuarios-table-container">
                <table className="usuarios-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Último Acceso</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((user) => (
                            <tr key={user.id}>
                                <td><strong>{user.username}</strong></td>
                                <td>{user.nombre_completo}</td>
                                <td>{user.email || '-'}</td>
                                <td>{getRolBadge(user.rol)}</td>
                                <td>
                                    <span className={`estado-badge ${user.activo ? 'activo' : 'inactivo'}`}>
                                        {user.activo ? '✅ Activo' : '❌ Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    {user.ultimo_acceso
                                        ? new Date(user.ultimo_acceso).toLocaleString()
                                        : 'Nunca'}
                                </td>
                                <td>
                                    <button
                                        className="btn-editar"
                                        onClick={() => handleOpenModal(user)}
                                        disabled={user.id === 1}
                                        title={user.id === 1 ? 'No se puede editar el admin principal' : 'Editar'}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-eliminar"
                                        onClick={() => handleDelete(user)}
                                        disabled={user.id === 1}
                                        title={user.id === 1 ? 'No se puede eliminar el admin principal' : 'Eliminar'}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>

                        <form onSubmit={handleSubmit}>
                            {!editingUser && (
                                <div className="form-group">
                                    <label>Usuario *</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                        disabled={!!editingUser}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Apellido</label>
                                <input
                                    type="text"
                                    value={formData.apellido}
                                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="tel"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Rol *</label>
                                <select
                                    value={formData.rol}
                                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                                    required
                                    disabled={editingUser?.id === 1}
                                >
                                    <option value="admin">👑 Administrador</option>
                                    <option value="usuario">👤 Usuario</option>
                                    <option value="repartidor">🛵 Repartidor</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>
                                    {editingUser ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                    minLength={editingUser ? undefined : 6}
                                />
                            </div>

                            {error && <div className="form-error">{error}</div>}

                            <div className="modal-buttons">
                                <button type="button" className="btn-cancelar" onClick={handleCloseModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-guardar">
                                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsuariosAdmin;
