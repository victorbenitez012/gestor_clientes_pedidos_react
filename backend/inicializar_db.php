<?php

// Incluye el archivo de conexión
include 'conexion.php';

echo "<h1>Inicialización de la base de datos</h1>";

try {
    // Conexión a la base de datos
    $conexion = conectarBD();

    // Crear tabla de Clientes telefono no puede tener menos de 20
    echo "<p>Verificando tabla 'clientes'...</p>";
    $crearClientes = "
        CREATE TABLE IF NOT EXISTS clientes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100),
            direccion VARCHAR(255) NOT NULL,
            barrio VARCHAR(255),
            telefono VARCHAR(20) NOT NULL,
            observacion TEXT,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    ";
    ejecutarQuery($crearClientes);
    echo "<p>✓ Tabla 'clientes' creada/verificada correctamente.</p>";

    // Crear o verificar la tabla de Repartidores
    echo "<p>Verificando tabla 'repartidores'...</p>";
    $crearRepartidores = "
        CREATE TABLE IF NOT EXISTS repartidores (
            id INT AUTO_INCREMENT PRIMARY KEY,            
            nombre VARCHAR(100) NOT NULL,
            apellido VARCHAR(100) NOT NULL,
            direccion VARCHAR(255) NOT NULL,
            telefono VARCHAR(20) NOT NULL,
            observacion TEXT,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    ";
    ejecutarQuery($crearRepartidores);
    echo "<p>✓ Tabla 'repartidores' creada/verificada correctamente.</p>";

    // Crear tabla de Pedidos, direccion nombre y telefono ahora estoy usando los datos desde la tabla clientes y observacion cliente tambien
    echo "<p>Verificando tabla 'pedidos'...</p>";
    $crearPedidos = "
        CREATE TABLE IF NOT EXISTS pedidos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cliente_id INT NOT NULL,            
            tipo_pedido VARCHAR(255) NOT NULL,            
            observacion_pedido TEXT,
            estado ENUM('Pendiente', 'En Proceso', 'Entregado', 'Cancelado', 'Finalizado', 'Cuenta') NOT NULL DEFAULT 'Pendiente',
            repartidor_id INT NULL,
            precio DECIMAL(10, 2) NOT NULL,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
            FOREIGN KEY (repartidor_id) REFERENCES repartidores(id) ON DELETE SET NULL
        ) ENGINE=InnoDB;
    ";
    ejecutarQuery($crearPedidos);
    echo "<p>✓ Tabla 'pedidos' creada/verificada correctamente.</p>";

    // Agregar datos iniciales en 'clientes' si está vacío
    echo "<p>Agregando datos iniciales en 'clientes'...</p>";
    $verificarClientes = "SELECT COUNT(*) AS total FROM clientes";
    $resultadoClientes = ejecutarQuery($verificarClientes)->fetch_assoc();
    if ($resultadoClientes['total'] == 0) {
        $insertarClientes = "
            INSERT INTO clientes (nombre, direccion, telefono, observacion) VALUES
            ('Juan Pérez', 'Av. Siempre Viva 123', '5551234567', 'Cliente preferencial.'),
            ('Ana López', 'Calle Falsa 456', '5557654321', 'Cliente con descuentos.'),
            ('Luis Martínez', 'Plaza Central 789', '5559876543', 'Cliente frecuente.')
        ";
        ejecutarQuery($insertarClientes);
        echo "<p>✓ Clientes iniciales insertados correctamente.</p>";
    } else {
        echo "<p>✓ La tabla 'clientes' ya contiene datos.</p>";
    }

    // Agregar datos iniciales en 'repartidores' si está vacío
    echo "<p>Agregando datos iniciales en 'repartidores'...</p>";
    $verificarRepartidores = "SELECT COUNT(*) AS total FROM repartidores";
    $resultadoRepartidores = ejecutarQuery($verificarRepartidores)->fetch_assoc();
    if ($resultadoRepartidores['total'] == 0) {
        $insertarRepartidores = "
            INSERT INTO repartidores (nombre, apellido, telefono, observacion) VALUES
            ('Carlos', 'Gómez', '5552345678', 'Disponible fines de semana.'),
            ('Marta', 'Díaz', '5558765432', 'Repartidora experta en rutas rápidas.'),
            ('Pedro', 'Sánchez', '5556543210', 'Especialista en entregas nocturnas.')
        ";
        ejecutarQuery($insertarRepartidores);
        echo "<p>✓ Repartidores iniciales insertados correctamente.</p>";
    } else {
        echo "<p>✓ La tabla 'repartidores' ya contiene datos.</p>";
    }

    // Agregar datos iniciales en 'pedidos' si está vacío
    echo "<p>Agregando datos iniciales en 'pedidos'...</p>";
    $verificarPedidos = "SELECT COUNT(*) AS total FROM pedidos";
    $resultadoPedidos = ejecutarQuery($verificarPedidos)->fetch_assoc();
    if ($resultadoPedidos['total'] == 0) {
        $insertarPedidos = "
            INSERT INTO pedidos (cliente_id, tipo_pedido, observacion_cliente, observacion_pedido, estado, repartidor_id, precio) VALUES
            (1, 'Electrodomésticos', 'Entrega urgente requerida.', 'Pedido asignado al repartidor.', 'Pendiente', 1, 150.00),
            (2, 'Ropa', 'Solicitan bolsa adicional.', 'Pedido en ruta.', 'En Proceso', 2, 80.00),
            (3, 'Alimentos', 'Requiere refrigeración.', 'Entregado en la puerta.', 'Entregado', 3, 50.00)
        ";
        ejecutarQuery($insertarPedidos);
        echo "<p>✓ Pedidos iniciales insertados correctamente.</p>";
    } else {
        echo "<p>✓ La tabla 'pedidos' ya contiene datos.</p>";
    }

    echo "<p><strong>✓ Inicialización completa.</strong></p>";

} catch (Exception $e) {
    echo "<p>Error al inicializar la base de datos: " . $e->getMessage() . "</p>";
}
?>