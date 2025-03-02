import React from 'react';
import { Link } from 'react-router-dom';

const Repartidores: React.FC = () => {
    return (
        <div className="container">
            <h1>Gestionar Repartidores</h1>
            <ul className="menu">
                <li><Link to="/repartidores/buscar">Buscar Repartidor</Link></li>
                <li><Link to="/repartidores/agregar">Agregar Repartidor</Link></li>
                <li><Link to="/">Volver</Link></li>
            </ul>
        </div>
    );
};

export default Repartidores;