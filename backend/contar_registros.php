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

// Cualquier usuario autenticado puede contar registros
$user = requireAuth(['admin', 'usuario', 'repartidor']);

require_once __DIR__ . '/conexion.php';

if (!isset($_GET['tabla'])) {
    echo json_encode(['error' => 'Falta tabla']);
    exit();
}

$tabla = $_GET['tabla'];

$tablasPermitidas = ['clientes', 'pedidos', 'repartidores'];
if (!in_array($tabla, $tablasPermitidas)) {
    echo json_encode(['error' => 'Tabla no válida']);
    exit();
}

try {
    $conexion = conectarBD();
    $query = "SELECT COUNT(*) as total FROM $tabla";
    $resultado = $conexion->query($query);
    $fila = $resultado->fetch_assoc();
    echo json_encode(['total' => (int)$fila['total']]);
    $conexion->close();
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>