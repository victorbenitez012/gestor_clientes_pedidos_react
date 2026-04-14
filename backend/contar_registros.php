<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/conexion.php';

// No verificar autenticación
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