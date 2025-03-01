<?php
header('Content-Type: application/json'); // Asegurar que la respuesta sea JSON
header('Access-Control-Allow-Origin: *'); // Permitir solicitudes desde cualquier origen
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); // Métodos permitidos
header('Access-Control-Allow-Headers: Content-Type'); // Encabezados permitidos

// Incluir archivo de conexión
include '../../db/conexion.php';
$conexion = conectarBD();

// Obtener parámetros de búsqueda
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$search_secondary = isset($_GET['search_secondary']) ? trim($_GET['search_secondary']) : '';
$fecha_desde = isset($_GET['fecha_desde']) ? trim($_GET['fecha_desde']) : '';
$fecha_hasta = isset($_GET['fecha_hasta']) ? trim($_GET['fecha_hasta']) : '';

// Consultar los pedidos
$query = "
    SELECT 
        pedidos.id, pedidos.tipo_pedido, pedidos.estado, pedidos.precio, 
        pedidos.observacion_pedido, pedidos.repartidor_id, pedidos.fecha_creacion,
        clientes.direccion, clientes.barrio, clientes.telefono, 
        clientes.nombre AS cliente_nombre, clientes.observacion AS cliente_observacion,
        repartidores.nombre AS repartidor_nombre, repartidores.apellido AS repartidor_apellido
    FROM pedidos
    LEFT JOIN clientes ON pedidos.cliente_id = clientes.id
    LEFT JOIN repartidores ON pedidos.repartidor_id = repartidores.id
";

// Agregar condiciones de búsqueda
$whereConditions = [];
if (!empty($search)) {
    $whereConditions[] = "(
        pedidos.tipo_pedido LIKE '%$search%' 
        OR clientes.nombre LIKE '%$search%'
        OR clientes.direccion LIKE '%$search%'
        OR clientes.barrio LIKE '%$search%'
        OR clientes.telefono LIKE '%$search%'
        OR pedidos.estado LIKE '%$search%'
        OR clientes.observacion LIKE '%$search%'
        OR pedidos.observacion_pedido LIKE '%$search%'
        OR CONCAT(repartidores.nombre, ' ', repartidores.apellido) LIKE '%$search%'
    )";
}

if (!empty($search_secondary)) {
    $whereConditions[] = "(
        pedidos.tipo_pedido LIKE '%$search_secondary%' 
        OR clientes.direccion LIKE '%$search_secondary%' 
        OR clientes.barrio LIKE '%$search_secondary%'  
        OR clientes.telefono LIKE '%$search_secondary%' 
        OR clientes.nombre LIKE '%$search_secondary%' 
        OR pedidos.estado LIKE '%$search_secondary%' 
        OR clientes.observacion LIKE '%$search_secondary%' 
        OR pedidos.observacion_pedido LIKE '%$search_secondary%' 
        OR CONCAT(repartidores.nombre, ' ', repartidores.apellido) LIKE '%$search_secondary%'
    )";
}

if (!empty($fecha_desde) && !empty($fecha_hasta)) {
    $whereConditions[] = "(pedidos.fecha_creacion BETWEEN '$fecha_desde' AND '$fecha_hasta')";
} elseif (!empty($fecha_desde)) {
    $whereConditions[] = "(pedidos.fecha_creacion >= '$fecha_desde')";
} elseif (!empty($fecha_hasta)) {
    $whereConditions[] = "(pedidos.fecha_creacion <= '$fecha_hasta')";
}

if (!empty($whereConditions)) {
    $query .= " WHERE " . implode(' AND ', $whereConditions);
}

$query .= " ORDER BY pedidos.id DESC";

// Ejecutar la consulta de pedidos
$resultado = $conexion->query($query);
if ($resultado && $resultado->num_rows > 0) {
    $pedidos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $pedidos[] = $fila;
    }
    echo json_encode($pedidos); // Devolver datos en JSON
} else {
    echo json_encode([]); // Devolver un array vacío si no hay resultados
}
?>