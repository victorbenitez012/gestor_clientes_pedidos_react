<?php
include 'conexion.php';

$conn = conectarBD();

$sql = "
    CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        direccion VARCHAR(200) NOT NULL,
        telefono VARCHAR(20) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT NOT NULL,
        tipo_pedido VARCHAR(100) NOT NULL,
        precio DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );
";

if ($conn->multi_query($sql)) {
    echo "Tablas creadas correctamente.";
} else {
    echo "Error al crear las tablas: " . $conn->error;
}

$conn->close();
?>