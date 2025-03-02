import React from 'react';
import { Link } from 'react-router-dom';

const Pedidos: React.FC = () => {
    return (
        <div className="container">
            <img src="/logoprincipal.png" alt="Logo Principal" />
            <h1>Gestionar Pedidos</h1>
            <ul className="menu">
                <li><Link to="/pedidos/buscar">Buscar Pedido</Link></li>
                <li><Link to="/pedidos/agregar">Agregar Pedido</Link></li>
                <li><Link to="/pedidos/editar">Editar Pedido</Link></li>
                <li><Link to="/pedidos/editar_tabla">Editar Planilla de Pedidos</Link></li>
                <li><Link to="/">Volver</Link></li>
            </ul>
        </div>
    );
};

export default Pedidos;