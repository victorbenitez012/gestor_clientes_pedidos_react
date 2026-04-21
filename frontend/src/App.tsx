import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/public/Login';
import ForgotPassword from './components/public/ForgotPassword';
import ResetPassword from './components/public/ResetPassword';
import Dashboard from './components/private/Dashboard';
import Clientes from './components/private/Clientes';
import ClientesAgregar from './components/private/ClientesAgregar';
import ClientesBuscar from './components/private/ClientesBuscar';
import Pedidos from './components/private/Pedidos';
import AgregarPedido from './components/private/agregar-pedido/AgregarPedido';
import { EditarTablaPedidos } from './components/private/EditarTablaPedidos';
import Repartidores from './components/private/Repartidores';
import RepartidoresBuscar from './components/private/RepartidoresBuscar';
import RepartidoresAgregar from './components/private/RepartidoresAgregar';
import UsuariosAdmin from './components/private/Usuarios/UsuariosAdmin';
import PrivateRoute from './components/private/PrivateRoute';

const App = () => {
    return (
        <Router basename="/gestor_clientes_pedidos_react">
            <Routes>
                {/* ============ RUTAS PÚBLICAS ============ */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* ============ RUTAS PROTEGIDAS - ADMIN Y USUARIO ============ */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute roleRequired={['admin', 'usuario', 'repartidor']}>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/pedidos"
                    element={
                        <PrivateRoute roleRequired={['admin', 'usuario', 'repartidor']}>
                            <Pedidos />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/pedidos/editar_tabla"
                    element={
                        <PrivateRoute roleRequired={['admin', 'usuario', 'repartidor']}>
                            <EditarTablaPedidos />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/pedidos/agregar"
                    element={
                        <PrivateRoute roleRequired={['admin', 'usuario', 'repartidor']}>
                            <AgregarPedido />
                        </PrivateRoute>
                    }
                />

                {/* ============ RUTAS PROTEGIDAS - SOLO ADMIN ============ */}

                <Route
                    path="/clientes"
                    element={
                        <PrivateRoute roleRequired="admin">
                            <Clientes />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/ClientesAgregar"
                    element={
                        <PrivateRoute roleRequired="admin">
                            <ClientesAgregar />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/ClientesBuscar"
                    element={
                        <PrivateRoute roleRequired="admin">
                            <ClientesBuscar />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/repartidores"
                    element={
                        <PrivateRoute roleRequired="admin">
                            <Repartidores />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/repartidoresbuscar"
                    element={
                        <PrivateRoute roleRequired="admin">
                            <RepartidoresBuscar />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/repartidoresagregar"
                    element={
                        <PrivateRoute roleRequired="admin">
                            <RepartidoresAgregar />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin/usuarios"
                    element={
                        <PrivateRoute roleRequired="admin">
                            <UsuariosAdmin />
                        </PrivateRoute>
                    }
                />

                {/* ============ RUTA POR DEFECTO ============ */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
