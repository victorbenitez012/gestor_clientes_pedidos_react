<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include '../conexion.php';
$conexion = conectarBD();

$direccion = isset($_GET['direccion']) ? trim($_GET['direccion']) : '';

if (empty($direccion)) {
    echo json_encode([]);
    exit();
}

$query = "SELECT id, nombre, direccion, barrio, telefono, observacion 
          FROM clientes 
          WHERE direccion LIKE ?";

$param = "%$direccion%";
$stmt = $conexion->prepare($query);
$stmt->bind_param("s", $param);
$stmt->execute();
$resultado = $stmt->get_result();

$clientes = [];
while ($row = $resultado->fetch_assoc()) {
    $clientes[] = $row;
}

echo json_encode($clientes);
$conexion->close();
?>