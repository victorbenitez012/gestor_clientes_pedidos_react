<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../conexion.php';
$conexion = conectarBD();

if (!$conexion) {
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit();
}

$query = "SELECT id, nombre, apellido, telefono FROM repartidores ORDER BY nombre, apellido";
$resultado = $conexion->query($query);

$repartidores = [];
if ($resultado && $resultado->num_rows > 0) {
    while ($fila = $resultado->fetch_assoc()) {
        $repartidores[] = [
            'id' => (int)$fila['id'],
            'nombre' => $fila['nombre'],
            'apellido' => $fila['apellido'],
            'telefono' => $fila['telefono'] ?? ''
        ];
    }
}

echo json_encode($repartidores);
$conexion->close();
?>