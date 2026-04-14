import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        // Simular autenticación
        if (username === 'admin' && password === 'admin') {
            localStorage.setItem('user', JSON.stringify({ username: 'admin', rol: 'admin' }));
            navigate('/dashboard');
        } else if (username === 'user' && password === 'user') {
            localStorage.setItem('user', JSON.stringify({ username: 'user', rol: 'usuario' }));
            navigate('/dashboard');
        } else {
            setError('Credenciales incorrectas');
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Iniciar Sesión</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;