<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir middleware de autenticación
require_once __DIR__ . '/../auth/middleware.php';

// Solo admin puede actualizar clientes
$user = requireAuth(['admin']);

include '../conexion.php';
$conexion = conectarBD();

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        echo json_encode(['error' => 'Datos inv�lidos']);
        exit();
    }
    
    $id = (int)$input['id'];
    $nombre = isset($input['nombre']) ? $input['nombre'] : '';
    $direccion = isset($input['direccion']) ? $input['direccion'] : '';
    $barrio = isset($input['barrio']) ? $input['barrio'] : '';
    $telefono = isset($input['telefono']) ? $input['telefono'] : '';
    $observacion = isset($input['observacion']) ? $input['observacion'] : '';
    
    $query = "UPDATE clientes SET nombre = ?, direccion = ?, barrio = ?, telefono = ?, observacion = ? WHERE id = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("sssssi", $nombre, $direccion, $barrio, $telefono, $observacion, $id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'mensaje' => 'Cliente actualizado correctamente'
        ]);
    } else {
        echo json_encode(['error' => 'Error al actualizar: ' . $stmt->error]);
    }
    
    $stmt->close();
    $conexion->close();
    exit();
}
?>