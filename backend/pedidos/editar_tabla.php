<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir archivo de conexión
include '../conexion.php';
$conexion = conectarBD();

// Obtener y sanitizar parámetros de búsqueda
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$search_secondary = isset($_GET['search_secondary']) ? trim($_GET['search_secondary']) : '';
$fecha_desde = isset($_GET['fecha_desde']) ? trim($_GET['fecha_desde']) : '';
$fecha_hasta = isset($_GET['fecha_hasta']) ? trim($_GET['fecha_hasta']) : '';
$repartidor_filtro = isset($_GET['repartidor_filtro']) ? $_GET['repartidor_filtro'] : '';
$estado_filtro = isset($_GET['estado_filtro']) ? $_GET['estado_filtro'] : '';
$pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
$registros_por_pagina = isset($_GET['registros_por_pagina']) ? (int)$_GET['registros_por_pagina'] : 50;
$offset = ($pagina - 1) * $registros_por_pagina;

// Consultar los pedidos con TODAS las columnas
$query = "
    SELECT 
        pedidos.id, 
        pedidos.tipo_pedido, 
        pedidos.estado, 
        pedidos.precio, 
        pedidos.observacion_pedido, 
        pedidos.repartidor_id, 
        pedidos.fecha_creacion,
        pedidos.garrafa_10kg, 
        pedidos.garrafa_15kg, 
        pedidos.garrafa_45kg,
        clientes.direccion, 
        clientes.barrio, 
        clientes.telefono, 
        clientes.nombre AS cliente_nombre, 
        clientes.observacion AS cliente_observacion,
        repartidores.nombre AS repartidor_nombre, 
        repartidores.apellido AS repartidor_apellido
    FROM pedidos
    LEFT JOIN clientes ON pedidos.cliente_id = clientes.id
    LEFT JOIN repartidores ON pedidos.repartidor_id = repartidores.id
";

// Agregar condiciones de búsqueda
$whereConditions = [];
$params = [];
$types = '';

// Búsqueda general
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
    $types .= str_repeat('s', 9);
}

// Búsqueda secundaria
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
    $types .= str_repeat('s', 9);
}

// Filtro por repartidor
if ($repartidor_filtro !== '') {
    if ($repartidor_filtro === 'null') {
        $whereConditions[] = "(pedidos.repartidor_id IS NULL OR pedidos.repartidor_id = 0)";
    } else {
        $whereConditions[] = "pedidos.repartidor_id = ?";
        $params[] = (int)$repartidor_filtro;
        $types .= 'i';
    }
}

// Filtro por estado
if (!empty($estado_filtro)) {
    $whereConditions[] = "pedidos.estado = ?";
    $params[] = $estado_filtro;
    $types .= 's';
}

// Filtro por fechas
if (!empty($fecha_desde)) {
    $whereConditions[] = "pedidos.fecha_creacion >= ?";
    $params[] = $fecha_desde;
    $types .= 's';
}

if (!empty($fecha_hasta)) {
    $whereConditions[] = "pedidos.fecha_creacion <= ?";
    $params[] = $fecha_hasta . ' 23:59:59';
    $types .= 's';
}

// Agregar WHERE si hay condiciones
if (!empty($whereConditions)) {
    $query .= " WHERE " . implode(' AND ', $whereConditions);
}

// Consulta para contar total de registros (sin LIMIT)
$countQuery = "
    SELECT COUNT(pedidos.id) as total
    FROM pedidos
    LEFT JOIN clientes ON pedidos.cliente_id = clientes.id
    LEFT JOIN repartidores ON pedidos.repartidor_id = repartidores.id
";
if (!empty($whereConditions)) {
    $countQuery .= " WHERE " . implode(' AND ', $whereConditions);
}

$countStmt = $conexion->prepare($countQuery);
if ($countStmt && !empty($params)) {
    // Copiar parámetros para el count
    $countParams = $params;
    $countTypes = $types;
    $countStmt->bind_param($countTypes, ...$countParams);
}
if ($countStmt) {
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $total_registros = $countResult->fetch_assoc()['total'];
    $total_paginas = ceil($total_registros / $registros_por_pagina);
    $countStmt->close();
} else {
    $total_registros = 0;
    $total_paginas = 1;
}

// Agregar ORDER BY y LIMIT
$query .= " ORDER BY pedidos.id DESC LIMIT ? OFFSET ?";
$params[] = $registros_por_pagina;
$params[] = $offset;
$types .= 'ii';

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
        // Asegurar valores por defecto para las garrafas
        $fila['garrafa_10kg'] = isset($fila['garrafa_10kg']) ? (int)$fila['garrafa_10kg'] : 0;
        $fila['garrafa_15kg'] = isset($fila['garrafa_15kg']) ? (int)$fila['garrafa_15kg'] : 0;
        $fila['garrafa_45kg'] = isset($fila['garrafa_45kg']) ? (int)$fila['garrafa_45kg'] : 0;
        $fila['precio'] = isset($fila['precio']) ? (float)$fila['precio'] : 0;
        $pedidos[] = $fila;
    }
    
    echo json_encode([
        'pedidos' => $pedidos,
        'total_registros' => (int)$total_registros,
        'total_paginas' => (int)$total_paginas
    ]);
} else {
    echo json_encode(['error' => 'Error al preparar la consulta: ' . $conexion->error]);
}

// Cerrar la conexión
$conexion->close();
?>