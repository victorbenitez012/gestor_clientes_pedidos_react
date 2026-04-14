import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/styles.css';

const Clientes: React.FC = () => {
    return (
        <div className="container">
            <img src="/logoprincipal.png" alt="Logo Principal" className="logo" />
            <h1>👥 Gestión de Clientes</h1>
            <p>Administra tus <strong>clientes</strong> de forma eficiente: búscalos, edítalos o agrega nuevos registros.</p>

            <nav>
                <ul className="menu">
                    <li><Link to="/clientesbuscar">🔍 Buscar Clientes</Link></li>
                    <li><Link to="/clientesagregar">➕ Agregar Cliente</Link></li>
                    <li><Link to="/dashboard">📊 Volver al Dashboard</Link></li>
                </ul>
            </nav>            
        </div>
    );
};

export default Clientes;