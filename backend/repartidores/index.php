<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include '../conexion.php';
$conexion = conectarBD();

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