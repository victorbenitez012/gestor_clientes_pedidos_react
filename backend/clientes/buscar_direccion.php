<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';
cors_headers();

// Incluir middleware de autenticación
require_once __DIR__ . '/../auth/middleware.php';

// Cualquier usuario autenticado puede buscar
$user = requireAuth(['admin', 'usuario', 'repartidor']);

include '../conexion.php';
$conexion = conectarBD();

$direccion = isset($_GET['direccion']) ? trim($_GET['direccion']) : '';

if (empty($direccion)) {
    echo json_encode([]);
    exit();
}

// Eliminar guiones para b�squeda de tel�fono
$telefonoLimpio = str_replace('-', '', $direccion);

$query = "SELECT id, nombre, direccion, barrio, telefono, observacion 
          FROM clientes 
          WHERE direccion LIKE ? 
          OR REPLACE(telefono, '-', '') LIKE ?";

$paramDireccion = "%$direccion%";
$paramTelefono = "%$telefonoLimpio%";

$stmt = $conexion->prepare($query);
$stmt->bind_param("ss", $paramDireccion, $paramTelefono);
$stmt->execute();
$resultado = $stmt->get_result();

$clientes = [];
while ($row = $resultado->fetch_assoc()) {
    $clientes[] = $row;
}

echo json_encode($clientes);
$conexion->close();
?>