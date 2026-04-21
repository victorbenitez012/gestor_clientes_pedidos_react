<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir middleware de autenticación
require_once __DIR__ . '/../auth/middleware.php';

// Solo admin puede agregar clientes
$user = requireAuth(['admin']);

include '../conexion.php';
$conexion = conectarBD();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['error' => 'Datos inv�lidos']);
        exit();
    }
    
    $nombre = isset($input['nombre']) ? $input['nombre'] : '';
    $direccion = isset($input['direccion']) ? $input['direccion'] : '';
    $barrio = isset($input['barrio']) ? $input['barrio'] : '';
    $telefono = isset($input['telefono']) ? $input['telefono'] : '';
    $observacion = isset($input['observacion']) ? $input['observacion'] : '';
    
    $query = "INSERT INTO clientes (nombre, direccion, barrio, telefono, observacion) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("sssss", $nombre, $direccion, $barrio, $telefono, $observacion);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'mensaje' => 'Cliente agregado correctamente',
            'id' => $conexion->insert_id
        ]);
    } else {
        echo json_encode(['error' => 'Error al guardar el cliente: ' . $stmt->error]);
    }
    
    $stmt->close();
    $conexion->close();
    exit();
}
?>