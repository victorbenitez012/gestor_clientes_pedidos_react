<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../conexion.php';
$conexion = conectarBD();

if (!$conexion) {
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit();
}

// Eliminar "WHERE activo = 1" porque esa columna no existe
$query = "SELECT id, nombre, apellido, telefono FROM repartidores ORDER BY nombre ASC";
$resultado = $conexion->query($query);

if ($resultado) {
    $repartidores = [];
    while ($fila = $resultado->fetch_assoc()) {
        $repartidores[] = [
            'id' => (int)$fila['id'],
            'nombre' => $fila['nombre'] ?: '',
            'apellido' => $fila['apellido'] ?: '',
            'telefono' => $fila['telefono'] ?: ''
        ];
    }
    echo json_encode($repartidores);
} else {
    echo json_encode(['error' => 'Error en la consulta: ' . $conexion->error]);
}

$conexion->close();
?>