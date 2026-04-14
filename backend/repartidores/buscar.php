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

$search = isset($_GET['search']) ? trim($_GET['search']) : '';

if (!empty($search)) {
    $searchParam = "%$search%";
    // Eliminar "activo = 1" porque no existe
    $query = "SELECT id, nombre, apellido, telefono FROM repartidores WHERE nombre LIKE ? OR apellido LIKE ? OR telefono LIKE ? ORDER BY nombre ASC";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("sss", $searchParam, $searchParam, $searchParam);
    $stmt->execute();
    $resultado = $stmt->get_result();
} else {
    $query = "SELECT id, nombre, apellido, telefono FROM repartidores ORDER BY nombre ASC";
    $resultado = $conexion->query($query);
}

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

if (isset($stmt)) $stmt->close();
$conexion->close();
?>