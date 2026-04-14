<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include '../conexion.php';
$conexion = conectarBD();

$termino = isset($_GET['termino']) ? trim($_GET['termino']) : '';

if (empty($termino)) {
    echo json_encode([]);
    exit();
}

// Eliminar guiones del término de búsqueda
$terminoSinGuiones = str_replace('-', '', $termino);

$query = "SELECT id, nombre, direccion, barrio, telefono, observacion 
          FROM clientes 
          WHERE nombre LIKE ? 
          OR direccion LIKE ? 
          OR barrio LIKE ? 
          OR REPLACE(telefono, '-', '') LIKE ?";

$param = "%$termino%";
$paramSinGuiones = "%$terminoSinGuiones%";

$stmt = $conexion->prepare($query);
$stmt->bind_param("ssss", $param, $param, $param, $paramSinGuiones);
$stmt->execute();
$resultado = $stmt->get_result();

$clientes = [];
while ($row = $resultado->fetch_assoc()) {
    $clientes[] = $row;
}

echo json_encode($clientes);
$conexion->close();
?>