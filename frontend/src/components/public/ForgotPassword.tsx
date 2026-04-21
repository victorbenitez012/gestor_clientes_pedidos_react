import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../services/authService';
import './Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [devLink, setDevLink] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setDevLink('');

        if (!email.trim()) {
            setError('El email es requerido');
            return;
        }

        setIsLoading(true);

        try {
            const response = await requestPasswordReset(email.trim());

            if (response.success) {
                setMessage(response.message);
                // Solo en desarrollo
                if (response.dev_link) {
                    setDevLink(response.dev_link);
                }
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            setError(err.message || 'Error al procesar la solicitud');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Recuperar Contraseña</h1>
                <p className="login-subtitle">
                    Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
                </p>

                {!message ? (
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
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
                            disabled={isLoading || !email.trim()}
                        >
                            {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
                        </button>
                    </form>
                ) : (
                    <div className="success-container">
                        <div className="success-message">
                            ✅ {message}
                        </div>

                        {devLink && (
                            <div className="dev-info">
                                <p><strong>Modo Desarrollo:</strong></p>
                                <p>Link de recuperación:</p>
                                <a
                                    href={devLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="dev-link"
                                >
                                    {devLink}
                                </a>
                            </div>
                        )}
                    </div>
                )}

                <div className="login-links">
                    <Link to="/login" className="back-link">
                        ← Volver al login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
