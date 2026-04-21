<?php
// Incluir conexión a la base de datos
include '../conexion.php';

// Incluir middleware de autenticación
require_once __DIR__ . '/../auth/middleware.php';

// Verificar autenticación (cualquier rol puede crear pedidos)
$user = requireAuth(['admin', 'usuario', 'repartidor']);

// Crear conexión a la base de datos
$conexion = conectarBD();

// Forzar que la respuesta sea JSON siempre
header('Content-Type: application/json');

// ============ SOLICITUDES AJAX (GET) ============

// 1. Buscar clientes (búsqueda completa por nombre, dirección, barrio o teléfono)
if (isset($_GET['buscar_cliente_total']) && isset($_GET['buscar_busqueda']) && !empty($_GET['buscar_busqueda'])) {
    $buscar_busqueda = trim($_GET['buscar_busqueda']);
    $buscar_busqueda_sin_guiones = str_replace('-', '', $buscar_busqueda);

    $query = "SELECT id, nombre, direccion, barrio, telefono, observacion 
              FROM clientes 
              WHERE nombre LIKE ? 
              OR direccion LIKE ? 
              OR barrio LIKE ? 
              OR REPLACE(telefono, '-', '') LIKE ?";
    
    $stmt = $conexion->prepare($query);
    $param = "%$buscar_busqueda%";
    $paramSinGuiones = "%$buscar_busqueda_sin_guiones%";
    $stmt->bind_param("ssss", $param, $param, $param, $paramSinGuiones);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $clientes = [];
    while ($row = $resultado->fetch_assoc()) {
        $clientes[] = $row;
    }

    echo json_encode($clientes);
    exit();
}

// 2. Obtener últimos 10 pedidos de un cliente
if (isset($_GET['obtener_pedidos']) && isset($_GET['cliente_id']) && !empty($_GET['cliente_id'])) {
    $cliente_id = intval($_GET['cliente_id']);

    $query = "SELECT p.id, p.tipo_pedido, p.observacion_pedido, p.estado, p.precio, p.fecha_creacion,
                     p.fecha_entrega_programada, p.es_programado,
                     c.nombre AS cliente_nombre, c.direccion, c.barrio, c.telefono, c.observacion AS observacion_cliente,
                     r.nombre AS repartidor_nombre, r.apellido AS repartidor_apellido
              FROM pedidos p
              LEFT JOIN clientes c ON p.cliente_id = c.id
              LEFT JOIN repartidores r ON p.repartidor_id = r.id
              WHERE p.cliente_id = ?
              ORDER BY p.fecha_creacion DESC
              LIMIT 10";

    $stmt = $conexion->prepare($query);
    $stmt->bind_param("i", $cliente_id);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $ultimos_pedidos = [];
    while ($row = $resultado->fetch_assoc()) {
        $ultimos_pedidos[] = $row;
    }

    echo json_encode($ultimos_pedidos);
    exit();
}

// 3. Buscar clientes por dirección
if (isset($_GET['buscar_cliente']) && isset($_GET['direccion_busqueda']) && !empty($_GET['direccion_busqueda'])) {
    $direccion_busqueda = trim($_GET['direccion_busqueda']);
    $telefono_limpio = str_replace('-', '', $direccion_busqueda);

    $query = "SELECT id, nombre, direccion, barrio, telefono, observacion 
              FROM clientes 
              WHERE direccion LIKE ? 
              OR REPLACE(telefono, '-', '') LIKE ?";
    
    $stmt = $conexion->prepare($query);
    $paramDireccion = "%$direccion_busqueda%";
    $paramTelefono = "%$telefono_limpio%";
    $stmt->bind_param("ss", $paramDireccion, $paramTelefono);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $clientes = [];
    while ($row = $resultado->fetch_assoc()) {
        $clientes[] = $row;
    }

    echo json_encode($clientes);
    exit();
}

// ============ PROCESAR FORMULARIO (POST) ============

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Capturar datos del formulario
    $direccion_cliente = trim($_POST['direccion_cliente'] ?? '');
    $barrio_cliente = trim($_POST['barrio_cliente'] ?? '');
    $nombre_cliente = ucwords(strtolower(trim($_POST['nombre_cliente'] ?? '')));
    $telefono_cliente = trim($_POST['telefono_cliente'] ?? '');
    $observacion_cliente = trim($_POST['observacion_cliente'] ?? '');    
    $observacion_pedido = trim($_POST['observacion_pedido'] ?? '');
    $estado = trim($_POST['estado'] ?? 'Pendiente');
    $precio = floatval($_POST['precio'] ?? 0);
    $repartidor_id = !empty($_POST['repartidor']) ? intval($_POST['repartidor']) : null;
    $garrafa_10kg = intval($_POST['garrafa_10kg'] ?? 0);
    $garrafa_15kg = intval($_POST['garrafa_15kg'] ?? 0);
    $garrafa_45kg = intval($_POST['garrafa_45kg'] ?? 0);
    $cliente_id_existente = !empty($_POST['cliente_id']) ? intval($_POST['cliente_id']) : null;
    
    // NUEVOS CAMPOS: Fecha programada
    $es_programado = isset($_POST['es_programado']) ? intval($_POST['es_programado']) : 0;
    $fecha_entrega_programada = null;
    
    // Si está programado, asignar fecha
    if ($es_programado == 1) {
        if (!empty($_POST['fecha_entrega_programada'])) {
            $fecha_entrega_programada = $_POST['fecha_entrega_programada'];
        } else {
            // Fecha por defecto: mañana
            $fecha_entrega_programada = date('Y-m-d', strtotime('+1 day'));
        }
    }

    // Validar que haya al menos una garrafa
    if ($garrafa_10kg == 0 && $garrafa_15kg == 0 && $garrafa_45kg == 0) {
        echo json_encode(['error' => 'Debes agregar al menos una garrafa.']);
        exit();
    }

    // Validar campos obligatorios
    if (empty($direccion_cliente) || empty($telefono_cliente) || $precio <= 0) {
        echo json_encode(['error' => 'Faltan datos obligatorios: dirección, teléfono o precio.']);
        exit();
    }

    // Buscar o crear cliente
    $cliente_id = null;
    
    // Si se proporcionó un ID de cliente existente
    if ($cliente_id_existente) {
        $query_check = "SELECT id FROM clientes WHERE id = ?";
        $stmt_check = $conexion->prepare($query_check);
        $stmt_check->bind_param("i", $cliente_id_existente);
        $stmt_check->execute();
        $result_check = $stmt_check->get_result();
        
        if ($result_check->num_rows > 0) {
            $cliente_id = $cliente_id_existente;
            
            // Actualizar datos del cliente
            $query_update = "UPDATE clientes SET nombre = ?, barrio = ?, telefono = ?, observacion = ? WHERE id = ?";
            $stmt_update = $conexion->prepare($query_update);
            $stmt_update->bind_param("ssssi", $nombre_cliente, $barrio_cliente, $telefono_cliente, $observacion_cliente, $cliente_id);
            $stmt_update->execute();
            $stmt_update->close();
        }
    }
    
    // Si no hay cliente seleccionado, buscar por dirección
    if (!$cliente_id) {
        $query_buscar = "SELECT id, nombre, direccion, barrio, telefono, observacion FROM clientes WHERE direccion = ?";
        $stmt_buscar = $conexion->prepare($query_buscar);
        $stmt_buscar->bind_param("s", $direccion_cliente);
        $stmt_buscar->execute();
        $resultado_buscar = $stmt_buscar->get_result();

        if ($resultado_buscar->num_rows > 0) {
            $row = $resultado_buscar->fetch_assoc();
            $cliente_id = $row['id'];

            if ($nombre_cliente != $row['nombre'] || $barrio_cliente != $row['barrio'] || $telefono_cliente != $row['telefono'] || $observacion_cliente != $row['observacion']) {
                $query_actualizar = "UPDATE clientes SET nombre = ?, barrio = ?, telefono = ?, observacion = ? WHERE id = ?";
                $stmt_actualizar = $conexion->prepare($query_actualizar);
                $stmt_actualizar->bind_param("ssssi", $nombre_cliente, $barrio_cliente, $telefono_cliente, $observacion_cliente, $cliente_id);
                $stmt_actualizar->execute();
                $stmt_actualizar->close();
            }
            $stmt_buscar->close();
        } else {
            $query_insertar = "INSERT INTO clientes (nombre, direccion, barrio, telefono, observacion) VALUES (?, ?, ?, ?, ?)";
            $stmt_insertar = $conexion->prepare($query_insertar);
            $stmt_insertar->bind_param("sssss", $nombre_cliente, $direccion_cliente, $barrio_cliente, $telefono_cliente, $observacion_cliente);

            if ($stmt_insertar->execute()) {
                $cliente_id = $stmt_insertar->insert_id;
            } else {
                echo json_encode(['error' => 'Error al crear el cliente: ' . $stmt_insertar->error]);
                exit();
            }
            $stmt_insertar->close();
        }
    }

    // Registrar el pedido
    $tipo_pedido = "";
    if ($garrafa_10kg > 0) $tipo_pedido .= "$garrafa_10kg x 10kg ";
    if ($garrafa_15kg > 0) $tipo_pedido .= "$garrafa_15kg x 15kg ";
    if ($garrafa_45kg > 0) $tipo_pedido .= "$garrafa_45kg x 45kg";
    $tipo_pedido = trim($tipo_pedido);
    
    // INSERT con fecha programada
    $query_insertar_pedido = "INSERT INTO pedidos 
        (cliente_id, tipo_pedido, observacion_pedido, estado, repartidor_id, precio, 
         garrafa_10kg, garrafa_15kg, garrafa_45kg, es_programado, fecha_entrega_programada) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt_insertar_pedido = $conexion->prepare($query_insertar_pedido);
    $stmt_insertar_pedido->bind_param(
        "isssdiiiiis",
        $cliente_id,
        $tipo_pedido,
        $observacion_pedido,
        $estado,
        $repartidor_id,
        $precio,
        $garrafa_10kg,
        $garrafa_15kg,
        $garrafa_45kg,
        $es_programado,
        $fecha_entrega_programada
    );

    if ($stmt_insertar_pedido->execute()) {
        $whatsapp_url = null;
        
        // Agregar información de fecha programada al mensaje de WhatsApp
        $info_fecha = "";
        if ($es_programado == 1 && $fecha_entrega_programada) {
            $fecha_formateada = date('d/m/Y', strtotime($fecha_entrega_programada));
            $info_fecha = "\n📅 *Entrega Programada:* $fecha_formateada";
        }
        
        // Generar WhatsApp si hay repartidor
        if ($repartidor_id) {
            $query_repartidor = "SELECT telefono FROM repartidores WHERE id = ?";
            $stmt_repartidor = $conexion->prepare($query_repartidor);
            $stmt_repartidor->bind_param("i", $repartidor_id);
            $stmt_repartidor->execute();
            $resultado_repartidor = $stmt_repartidor->get_result();

            if ($resultado_repartidor->num_rows > 0) {
                $repartidor = $resultado_repartidor->fetch_assoc();
                $telefono_repartidor = $repartidor['telefono'];

                if (!empty($telefono_repartidor)) {
                    $mensaje_whatsapp = "Tienes un nuevo pedido:\n\n";
                    $mensaje_whatsapp .= "Garrafas: $tipo_pedido\n";
                    $mensaje_whatsapp .= "Dirección: $direccion_cliente\n";
                    $mensaje_whatsapp .= "Barrio: $barrio_cliente\n";
                    $mensaje_whatsapp .= "Cliente: $nombre_cliente\n";
                    $mensaje_whatsapp .= "Teléfono: $telefono_cliente\n";
                    $mensaje_whatsapp .= "Observacione Cliente: $observacion_cliente\n";
                    $mensaje_whatsapp .= "Observacione Pedido: $observacion_pedido\n";
                    $mensaje_whatsapp .= "Estado: $estado\n";
                    $mensaje_whatsapp .= "Precio: $" . number_format($precio, 2);
                    $mensaje_whatsapp .= $info_fecha;

                    $mensaje_whatsapp_codificado = urlencode($mensaje_whatsapp);
                    $whatsapp_url = "https://api.whatsapp.com/send?phone=$telefono_repartidor&text=$mensaje_whatsapp_codificado";
                }
            }
            $stmt_repartidor->close();
        }
        
        // Devolver JSON con éxito y URL de WhatsApp
        echo json_encode([
            'success' => true, 
            'whatsapp_url' => $whatsapp_url,
            'message' => 'Pedido registrado exitosamente'
        ]);
        exit();
    } else {
        echo json_encode(['error' => 'Error al guardar el pedido: ' . $stmt_insertar_pedido->error]);
        exit();
    }
    
    $stmt_insertar_pedido->close();
}

// Si no es POST ni GET conocido
echo json_encode(['error' => 'Método no permitido']);
exit();
?>