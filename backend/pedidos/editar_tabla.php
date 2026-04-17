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

// Incluir conexión
include '../conexion.php';
$conexion = conectarBD();

// ============ GET: Obtener pedidos ============
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener parámetros
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $search_secondary = isset($_GET['search_secondary']) ? trim($_GET['search_secondary']) : '';
    $fecha_desde = isset($_GET['fecha_desde']) ? trim($_GET['fecha_desde']) : '';
    $fecha_hasta = isset($_GET['fecha_hasta']) ? trim($_GET['fecha_hasta']) : '';
    $repartidor_filtro = isset($_GET['repartidor_filtro']) ? $_GET['repartidor_filtro'] : '';
    $estado_filtro = isset($_GET['estado_filtro']) ? $_GET['estado_filtro'] : '';
    $tipo_entrega_filtro = isset($_GET['tipo_entrega_filtro']) ? $_GET['tipo_entrega_filtro'] : ''; // NUEVO
    $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
    $registros_por_pagina = isset($_GET['registros_por_pagina']) ? (int)$_GET['registros_por_pagina'] : 50;
    $offset = ($pagina - 1) * $registros_por_pagina;

    // Construir consulta base
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
            pedidos.fecha_entrega_programada,
            pedidos.es_programado,
            clientes.direccion, 
            clientes.barrio, 
            clientes.telefono, 
            clientes.nombre AS cliente_nombre, 
            clientes.observacion AS cliente_observacion,
            repartidores.nombre AS repartidor_nombre,
            repartidores.apellido AS repartidor_apellido,
            repartidores.telefono AS repartidor_telefono
        FROM pedidos
        LEFT JOIN clientes ON pedidos.cliente_id = clientes.id
        LEFT JOIN repartidores ON pedidos.repartidor_id = repartidores.id
    ";

    // Construir condiciones WHERE
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
            OR clientes.observacion LIKE ?
            OR pedidos.observacion_pedido LIKE ?
        )";
        $searchParam = "%$search%";
        $params = array_merge($params, array_fill(0, 7, $searchParam));
        $types .= str_repeat('s', 7);
    }

    if (!empty($search_secondary)) {
        $whereConditions[] = "(
            pedidos.tipo_pedido LIKE ? 
            OR clientes.direccion LIKE ? 
            OR clientes.barrio LIKE ?  
            OR clientes.telefono LIKE ? 
            OR clientes.nombre LIKE ? 
            OR clientes.observacion LIKE ? 
            OR pedidos.observacion_pedido LIKE ?
        )";
        $searchSecondaryParam = "%$search_secondary%";
        $params = array_merge($params, array_fill(0, 7, $searchSecondaryParam));
        $types .= str_repeat('s', 7);
    }

    if ($repartidor_filtro !== '') {
        if ($repartidor_filtro === 'null') {
            $whereConditions[] = "(pedidos.repartidor_id IS NULL OR pedidos.repartidor_id = 0)";
        } else {
            $whereConditions[] = "pedidos.repartidor_id = ?";
            $params[] = (int)$repartidor_filtro;
            $types .= 'i';
        }
    }

    if (!empty($estado_filtro)) {
        $whereConditions[] = "pedidos.estado = ?";
        $params[] = $estado_filtro;
        $types .= 's';
    }

    // NUEVO FILTRO POR TIPO DE ENTREGA
    if ($tipo_entrega_filtro === 'programado') {
        $whereConditions[] = "pedidos.es_programado = 1";
    } elseif ($tipo_entrega_filtro === 'inmediato') {
        $whereConditions[] = "(pedidos.es_programado = 0 OR pedidos.es_programado IS NULL)";
    }

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

    if (!empty($whereConditions)) {
        $query .= " WHERE " . implode(' AND ', $whereConditions);
    }

    // Consulta para contar total
    $countQuery = str_replace(
        "SELECT 
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
            pedidos.fecha_entrega_programada,
            pedidos.es_programado,
            clientes.direccion, 
            clientes.barrio, 
            clientes.telefono, 
            clientes.nombre AS cliente_nombre, 
            clientes.observacion AS cliente_observacion,
            repartidores.nombre AS repartidor_nombre,
            repartidores.apellido AS repartidor_apellido,
            repartidores.telefono AS repartidor_telefono",
        "SELECT COUNT(pedidos.id) as total",
        $query
    );
    
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

    $query .= " ORDER BY pedidos.id DESC LIMIT ? OFFSET ?";
    $params[] = $registros_por_pagina;
    $params[] = $offset;
    $types .= 'ii';

    $stmt = $conexion->prepare($query);
    if ($stmt) {
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $resultado = $stmt->get_result();

        $pedidos = [];
        while ($fila = $resultado->fetch_assoc()) {
            $fila['garrafa_10kg'] = isset($fila['garrafa_10kg']) ? (int)$fila['garrafa_10kg'] : 0;
            $fila['garrafa_15kg'] = isset($fila['garrafa_15kg']) ? (int)$fila['garrafa_15kg'] : 0;
            $fila['garrafa_45kg'] = isset($fila['garrafa_45kg']) ? (int)$fila['garrafa_45kg'] : 0;
            $fila['precio'] = isset($fila['precio']) ? (float)$fila['precio'] : 0;
            $fila['fecha_entrega_programada'] = isset($fila['fecha_entrega_programada']) ? $fila['fecha_entrega_programada'] : null;
            $fila['es_programado'] = isset($fila['es_programado']) ? (int)$fila['es_programado'] : 0;
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
    exit();
}

// ============ POST: Guardar cambios ============
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input && isset($_POST['update_all'])) {
        $input = ['update_all' => true, 'pedidos' => []];
        $pedidosData = [];
        foreach ($_POST as $key => $value) {
            if (preg_match('/pedidos\[(\d+)\]\[(.+)\]/', $key, $matches)) {
                $index = $matches[1];
                $field = $matches[2];
                if (!isset($pedidosData[$index])) {
                    $pedidosData[$index] = [];
                }
                $pedidosData[$index][$field] = $value;
            }
        }
        ksort($pedidosData);
        $input['pedidos'] = array_values($pedidosData);
    }
    
    if (!isset($input['update_all']) || !isset($input['pedidos'])) {
        echo json_encode(['error' => 'Datos inválidos', 'received' => $input]);
        exit();
    }
    
    $pedidosData = $input['pedidos'];
    $actualizados = 0;
    $errores = [];
    $mensajesWhatsapp = [];
    
    foreach ($pedidosData as $pedido) {
        if (!isset($pedido['id'])) {
            continue;
        }
        
        $id = (int)$pedido['id'];
        $tipo_pedido = isset($pedido['tipo_pedido']) ? $pedido['tipo_pedido'] : '';
        $garrafa_10kg = isset($pedido['garrafa_10kg']) ? (int)$pedido['garrafa_10kg'] : 0;
        $garrafa_15kg = isset($pedido['garrafa_15kg']) ? (int)$pedido['garrafa_15kg'] : 0;
        $garrafa_45kg = isset($pedido['garrafa_45kg']) ? (int)$pedido['garrafa_45kg'] : 0;
        $estado = isset($pedido['estado']) ? $pedido['estado'] : 'Pendiente';
        $precio = isset($pedido['precio']) ? (float)$pedido['precio'] : 0;
        $observacion_pedido = isset($pedido['observacion_pedido']) ? $pedido['observacion_pedido'] : '';
        $repartidor_id = isset($pedido['repartidor_id']) && !empty($pedido['repartidor_id']) ? (int)$pedido['repartidor_id'] : null;
        
        // ============ VALIDACIÓN DE FECHA PROGRAMADA ============
        $fecha_entrega_programada = isset($pedido['fecha_entrega_programada']) && !empty($pedido['fecha_entrega_programada']) 
            ? $pedido['fecha_entrega_programada'] 
            : null;
        $es_programado = isset($pedido['es_programado']) ? (int)$pedido['es_programado'] : 0;
        
        if ($es_programado == 1 && (empty($fecha_entrega_programada) || $fecha_entrega_programada == '0000-00-00')) {
            $fecha_entrega_programada = date('Y-m-d', strtotime('+1 day'));
        }
        
        if ($es_programado != 1) {
            $fecha_entrega_programada = null;
        }
        
        $tieneGarrafas = ($garrafa_10kg > 0 || $garrafa_15kg > 0 || $garrafa_45kg > 0);
        
        $queryInfo = "
            SELECT 
                c.nombre as cliente_nombre,
                c.direccion,
                c.barrio,
                c.telefono as cliente_telefono,
                c.observacion as cliente_observacion,
                r.nombre as repartidor_nombre,
                r.apellido as repartidor_apellido,
                r.telefono as repartidor_telefono
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            LEFT JOIN repartidores r ON p.repartidor_id = r.id
            WHERE p.id = ?
        ";
        
        $stmtInfo = $conexion->prepare($queryInfo);
        $infoPedido = null;
        if ($stmtInfo) {
            $stmtInfo->bind_param("i", $id);
            $stmtInfo->execute();
            $resultInfo = $stmtInfo->get_result();
            $infoPedido = $resultInfo->fetch_assoc();
            $stmtInfo->close();
        }
        
        $queryUpdate = "
            UPDATE pedidos 
            SET tipo_pedido = ?,
                estado = ?, 
                precio = ?, 
                observacion_pedido = ?, 
                repartidor_id = ?, 
                garrafa_10kg = ?, 
                garrafa_15kg = ?, 
                garrafa_45kg = ?,
                fecha_entrega_programada = ?,
                es_programado = ?
            WHERE id = ?
        ";
        
        $stmt = $conexion->prepare($queryUpdate);
        
        if ($stmt) {
            $stmt->bind_param("ssdsiiiiisi", 
                $tipo_pedido,
                $estado, 
                $precio, 
                $observacion_pedido, 
                $repartidor_id, 
                $garrafa_10kg, 
                $garrafa_15kg, 
                $garrafa_45kg,
                $fecha_entrega_programada,
                $es_programado,
                $id
            );
            
            if ($stmt->execute()) {
                $actualizados++;
                
                if ($tieneGarrafas && $infoPedido && !empty($infoPedido['repartidor_telefono'])) {
                    $detalleGarrafas = [];
                    if ($garrafa_10kg > 0) $detalleGarrafas[] = "10kg: $garrafa_10kg";
                    if ($garrafa_15kg > 0) $detalleGarrafas[] = "15kg: $garrafa_15kg";
                    if ($garrafa_45kg > 0) $detalleGarrafas[] = "45kg: $garrafa_45kg";
                    
                    $infoFecha = "";
                    if ($es_programado == 1 && $fecha_entrega_programada) {
                        $fechaFormateada = date('d/m/Y', strtotime($fecha_entrega_programada));
                        $infoFecha = "\n📅 *Entrega Programada:* $fechaFormateada";
                    }
                    
                    $mensajeWhatsApp = "*🛵 PEDIDO MODIFICADO* 🛵\n\n";
                    $mensajeWhatsApp .= "*👤 Cliente:* " . ($infoPedido['cliente_nombre'] ?? 'N/A') . "\n";
                    $mensajeWhatsApp .= "*📍 Dirección:* " . ($infoPedido['direccion'] ?? 'N/A') . "\n";
                    $mensajeWhatsApp .= "*🏘️ Barrio:* " . ($infoPedido['barrio'] ?? 'N/A') . "\n";
                    $mensajeWhatsApp .= "*📞 Teléfono:* " . ($infoPedido['cliente_telefono'] ?? 'N/A') . "\n";
                    $mensajeWhatsApp .= "*📦 Garrafas:* " . implode(', ', $detalleGarrafas) . "\n";
                    $mensajeWhatsApp .= "*💰 Precio:* $" . number_format($precio, 2) . "\n";
                    $mensajeWhatsApp .= "*📝 Observación Pedido:* " . ($observacion_pedido ?: 'Ninguna') . "\n";
                    $mensajeWhatsApp .= "*📋 Estado:* $estado\n";
                    $mensajeWhatsApp .= $infoFecha;
                    
                    if (!empty($infoPedido['cliente_observacion'])) {
                        $mensajeWhatsApp .= "\n*📌 Observación Cliente:* " . $infoPedido['cliente_observacion'];
                    }
                    
                    $mensajeWhatsApp .= "\n\n---\n📱 Enviado desde Sistema de Gestión";
                    
                    $telefonoRepartidor = preg_replace('/[^0-9]/', '', $infoPedido['repartidor_telefono']);
                    if (strlen($telefonoRepartidor) === 10) {
                        $telefonoRepartidor = '54' . $telefonoRepartidor;
                    }
                    
                    $urlWhatsApp = "https://wa.me/{$telefonoRepartidor}?text=" . urlencode($mensajeWhatsApp);
                    $mensajesWhatsapp[] = $urlWhatsApp;
                }
            } else {
                $errores[] = "Error en pedido ID $id: " . $stmt->error;
            }
            $stmt->close();
        } else {
            $errores[] = "Error preparando consulta para ID $id";
        }
    }
    
    $respuesta = [];
    
    if ($actualizados > 0) {
        $respuesta['mensaje'] = "Se actualizaron $actualizados pedido(s) correctamente";
        
        if (!empty($mensajesWhatsapp)) {
            $respuesta['mensajesWhatsapp'] = $mensajesWhatsapp;
            $respuesta['whatsapp_generado'] = true;
        } else {
            $respuesta['whatsapp_generado'] = false;
        }
    } else {
        $respuesta['mensaje'] = "No se realizaron cambios en los pedidos.";
    }
    
    if (!empty($errores)) {
        $respuesta['error'] = implode(", ", $errores);
    }
    
    echo json_encode($respuesta);
    exit();
}

$conexion->close();
?>