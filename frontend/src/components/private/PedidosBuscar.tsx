import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/styles.css';

const PedidosBuscar: React.FC = () => {
    return (
        <div className="container">
            <h1>Buscar pedidos</h1>
            <p>
                Us� la planilla editable con filtros por texto y fechas para buscar y modificar pedidos en
                bloque.
            </p>
            <ul className="menu">
                <li>
                    <Link to="/pedidos/editar_tabla">Abrir planilla de pedidos</Link>
                </li>
                <li>
                    <Link to="/pedidos">Volver a pedidos</Link>
                </li>
                <li>
                    <Link to="/dashboard">Inicio</Link>
                </li>
            </ul>
        </div>
    );
};

export default PedidosBuscar;
