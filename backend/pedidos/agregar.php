<?php
// Incluir conexión a la base de datos
include '../conexion.php';

// Crear conexión a la base de datos
$conexion = conectarBD();

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

    header("Content-Type: application/json");
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

    header("Content-Type: application/json");
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

    header("Content-Type: application/json");
    echo json_encode($clientes);
    exit();
}

// ============ PROCESAR FORMULARIO (POST) ============

$mensaje = "";
$tipo_mensaje = "";

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
    $fecha_entrega_programada = !empty($_POST['fecha_entrega_programada']) ? $_POST['fecha_entrega_programada'] : null;
    $es_programado = isset($_POST['es_programado']) ? intval($_POST['es_programado']) : 0;

    // Validar que haya al menos una garrafa
    if ($garrafa_10kg == 0 && $garrafa_15kg == 0 && $garrafa_45kg == 0) {
        echo "<h3>Debes agregar al menos una garrafa.</h3>";
        exit();
    }

    // Validar campos obligatorios
    if (empty($direccion_cliente) || empty($telefono_cliente) || $precio < 0) {
        header("Location: agregar.php?error=FaltanDatos");
        exit();
    }
    
    // Validar fecha programada
    if ($es_programado && empty($fecha_entrega_programada)) {
        header("Location: agregar.php?error=FechaNoSeleccionada");
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
            
            $mensaje = "Cliente actualizado y pedido registrado exitosamente.";
            $tipo_mensaje = "success";
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
                $mensaje = "Datos del cliente actualizados y pedido registrado exitosamente.";
            } else {
                $mensaje = "El cliente ya existía y se utilizó para registrar el pedido.";
            }
            $tipo_mensaje = "success";
            $stmt_buscar->close();
        } else {
            $query_insertar = "INSERT INTO clientes (nombre, direccion, barrio, telefono, observacion) VALUES (?, ?, ?, ?, ?)";
            $stmt_insertar = $conexion->prepare($query_insertar);
            $stmt_insertar->bind_param("sssss", $nombre_cliente, $direccion_cliente, $barrio_cliente, $telefono_cliente, $observacion_cliente);

            if ($stmt_insertar->execute()) {
                $cliente_id = $stmt_insertar->insert_id;
                $mensaje = "Cliente nuevo creado y pedido registrado exitosamente.";
                $tipo_mensaje = "success";
            } else {
                header("Location: agregar.php?error=ClienteNoCreado");
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
    
    // NUEVA QUERY con fecha programada
    $query_insertar_pedido = "INSERT INTO pedidos 
        (cliente_id, tipo_pedido, observacion_pedido, estado, repartidor_id, precio, 
         garrafa_10kg, garrafa_15kg, garrafa_45kg, fecha_entrega_programada, es_programado) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt_insertar_pedido = $conexion->prepare($query_insertar_pedido);
    $stmt_insertar_pedido->bind_param(
        "isssdiiiisi",
        $cliente_id,
        $tipo_pedido,
        $observacion_pedido,
        $estado,
        $repartidor_id,
        $precio,
        $garrafa_10kg,
        $garrafa_15kg,
        $garrafa_45kg,
        $fecha_entrega_programada,
        $es_programado
    );

    if ($stmt_insertar_pedido->execute()) {
        // Agregar información de fecha programada al mensaje de WhatsApp
        $info_fecha = "";
        if ($es_programado && $fecha_entrega_programada) {
            $fecha_formateada = date('d/m/Y', strtotime($fecha_entrega_programada));
            $info_fecha = "\n📅 *Entrega Programada:* $fecha_formateada";
        }
        
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
                    $mensaje_whatsapp .= "Observaciones: $observacion_pedido\n";
                    $mensaje_whatsapp .= "Estado: $estado\n";
                    $mensaje_whatsapp .= "Precio: $" . number_format($precio, 2);
                    $mensaje_whatsapp .= $info_fecha;

                    $mensaje_whatsapp_codificado = urlencode($mensaje_whatsapp);
                    $whatsapp_url = "https://api.whatsapp.com/send?phone=$telefono_repartidor&text=$mensaje_whatsapp_codificado";

                    echo "<script>
                        alert('¡$mensaje!');
                        if (confirm('¿Quieres enviar los detalles del pedido al repartidor por WhatsApp?')) {
                            window.location.href = '$whatsapp_url';
                        } else {
                            window.location.href = 'agregar.php';
                        }
                    </script>";
                    exit();
                }
            }
            $stmt_repartidor->close();
        }
        
        header("Location: agregar.php?success=1&mensaje=" . urlencode($mensaje));
        exit();
    } else {
        header("Location: agregar.php?error=PedidoNoCreado");
        exit();
    }
    
    $stmt_insertar_pedido->close();
}

// Si no hay redirección, mostrar mensaje de éxito o error
if (isset($_GET['success'])) {
    echo "<script>alert('" . htmlspecialchars($_GET['mensaje'] ?? 'Pedido registrado exitosamente') . "'); window.location.href = 'agregar.php';</script>";
    exit();
} elseif (isset($_GET['error'])) {
    $error_msg = $_GET['error'];
    if ($error_msg == 'FechaNoSeleccionada') {
        echo "<script>alert('Error: Selecciona una fecha para la entrega programada'); window.location.href = 'agregar.php';</script>";
    } else {
        echo "<script>alert('Error al procesar el pedido'); window.location.href = 'agregar.php';</script>";
    }
    exit();
}

// Si no es POST ni ninguna de las solicitudes AJAX, mostrar el formulario HTML
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agregar Pedido</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
        h1 { text-align: center; color: #4b0082; margin-bottom: 30px; }
        fieldset { border: 2px solid #e0d4f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; background: white; }
        legend { font-weight: bold; padding: 0 15px; color: #4b0082; font-size: 1.1em; }
        .form-group { margin-bottom: 15px; }
        .form-row { display: flex; gap: 15px; margin-bottom: 15px; }
        .form-row .form-group { flex: 1; }
        label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; }
        input, select, textarea { width: 100%; padding: 10px 12px; border: 1px solid #ced4da; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
        .garrafas-container { display: flex; gap: 20px; justify-content: center; margin-bottom: 25px; flex-wrap: wrap; }
        .garrafa-card { background: linear-gradient(135deg, #f5f0ff 0%, #e8ddf5 100%); border-radius: 16px; padding: 15px; text-align: center; min-width: 120px; flex: 1; max-width: 150px; }
        .garrafa-icon { font-size: 32px; margin-bottom: 8px; }
        .garrafa-label { font-weight: bold; color: #4b0082; margin-bottom: 10px; }
        .control-cantidad { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .control-cantidad input { width: 60px; text-align: center; font-size: 16px; font-weight: bold; padding: 8px; }
        .btn-cantidad { width: 32px; height: 32px; background-color: #6a4c9c; color: white; border: none; border-radius: 50%; cursor: pointer; font-size: 18px; }
        .btn-cantidad:hover { background-color: #5b3c80; }
        .sugerencias { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ddd; border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .sugerencia { padding: 12px; cursor: pointer; border-bottom: 1px solid #eee; }
        .sugerencia:hover { background-color: #f5f0ff; }
        .campo-busqueda-cliente { position: relative; margin-bottom: 25px; padding: 15px; background-color: #f8f9fa; border-radius: 12px; border: 1px solid #e0d4f0; }
        .input-busqueda { width: 100%; padding: 12px; border: 1px solid #ced4da; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
        .three-columns { display: flex; gap: 25px; margin-bottom: 25px; align-items: flex-start; }
        .columna-cliente { flex: 2; }
        .columna-pedido { flex: 2; }
        .columna-botones { flex: 1; min-width: 180px; }
        .botones-vertical { display: flex; flex-direction: column; gap: 15px; margin-top: 30px; }
        .btn-guardar-vertical, .btn-limpiar-vertical, .btn-volver-vertical { width: 100%; padding: 12px 20px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; text-align: center; text-decoration: none; display: block; }
        .btn-guardar-vertical { background-color: #4CAF50; color: white; }
        .btn-guardar-vertical:hover { background-color: #45a049; }
        .btn-limpiar-vertical { background-color: #6c757d; color: white; }
        .btn-limpiar-vertical:hover { background-color: #5a6268; }
        .btn-volver-vertical { background-color: #6c757d; color: white; }
        .btn-volver-vertical:hover { background-color: #5a6268; }
        
        .fecha-programada-container {
            background-color: #FFF3E0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            border: 1px solid #FFB74D;
        }
        .fecha-programada-label {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            cursor: pointer;
        }
        .fecha-programada-label input {
            width: auto;
        }
        .info-fecha {
            background-color: #E8F5E9;
            padding: 8px;
            border-radius: 4px;
            margin-top: 8px;
            font-size: 14px;
        }
        
        @media (max-width: 900px) { .three-columns { flex-direction: column; } .columna-botones { width: 100%; } .botones-vertical { flex-direction: row; margin-top: 0; } .btn-guardar-vertical, .btn-limpiar-vertical, .btn-volver-vertical { flex: 1; } }
        @media (max-width: 768px) { .form-row { flex-direction: column; gap: 10px; } .garrafas-container { flex-direction: row; flex-wrap: wrap; } }
    </style>
</head>
<body>
<h1>Agregar Pedido</h1>

<form method="POST" class="formulario-pedido">
    <input type="hidden" name="cliente_id" id="cliente_id">
    
    <div class="campo-busqueda-cliente">
        <label>🔍 Buscar Cliente Existente (nombre, dirección, barrio o teléfono):</label>
        <input type="text" id="buscar_cliente_total" class="input-busqueda" autocomplete="off">
        <div id="sugerencias_total" class="sugerencias" style="display:none;"></div>
    </div>

    <div class="three-columns">
        <div class="columna-cliente">
            <fieldset>
                <legend>👤 Datos del Cliente</legend>
                <div class="form-group">
                    <label>Nombre del Cliente:</label>
                    <input type="text" name="nombre_cliente" id="nombre_cliente">
                </div>
                <div class="form-group" style="position: relative;">
                    <label>Dirección del Cliente:</label>
                    <input type="text" name="direccion_cliente" id="direccion_cliente" autocomplete="off" required>
                    <div id="sugerencias_direccion" class="sugerencias" style="display:none;"></div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Barrio:</label>
                        <input type="text" name="barrio_cliente" id="barrio_cliente">
                    </div>
                    <div class="form-group">
                        <label>Teléfono:</label>
                        <input type="text" name="telefono_cliente" id="telefono_cliente" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Observaciones:</label>
                    <textarea name="observacion_cliente" id="observacion_cliente" rows="3"></textarea>
                </div>
            </fieldset>
        </div>

        <div class="columna-pedido">
            <fieldset>
                <legend>📦 Datos del Pedido</legend>
                <div class="garrafas-container">
                    <div class="garrafa-card">
                        <div class="garrafa-icon">🛢️</div>
                        <div class="garrafa-label">10 kg</div>
                        <div class="control-cantidad">
                            <button type="button" class="btn-cantidad" onclick="cambiarCantidad('garrafa_10kg', -1)">−</button>
                            <input type="number" name="garrafa_10kg" id="garrafa_10kg" value="0" min="0">
                            <button type="button" class="btn-cantidad" onclick="cambiarCantidad('garrafa_10kg', 1)">+</button>
                        </div>
                    </div>
                    <div class="garrafa-card">
                        <div class="garrafa-icon">🛢️</div>
                        <div class="garrafa-label">15 kg</div>
                        <div class="control-cantidad">
                            <button type="button" class="btn-cantidad" onclick="cambiarCantidad('garrafa_15kg', -1)">−</button>
                            <input type="number" name="garrafa_15kg" id="garrafa_15kg" value="0" min="0">
                            <button type="button" class="btn-cantidad" onclick="cambiarCantidad('garrafa_15kg', 1)">+</button>
                        </div>
                    </div>
                    <div class="garrafa-card">
                        <div class="garrafa-icon">🛢️</div>
                        <div class="garrafa-label">45 kg</div>
                        <div class="control-cantidad">
                            <button type="button" class="btn-cantidad" onclick="cambiarCantidad('garrafa_45kg', -1)">−</button>
                            <input type="number" name="garrafa_45kg" id="garrafa_45kg" value="0" min="0">
                            <button type="button" class="btn-cantidad" onclick="cambiarCantidad('garrafa_45kg', 1)">+</button>
                        </div>
                    </div>
                </div>
                
                <!-- Selector de fecha programada -->
                <div class="fecha-programada-container">
                    <label class="fecha-programada-label">
                        <input type="checkbox" name="es_programado" id="checkbox_programado" value="1" onchange="toggleFechaProgramada(this.checked)">
                        📅 Programar para fecha específica
                    </label>
                    <div id="fecha_programada_div" style="display: none;">
                        <div class="form-group">
                            <label>📆 Seleccionar fecha de entrega:</label>
                            <input type="date" name="fecha_entrega_programada" id="fecha_entrega_programada" min="<?php echo date('Y-m-d'); ?>">
                        </div>
                        <div id="info_fecha" class="info-fecha" style="display: none;"></div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Observaciones del Pedido:</label>
                    <textarea name="observacion_pedido" id="observacion_pedido" rows="2"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Estado:</label>
                        <select name="estado" id="estado" required>
                            <option value="Pendiente">⏳ Pendiente</option>
                            <option value="En Proceso">🔄 En Proceso</option>
                            <option value="Entregado">✅ Entregado</option>
                            <option value="Cancelado">❌ Cancelado</option>
                            <option value="Finalizado">🏁 Finalizado</option>
                            <option value="Cuenta">💰 Cuenta</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Precio:</label>
                        <input type="number" step="0.01" name="precio" id="precio" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Repartidor:</label>
                    <select name="repartidor" id="repartidor">
                        <option value="">(Sin asignar)</option>
                        <?php
                        $query_repartidores = "SELECT id, nombre, apellido FROM repartidores ORDER BY nombre";
                        $result_repartidores = $conexion->query($query_repartidores);
                        while ($row = $result_repartidores->fetch_assoc()) {
                            echo "<option value='{$row['id']}'>{$row['nombre']} {$row['apellido']}</option>";
                        }
                        ?>
                    </select>
                </div>
            </fieldset>
        </div>

        <div class="columna-botones">
            <div class="botones-vertical">
                <button type="submit" class="btn-guardar-vertical">💾 Guardar Pedido</button>
                <button type="button" class="btn-limpiar-vertical" onclick="limpiarFormulario()">🧹 Limpiar</button>
                <a href="../pedidos/index.php" class="btn-volver-vertical">← Volver</a>
            </div>
        </div>
    </div>
</form>

<script>
function cambiarCantidad(id, cambio) {
    let campo = document.getElementById(id);
    let valor = parseInt(campo.value) || 0;
    valor = Math.max(0, valor + cambio);
    campo.value = valor;
}

function toggleFechaProgramada(checked) {
    const divFecha = document.getElementById('fecha_programada_div');
    const fechaInput = document.getElementById('fecha_entrega_programada');
    
    if (checked) {
        divFecha.style.display = 'block';
        fechaInput.required = true;
        
        if (!fechaInput.value) {
            const manana = new Date();
            manana.setDate(manana.getDate() + 1);
            fechaInput.value = manana.toISOString().split('T')[0];
            actualizarInfoFecha();
        }
    } else {
        divFecha.style.display = 'none';
        fechaInput.required = false;
        fechaInput.value = '';
        document.getElementById('info_fecha').style.display = 'none';
    }
}

function actualizarInfoFecha() {
    const fechaInput = document.getElementById('fecha_entrega_programada');
    const infoDiv = document.getElementById('info_fecha');
    
    if (fechaInput.value) {
        const fecha = new Date(fechaInput.value);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const diffTime = fecha.getTime() - hoy.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let mensaje = '';
        if (diffDays === 0) mensaje = '🎯 Entrega programada para HOY';
        else if (diffDays === 1) mensaje = '⏰ Entrega programada para MAÑANA';
        else if (diffDays > 1) mensaje = `📅 Entrega programada en ${diffDays} días`;
        else mensaje = '⚠️ Fecha pasada';
        
        infoDiv.innerHTML = `<strong>${mensaje}</strong><br>Fecha: ${fecha.toLocaleDateString('es-AR')}`;
        infoDiv.style.display = 'block';
    } else {
        infoDiv.style.display = 'none';
    }
}

document.getElementById('fecha_entrega_programada')?.addEventListener('change', actualizarInfoFecha);

function limpiarFormulario() {
    document.getElementById('nombre_cliente').value = '';
    document.getElementById('direccion_cliente').value = '';
    document.getElementById('barrio_cliente').value = '';
    document.getElementById('telefono_cliente').value = '';
    document.getElementById('observacion_cliente').value = '';
    document.getElementById('observacion_pedido').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('repartidor').value = '';
    document.getElementById('garrafa_10kg').value = 0;
    document.getElementById('garrafa_15kg').value = 0;
    document.getElementById('garrafa_45kg').value = 0;
    document.getElementById('estado').value = 'Pendiente';
    document.getElementById('cliente_id').value = '';
    document.getElementById('sugerencias_total').style.display = 'none';
    document.getElementById('sugerencias_direccion').style.display = 'none';
    
    document.getElementById('checkbox_programado').checked = false;
    toggleFechaProgramada(false);
}

// Búsqueda general de clientes
const inputBuscar = document.getElementById('buscar_cliente_total');
const sugerenciasDiv = document.getElementById('sugerencias_total');

inputBuscar.addEventListener('input', function() {
    const valor = this.value.trim();
    if (valor.length > 2) {
        fetch(`agregar.php?buscar_cliente_total=1&buscar_busqueda=${encodeURIComponent(valor)}`)
            .then(response => response.json())
            .then(data => {
                sugerenciasDiv.innerHTML = '';
                if (data.length > 0) {
                    sugerenciasDiv.style.display = 'block';
                    data.forEach(cliente => {
                        const div = document.createElement('div');
                        div.className = 'sugerencia';
                        div.innerHTML = `<strong>${cliente.nombre}</strong><br><small>${cliente.direccion} - ${cliente.barrio} | Tel: ${cliente.telefono}</small>`;
                        div.onclick = () => {
                            document.getElementById('nombre_cliente').value = cliente.nombre;
                            document.getElementById('direccion_cliente').value = cliente.direccion;
                            document.getElementById('barrio_cliente').value = cliente.barrio;
                            document.getElementById('telefono_cliente').value = cliente.telefono;
                            document.getElementById('observacion_cliente').value = cliente.observacion || '';
                            document.getElementById('cliente_id').value = cliente.id;
                            sugerenciasDiv.style.display = 'none';
                            inputBuscar.value = '';
                        };
                        sugerenciasDiv.appendChild(div);
                    });
                } else {
                    sugerenciasDiv.style.display = 'none';
                }
            });
    } else {
        sugerenciasDiv.style.display = 'none';
    }
});

// Búsqueda por dirección
const inputDireccion = document.getElementById('direccion_cliente');
const sugerenciasDireccion = document.getElementById('sugerencias_direccion');

inputDireccion.addEventListener('input', function() {
    const valor = this.value.trim();
    if (valor.length > 2) {
        fetch(`agregar.php?buscar_cliente=1&direccion_busqueda=${encodeURIComponent(valor)}`)
            .then(response => response.json())
            .then(data => {
                sugerenciasDireccion.innerHTML = '';
                if (data.length > 0) {
                    sugerenciasDireccion.style.display = 'block';
                    data.forEach(cliente => {
                        const div = document.createElement('div');
                        div.className = 'sugerencia';
                        div.innerHTML = `<strong>${cliente.direccion}</strong><br><small>${cliente.barrio} - ${cliente.nombre} | Tel: ${cliente.telefono}</small>`;
                        div.onclick = () => {
                            document.getElementById('nombre_cliente').value = cliente.nombre;
                            document.getElementById('direccion_cliente').value = cliente.direccion;
                            document.getElementById('barrio_cliente').value = cliente.barrio;
                            document.getElementById('telefono_cliente').value = cliente.telefono;
                            document.getElementById('observacion_cliente').value = cliente.observacion || '';
                            document.getElementById('cliente_id').value = cliente.id;
                            sugerenciasDireccion.style.display = 'none';
                        };
                        sugerenciasDireccion.appendChild(div);
                    });
                } else {
                    sugerenciasDireccion.style.display = 'none';
                }
            });
    } else {
        sugerenciasDireccion.style.display = 'none';
    }
});

document.addEventListener('click', function(e) {
    if (!inputBuscar.contains(e.target) && !sugerenciasDiv.contains(e.target)) {
        sugerenciasDiv.style.display = 'none';
    }
    if (!inputDireccion.contains(e.target) && !sugerenciasDireccion.contains(e.target)) {
        sugerenciasDireccion.style.display = 'none';
    }
});
</script>
</body>
</html>