<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir middleware de autenticación
require_once __DIR__ . '/auth/middleware.php';

// Cualquier usuario autenticado puede usar este endpoint
$user = requireAuth(['admin', 'usuario', 'repartidor']);

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