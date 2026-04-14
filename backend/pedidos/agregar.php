<?php
// Habilitar CORS
header('Content-Type: application/json'); // Asegurar que la respuesta sea JSON
header('Access-Control-Allow-Origin: *'); // Permitir solicitudes desde cualquier origen
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); // Métodos permitidos
header('Access-Control-Allow-Headers: Content-Type'); // Encabezados permitidos

include '../conexion.php';

$conexion = conectarBD();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Capturar datos del formulario
    $nombre_cliente = $_POST['nombre_cliente'];
    $direccion_cliente = $_POST['direccion_cliente'];
    $tipo_pedido = $_POST['tipo_pedido'];
    $precio = $_POST['precio'];

    // Insertar el pedido en la base de datos
    $query = "INSERT INTO pedidos (nombre_cliente, direccion_cliente, tipo_pedido, precio) VALUES (?, ?, ?, ?)";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("sssd", $nombre_cliente, $direccion_cliente, $tipo_pedido, $precio);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Pedido agregado correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al agregar el pedido']);
    }
    exit();
}

// Si es una solicitud GET, devolver los tipos de pedido disponibles
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $tipos_pedido = ["Garrafa 10kg", "Garrafa 15kg", "Tubo 45kg"];
    echo json_encode($tipos_pedido);
    exit();
}
?>