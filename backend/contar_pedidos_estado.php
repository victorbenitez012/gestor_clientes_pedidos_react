<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/conexion.php';

if (!isset($_GET['estado'])) {
    echo json_encode(['error' => 'Falta estado']);
    exit();
}

$estado = $_GET['estado'];

$estadosMap = [
    'pendiente' => 'Pendiente',
    'en proceso' => 'En Proceso',
    'entregado' => 'Entregado',
    'finalizado' => 'Finalizado',
    'cuenta' => 'Cuenta'
];

$estadoBuscar = isset($estadosMap[strtolower($estado)]) ? $estadosMap[strtolower($estado)] : $estado;

try {
    $conexion = conectarBD();
    $query = "SELECT COUNT(*) as total FROM pedidos WHERE estado = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("s", $estadoBuscar);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $fila = $resultado->fetch_assoc();
    echo json_encode(['total' => (int)$fila['total']]);
    $stmt->close();
    $conexion->close();
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>