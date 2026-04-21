import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error, clearError } = useAuthContext();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (!username.trim() || !password.trim()) {
            return;
        }

        try {
            const response = await login(username.trim(), password);

            if (response.success) {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setter(e.target.value);
            if (error) clearError();
        };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Iniciar Sesión</h1>
                <p className="login-subtitle">Sistema de Gestión de Pedidos</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Usuario</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Ingrese su usuario"
                            value={username}
                            onChange={handleInputChange(setUsername)}
                            disabled={isLoading}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Ingrese su contraseña"
                                value={password}
                                onChange={handleInputChange(setPassword)}
                                disabled={isLoading}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading || !username.trim() || !password.trim()}
                    >
                        {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="login-links">
                    <Link to="/forgot-password" className="forgot-password-link">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                <div className="login-info">
                    <p>Usuarios de prueba:</p>
                    <code>admin / admin123</code>
                    <br />
                    <code>usuario / usuario123</code>
                    <br />
                    <code>repartidor1 / repartidor123</code>
                </div>
            </div>
        </div>
    );
};

export default Login;
