import React from 'react';
import { Link } from 'react-router-dom';

const Repartidores: React.FC = () => {
    return (
        <div className="container">
            <h1>Gestionar Repartidores</h1>
            <ul className="menu">
                <li><Link to="/RepartidoresBuscar">Buscar Repartidor</Link></li>
                <li><Link to="/RepartidoresAgregar">Agregar Repartidor</Link></li>
                <li><Link to="/Dashboard">Volver</Link></li>
            </ul>
        </div>
    );
};

export default Repartidores;