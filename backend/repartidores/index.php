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
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../conexion.php';
$conexion = conectarBD();

// Obtener todos los repartidores activos (sin paginación, para selects)
$query = "SELECT id, nombre, apellido, telefono FROM repartidores WHERE activo = 1 ORDER BY nombre ASC";
$resultado = $conexion->query($query);

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
$conexion->close();
?>