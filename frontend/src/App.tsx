import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/public/Login';
import Dashboard from './components/private/Dashboard';
import Clientes from './components/private/Clientes';
import Pedidos from './components/private/Pedidos';
import EditarTablaPedidos from './components/private/EditarTablaPedidos';
import Repartidores from './components/private/Repartidores';
import PrivateRoute from './components/private/PrivateRoute';

const App = () => {
    return (
        <Router basename="/gestor_clientes_pedidos_react">
            <Routes>
                {/* Ruta pública */}
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
                {/* Ruta protegida: EditarTablaPedidos (accesible para admin y user) */}
                <Route
                    path="/pedidos/editar_tabla"
                    element={
                        <PrivateRoute roleRequired={['admin', 'usuario']}>
                            <EditarTablaPedidos />
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