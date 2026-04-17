import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/public/Login';
import Dashboard from './components/private/Dashboard';
import Clientes from './components/private/Clientes';
import ClientesAgregar from './components/private/ClientesAgregar';
import ClientesBuscar from './components/private/ClientesBuscar';
import Pedidos from './components/private/Pedidos';

import AgregarPedido from './components/private/agregar-pedido/AgregarPedido';
import EditarTablaPedidos from './components/private/EditarTablaPedidos';
import Repartidores from './components/private/Repartidores';
import RepartidoresBuscar from './components/private/RepartidoresBuscar';
import RepartidoresAgregar from './components/private/RepartidoresAgregar';
import PrivateRoute from './components/private/PrivateRoute';

const App = () => {
    return (
        <Router basename="/gestor_clientes_pedidos_react">
            <Routes>
                {/* Ruta p�blica */}
                <Route path="/login" element={<Login />} />

                {/* Ruta protegida: Dashboard (accesible para admin y user) */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute roleRequired={['admin', 'usuario']}>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />

                {/* Ruta protegida: Clientes (solo accesible para admin) */}
                <Route
                    path="/clientes"
                    element={
                        <PrivateRoute roleRequired="admin">
                            <Clientes />
                        </PrivateRoute>
                    }
                />
                {/* Ruta protegida: ClientesAgregar (solo accesible para admin) */}
                <Route
                    path="/ClientesAgregar"
                    element={
                        <PrivateRoute roleRequired="admin">
                            <ClientesAgregar />
                        </PrivateRoute>
                    }
                />
                {/* Ruta protegida: ClientesBuscar (solo accesible para admin) */}
                <Route
                    path="/ClientesBuscar"
                    element={
                        <PrivateRoute roleRequired="admin">
                            <ClientesBuscar />
                        </PrivateRoute>
                    }
                />

                {/* Ruta protegida: Pedidos (accesible para admin y user) */}
                <Route
                    path="/pedidos"
                    element={
                        <PrivateRoute roleRequired={['admin', 'usuario']}>
                            <Pedidos />
                        </PrivateRoute>
                    }
                />

                {/* Ruta protegida: Repartidores (solo accesible para admin) */}
                <Route
                    path="/repartidores"
                    element={
                        <PrivateRoute roleRequired="admin">
                            <Repartidores />
                        </PrivateRoute>
                    }
                />
                {/* Ruta protegida: RepartidoresBuscar (solo accesible para admin) */}
                <Route
                    path="/repartidoresbuscar"
                    element={
                        <PrivateRoute roleRequired="admin">
                            <RepartidoresBuscar />
                        </PrivateRoute>
                    }
                />
                {/* Ruta protegida: RepartidoresAgregar (solo accesible para admin) */}
                <Route
                    path="/repartidoresagregar"
                    element={
                        <PrivateRoute roleRequired="admin">
                            <RepartidoresAgregar />
                        </PrivateRoute>
                    }
                />
                {/* Ruta protegida: EditarTablaPedidos (accesible para admin y user) */}
                <Route
                    path="/pedidos/editar_tabla"
                    element={
                        <PrivateRoute roleRequired={['admin', 'usuario']}>
                            <EditarTablaPedidos />
                        </PrivateRoute>
                    }
                />
                {/* Ruta protegida: agregar-pedido  (accesible para admin y user) */}
                <Route
                    path="/pedidos/agregar"
                    element={
                        <PrivateRoute roleRequired={['admin', 'usuario']}>
                            <AgregarPedido />
                        </PrivateRoute>
                    }
                />               
            
                {/* Ruta por defecto: Redirigir a /login si no coincide ninguna ruta */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>

    );
};

export default App;