<?php
header('Content-Type: application/json'); // Asegurar que la respuesta sea JSON
header('Access-Control-Allow-Origin: *'); // Permitir solicitudes desde cualquier origen
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); // Métodos permitidos
header('Access-Control-Allow-Headers: Content-Type'); // Encabezados permitidos

// Incluir archivo de conexión
include '../conexion.php';
$conexion = conectarBD();

// Obtener y sanitizar parámetros de búsqueda
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
$params = [];
$types = '';

if (!empty($search)) {
    $whereConditions[] = "(
        pedidos.tipo_pedido LIKE ? 
        OR clientes.nombre LIKE ?
        OR clientes.direccion LIKE ?
        OR clientes.barrio LIKE ?
        OR clientes.telefono LIKE ?
        OR pedidos.estado LIKE ?
        OR clientes.observacion LIKE ?
        OR pedidos.observacion_pedido LIKE ?
        OR CONCAT(repartidores.nombre, ' ', repartidores.apellido) LIKE ?
    )";
    $searchParam = "%$search%";
    $params = array_merge($params, array_fill(0, 9, $searchParam));
    $types .= str_repeat('s', 9); // 9 parámetros de tipo string
}

if (!empty($search_secondary)) {
    $whereConditions[] = "(
        pedidos.tipo_pedido LIKE ? 
        OR clientes.direccion LIKE ? 
        OR clientes.barrio LIKE ?  
        OR clientes.telefono LIKE ? 
        OR clientes.nombre LIKE ? 
        OR pedidos.estado LIKE ? 
        OR clientes.observacion LIKE ? 
        OR pedidos.observacion_pedido LIKE ? 
        OR CONCAT(repartidores.nombre, ' ', repartidores.apellido) LIKE ?
    )";
    $searchSecondaryParam = "%$search_secondary%";
    $params = array_merge($params, array_fill(0, 9, $searchSecondaryParam));
    $types .= str_repeat('s', 9); // 9 parámetros de tipo string
}

if (!empty($fecha_desde)) {
    $whereConditions[] = "pedidos.fecha_creacion >= ?";
    $params[] = $fecha_desde;
    $types .= 's'; // Parámetro de tipo string
}

if (!empty($fecha_hasta)) {
    $whereConditions[] = "pedidos.fecha_creacion <= ?";
    $params[] = $fecha_hasta;
    $types .= 's'; // Parámetro de tipo string
}

if (!empty($whereConditions)) {
    $query .= " WHERE " . implode(' AND ', $whereConditions);
}

$query .= " ORDER BY pedidos.id DESC";

// Ejecutar la consulta de pedidos
$stmt = $conexion->prepare($query);
if ($stmt) {
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $resultado = $stmt->get_result();

    $pedidos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $pedidos[] = $fila;
    }
    echo json_encode($pedidos); // Devolver datos en JSON
} else {
    echo json_encode(['error' => 'Error al preparar la consulta: ' . $conexion->error]);
}

// Cerrar la conexión
$conexion->close();
?>