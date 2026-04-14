<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include '../conexion.php';
$conexion = conectarBD();

$cliente_id = isset($_GET['cliente_id']) ? (int)$_GET['cliente_id'] : 0;

if ($cliente_id <= 0) {
    echo json_encode([]);
    exit();
}

$query = "SELECT p.id, p.tipo_pedido, p.observacion_pedido, p.estado, p.precio, p.fecha_creacion,
                 c.nombre AS cliente_nombre, c.direccion, c.barrio, c.telefono, c.observacion AS observacion_cliente,
                 r.nombre AS repartidor_nombre, r.apellido AS repartidor_apellido
          FROM pedidos p
          LEFT JOIN clientes c ON p.cliente_id = c.id
          LEFT JOIN repartidores r ON p.repartidor_id = r.id
          WHERE p.cliente_id = ?
          ORDER BY p.fecha_creacion DESC
          LIMIT 10";

$stmt = $conexion->prepare($query);
$stmt->bind_param("i", $cliente_id);
$stmt->execute();
$resultado = $stmt->get_result();

$pedidos = [];
while ($row = $resultado->fetch_assoc()) {
    $pedidos[] = $row;
}

echo json_encode($pedidos);
$conexion->close();
?>