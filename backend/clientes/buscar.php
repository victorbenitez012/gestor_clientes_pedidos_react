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
$query = "SELECT id, nombre, direccion, barrio, telefono, observacion FROM clientes";

// Contar total de registros
$countQuery = "SELECT COUNT(id) as total FROM clientes";
$params = [];
$types = '';

if (!empty($search)) {
    $searchParam = "%$search%";
    $searchClean = str_replace('-', '', $search);
    $searchParamClean = "%$searchClean%";
    
    $where = " WHERE nombre LIKE ? 
               OR direccion LIKE ? 
               OR barrio LIKE ? 
               OR REPLACE(telefono, '-', '') LIKE ? 
               OR observacion LIKE ?";
    
    $query .= $where;
    $countQuery .= $where;
    $params = array_fill(0, 5, $searchParam);
    $params[3] = $searchParamClean;
    $types = "sssss";
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
    
    $clientes = [];
    while ($fila = $resultado->fetch_assoc()) {
        $clientes[] = [
            'id' => (int)$fila['id'],
            'nombre' => $fila['nombre'] ?: '',
            'direccion' => $fila['direccion'] ?: '',
            'barrio' => $fila['barrio'] ?: '',
            'telefono' => $fila['telefono'] ?: '',
            'observacion' => $fila['observacion'] ?: ''
        ];
    }
    
    echo json_encode([
        'clientes' => $clientes,
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