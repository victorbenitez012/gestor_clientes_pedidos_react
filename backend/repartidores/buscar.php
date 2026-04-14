<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../conexion.php';
$conexion = conectarBD();

// Obtener parámetros
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
$registros_por_pagina = isset($_GET['registros_por_pagina']) ? (int)$_GET['registros_por_pagina'] : 50;
$offset = ($pagina - 1) * $registros_por_pagina;

// Consulta base
$query = "SELECT id, nombre, apellido, telefono, activo FROM repartidores WHERE activo = 1";

// Contar total de registros
$countQuery = "SELECT COUNT(id) as total FROM repartidores WHERE activo = 1";
$params = [];
$types = '';

if (!empty($search)) {
    $searchParam = "%$search%";
    $where = " AND (nombre LIKE ? OR apellido LIKE ? OR telefono LIKE ?)";
    $query .= $where;
    $countQuery .= $where;
    $params = [$searchParam, $searchParam, $searchParam];
    $types = "sss";
}

// Obtener total de registros
$countStmt = $conexion->prepare($countQuery);
if ($countStmt && !empty($params)) {
    $countStmt->bind_param($types, ...$params);
}
if ($countStmt) {
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $total_registros = $countResult ? $countResult->fetch_assoc()['total'] : 0;
    $total_paginas = ceil($total_registros / $registros_por_pagina);
    $countStmt->close();
} else {
    $total_registros = 0;
    $total_paginas = 1;
}

// Agregar ORDER BY y LIMIT
$query .= " ORDER BY nombre ASC LIMIT ? OFFSET ?";
$params[] = $registros_por_pagina;
$params[] = $offset;
$types .= "ii";

// Ejecutar consulta
$stmt = $conexion->prepare($query);
if ($stmt) {
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    $repartidores = [];
    while ($fila = $resultado->fetch_assoc()) {
        $repartidores[] = [
            'id' => (int)$fila['id'],
            'nombre' => $fila['nombre'] ?: '',
            'apellido' => $fila['apellido'] ?: '',
            'telefono' => $fila['telefono'] ?: '',
            'activo' => (int)$fila['activo']
        ];
    }
    
    echo json_encode([
        'repartidores' => $repartidores,
        'total_registros' => (int)$total_registros,
        'total_paginas' => (int)$total_paginas,
        'pagina_actual' => $pagina
    ]);
    $stmt->close();
} else {
    echo json_encode(['error' => 'Error al preparar la consulta: ' . $conexion->error]);
}

$conexion->close();
?>