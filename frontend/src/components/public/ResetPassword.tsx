import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import './Login.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Token no válido o expirado. Por favor, solicita un nuevo enlace de recuperación.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!token) {
            setError('Token no válido');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);

        try {
            const response = await resetPassword(token, password);

            if (response.success) {
                setMessage('Contraseña actualizada correctamente');
                setSuccess(true);
                // Redirigir al login después de 3 segundos
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            setError(err.message || 'Error al restablecer contraseña');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <h1>Error</h1>
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                    <div className="login-links">
                        <Link to="/forgot-password" className="back-link">
                            Solicitar nuevo enlace
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Restablecer Contraseña</h1>
                <p className="login-subtitle">
                    Ingresa tu nueva contraseña
                </p>

                {!success ? (
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="password">Nueva Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                disabled={isLoading}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repite la contraseña"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError('');
                                }}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {error && (
                            <div className="error-message">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={isLoading || !password || !confirmPassword}
                        >
                            {isLoading ? 'Actualizando...' : 'Restablecer Contraseña'}
                        </button>
                    </form>
                ) : (
                    <div className="success-container">
                        <div className="success-message">
                            ✅ {message}
                        </div>
                        <p className="redirect-message">
                            Serás redirigido al login en unos segundos...
                        </p>
                        <Link to="/login" className="login-button">
                            Ir al Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
