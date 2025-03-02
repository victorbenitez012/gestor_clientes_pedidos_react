import React from 'react';
import { Link } from 'react-router-dom';

const Clientes: React.FC = () => {
    return (
        <div className="container">
            <img src="/logoprincipal.png" alt="Logo Principal" />
            <h1>Gestionar Clientes</h1>
            <ul className="menu">
                <li><Link to="/clientes/buscar">Buscar Cliente</Link></li>
                <li><Link to="/clientes/agregar">Agregar Cliente</Link></li>
                <li><Link to="/">Volver</Link></li>
            </ul>
        </div>
    );
};

export default Clientes;