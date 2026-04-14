<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../conexion.php';
$conexion = conectarBD();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['error' => 'Datos inválidos']);
        exit();
    }
    
    $nombre = isset($input['nombre']) ? $input['nombre'] : '';
    $apellido = isset($input['apellido']) ? $input['apellido'] : '';
    $telefono = isset($input['telefono']) ? $input['telefono'] : '';
    $activo = isset($input['activo']) ? (int)$input['activo'] : 1;
    
    $query = "INSERT INTO repartidores (nombre, apellido, telefono, activo) VALUES (?, ?, ?, ?)";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("sssi", $nombre, $apellido, $telefono, $activo);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'mensaje' => 'Repartidor agregado correctamente',
            'id' => $conexion->insert_id
        ]);
    } else {
        echo json_encode(['error' => 'Error al guardar: ' . $stmt->error]);
    }
    
    $stmt->close();
    $conexion->close();
    exit();
}
?>