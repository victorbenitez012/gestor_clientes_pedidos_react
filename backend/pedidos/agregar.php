<?php
// Incluir conexión a la base de datos
include '../conexion.php';

// Crear conexión a la base de datos
$conexion = conectarBD();

// ============ SOLICITUDES AJAX (GET) ============

// 1. Buscar clientes (búsqueda completa por nombre, dirección, barrio o teléfono)
if (isset($_GET['buscar_cliente_total']) && isset($_GET['buscar_busqueda']) && !empty($_GET['buscar_busqueda'])) {
    $buscar_busqueda = trim($_GET['buscar_busqueda']);

    $query_buscar_cliente_total = "SELECT id, nombre, direccion, barrio, telefono, observacion FROM clientes WHERE nombre LIKE ? OR direccion LIKE ? OR barrio LIKE ? OR telefono LIKE ?";
    $stmt_buscar = $conexion->prepare($query_buscar_cliente_total);
    $param = "%$buscar_busqueda%";
    $stmt_buscar->bind_param("ssss", $param, $param, $param, $param);
    $stmt_buscar->execute();
    $resultado = $stmt_buscar->get_result();

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

    $query_ultimos_pedidos = "SELECT p.id, p.tipo_pedido, p.observacion_pedido, p.estado, p.precio, p.fecha_creacion, 
                                     c.nombre AS cliente_nombre, c.direccion, c.barrio, c.telefono, c.observacion AS observacion_cliente,
                                     r.nombre AS repartidor_nombre, r.apellido AS repartidor_apellido
                              FROM pedidos p
                              LEFT JOIN clientes c ON p.cliente_id = c.id
                              LEFT JOIN repartidores r ON p.repartidor_id = r.id
                              WHERE p.cliente_id = ?
                              ORDER BY p.fecha_creacion DESC
                              LIMIT 10";

    $stmt_ultimos_pedidos = $conexion->prepare($query_ultimos_pedidos);
    $stmt_ultimos_pedidos->bind_param("i", $cliente_id);
    $stmt_ultimos_pedidos->execute();
    $resultado_ultimos_pedidos = $stmt_ultimos_pedidos->get_result();

    $ultimos_pedidos = [];
    while ($row = $resultado_ultimos_pedidos->fetch_assoc()) {
        $ultimos_pedidos[] = $row;
    }

    header("Content-Type: application/json");
    echo json_encode($ultimos_pedidos);
    exit();
}

// 3. Buscar clientes por dirección (para sugerencias en tiempo real)
if (isset($_GET['buscar_cliente']) && isset($_GET['direccion_busqueda']) && !empty($_GET['direccion_busqueda'])) {
    $direccion_busqueda = trim($_GET['direccion_busqueda']);

    $query_buscar_cliente = "SELECT id, nombre, direccion, barrio, telefono, observacion FROM clientes WHERE direccion LIKE ?";
    $stmt_buscar = $conexion->prepare($query_buscar_cliente);
    $direccion_parametro = "%$direccion_busqueda%";
    $stmt_buscar->bind_param("s", $direccion_parametro);
    $stmt_buscar->execute();
    $resultado_buscar = $stmt_buscar->get_result();

    $clientes = [];
    while ($row = $resultado_buscar->fetch_assoc()) {
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
            // Cliente existe, obtener su ID
            $row = $resultado_buscar->fetch_assoc();
            $cliente_id = $row['id'];

            // Verificar si los datos del cliente han cambiado
            if ($nombre_cliente != $row['nombre'] || $barrio_cliente != $row['barrio'] || $telefono_cliente != $row['telefono'] || $observacion_cliente != $row['observacion']) {
                // Actualizar los datos del cliente
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
            // Crear nuevo cliente
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
    $tipo_pedido = "$garrafa_10kg x 10kg, $garrafa_15kg x 15kg, $garrafa_45kg x 45kg";
    
    $query_insertar_pedido = "INSERT INTO pedidos 
        (cliente_id, tipo_pedido, observacion_pedido, estado, repartidor_id, precio, garrafa_10kg, garrafa_15kg, garrafa_45kg) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt_insertar_pedido = $conexion->prepare($query_insertar_pedido);
    $stmt_insertar_pedido->bind_param(
        "isssdiiii",
        $cliente_id,
        $tipo_pedido,
        $observacion_pedido,
        $estado,
        $repartidor_id,
        $precio,
        $garrafa_10kg,
        $garrafa_15kg,
        $garrafa_45kg
    );

    if ($stmt_insertar_pedido->execute()) {
        // Si hay un ID de repartidor, generar el mensaje de WhatsApp
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
                    // Formatear mensaje para enviar por WhatsApp
                    $mensaje_whatsapp = "Tienes un nuevo pedido:\n\n";
                    $mensaje_whatsapp .= "Garrafas: $garrafa_10kg x 10kg, $garrafa_15kg x 15kg, $garrafa_45kg x 45kg\n";
                    $mensaje_whatsapp .= "Dirección: $direccion_cliente\n";
                    $mensaje_whatsapp .= "Barrio: $barrio_cliente\n";
                    $mensaje_whatsapp .= "Cliente: $nombre_cliente\n";
                    $mensaje_whatsapp .= "Teléfono: $telefono_cliente\n";
                    $mensaje_whatsapp .= "Observaciones: $observacion_pedido\n";
                    $mensaje_whatsapp .= "Estado: $estado\n";
                    $mensaje_whatsapp .= "Precio: $" . number_format($precio, 2);

                    $mensaje_whatsapp_codificado = urlencode($mensaje_whatsapp);
                    $whatsapp_url = "https://api.whatsapp.com/send?phone=$telefono_repartidor&text=$mensaje_whatsapp_codificado";

                    // Mostrar mensaje y confirmación
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
        
        // Si no hay WhatsApp, redirigir con mensaje
        header("Location: agregar.php?success=1&mensaje=" . urlencode($mensaje));
        exit();
    } else {
        header("Location: agregar.php?error=PedidoNoCreado");
        exit();
    }
    
    $stmt_insertar_pedido->close();
}

// Si no es POST ni ninguna de las solicitudes AJAX, mostrar el formulario HTML
// (Este código solo se ejecuta cuando se accede directamente a la página sin parámetros)
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agregar Pedido</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        fieldset { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        legend { font-weight: bold; padding: 0 10px; }
        label { display: block; margin-top: 10px; margin-bottom: 5px; font-weight: bold; }
        input, select, textarea { width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ced4da; border-radius: 4px; box-sizing: border-box; }
        .garrafas { display: flex; gap: 20px; margin-bottom: 15px; flex-wrap: wrap; }
        .garrafa-item { flex: 1; text-align: center; }
        .control-cantidad { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 5px; }
        .control-cantidad button { width: 30px; height: 30px; background-color: #6a4c9c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 18px; }
        .control-cantidad input { width: 60px; text-align: center; margin: 0; }
        button[type="submit"] { background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-limpiar { background-color: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; }
        .sugerencias { border: 1px solid #ccc; max-height: 150px; overflow-y: auto; background-color: #fff; position: absolute; width: 300px; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .sugerencia { padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; }
        .sugerencia:hover { background-color: #f0f0f0; }
        .success { color: green; padding: 10px; background-color: #f0fff0; border: 1px solid #c3e6cb; border-radius: 4px; margin-bottom: 15px; }
        .error { color: red; padding: 10px; background-color: #fff0f0; border: 1px solid #f5c6cb; border-radius: 4px; margin-bottom: 15px; }
        .menu { list-style: none; padding: 0; margin-top: 20px; }
        .menu li { display: inline-block; }
        .menu a { padding: 10px 20px; background-color: #6c757d; color: white; text-decoration: none; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
<h1>Agregar Pedido</h1>

<?php if (isset($_GET['success'])): ?>
    <div class="success"><?php echo htmlspecialchars($_GET['mensaje'] ?? 'Pedido registrado exitosamente'); ?></div>
<?php elseif (isset($_GET['error'])): ?>
    <div class="error">Error al procesar el pedido</div>
<?php endif; ?>

<form action="agregar.php" method="POST" id="formularioPedido">
    <input type="hidden" name="cliente_id" id="cliente_id">
    
    <!-- Buscar Cliente -->
    <fieldset>
        <legend>Buscar Cliente Existente</legend>
        <label>Buscar Cliente (nombre, dirección, barrio o teléfono):</label>
        <input type="text" id="direccion_cliente_total" autocomplete="off">
        <div id="sugerencias_total" class="sugerencias" style="display:none;"></div>
    </fieldset>
    
    <!-- Datos del Cliente -->
    <fieldset>
        <legend>Datos del Cliente</legend>
        
        <label>Nombre del Cliente:</label>
        <input type="text" name="nombre_cliente" id="nombre_cliente">
        
        <label>Dirección del Cliente:</label>
        <input type="text" name="direccion_cliente" id="direccion_cliente" autocomplete="off" required>
        <div id="sugerencias" class="sugerencias" style="display:none;"></div>
        
        <label>Barrio:</label>
        <input type="text" name="barrio_cliente" id="barrio_cliente">
        
        <label>Teléfono del Cliente:</label>
        <input type="text" name="telefono_cliente" id="telefono_cliente" required>
        
        <label>Observaciones del Cliente:</label>
        <textarea name="observacion_cliente" id="observacion_cliente" rows="2"></textarea>
    </fieldset>
    
    <!-- Datos del Pedido -->
    <fieldset>
        <legend>Datos del Pedido</legend>
        
        <div class="garrafas">
            <div class="garrafa-item">
                <label>10kg</label>
                <div class="control-cantidad">
                    <button type="button" onclick="cambiarCantidad('garrafa_10kg', -1)">−</button>
                    <input type="number" name="garrafa_10kg" id="garrafa_10kg" value="0" min="0">
                    <button type="button" onclick="cambiarCantidad('garrafa_10kg', 1)">+</button>
                </div>
            </div>
            <div class="garrafa-item">
                <label>15kg</label>
                <div class="control-cantidad">
                    <button type="button" onclick="cambiarCantidad('garrafa_15kg', -1)">−</button>
                    <input type="number" name="garrafa_15kg" id="garrafa_15kg" value="0" min="0">
                    <button type="button" onclick="cambiarCantidad('garrafa_15kg', 1)">+</button>
                </div>
            </div>
            <div class="garrafa-item">
                <label>45kg</label>
                <div class="control-cantidad">
                    <button type="button" onclick="cambiarCantidad('garrafa_45kg', -1)">−</button>
                    <input type="number" name="garrafa_45kg" id="garrafa_45kg" value="0" min="0">
                    <button type="button" onclick="cambiarCantidad('garrafa_45kg', 1)">+</button>
                </div>
            </div>
        </div>
        
        <label>Observaciones del Pedido:</label>
        <textarea name="observacion_pedido" id="observacion_pedido" rows="2"></textarea>
        
        <label>Estado:</label>
        <select name="estado" id="estado" required>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Entregado">Entregado</option>
            <option value="Cancelado">Cancelado</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Cuenta">Cuenta</option>
        </select>
        
        <label>Precio:</label>
        <input type="number" step="0.01" name="precio" id="precio" required>
        
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
    </fieldset>
    
    <div>
        <button type="submit">Guardar Pedido</button>
        <button type="button" onclick="limpiarFormulario()" class="btn-limpiar">🧹 Limpiar</button>
    </div>
</form>

<!-- Tabla de últimos pedidos -->
<h2>Últimos 10 Pedidos del Cliente</h2>
<table id="tablaPedidos">
    <thead>
        <tr>
            <th>#</th>
            <th>Tipo Pedido</th>
            <th>Dirección</th>
            <th>Barrio</th>
            <th>Teléfono</th>
            <th>Nombre Cliente</th>
            <th>Observación Cliente</th>
            <th>Estado</th>
            <th>Precio</th>
            <th>Observación Pedido</th>
            <th>Fecha Creación</th>
            <th>Repartidor</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>

<ul class="menu">
    <li><a href="../pedidos/index.php">Volver</a></li>
</ul>

<script>
    function cambiarCantidad(id, cambio) {
        let campo = document.getElementById(id);
        let valor = parseInt(campo.value) || 0;
        valor = valor + cambio;
        if (valor < 0) valor = 0;
        campo.value = valor;
    }

    function limpiarFormulario() {
        document.getElementById('formularioPedido').reset();
        document.getElementById('cliente_id').value = '';
        document.getElementById('sugerencias').innerHTML = '';
        document.getElementById('sugerencias_total').innerHTML = '';
        document.getElementById('sugerencias').style.display = 'none';
        document.getElementById('sugerencias_total').style.display = 'none';
        document.querySelector('#tablaPedidos tbody').innerHTML = '';
    }

    // Búsqueda general de clientes
    const inputTotal = document.getElementById('direccion_cliente_total');
    const sugerenciasTotal = document.getElementById('sugerencias_total');
    
    inputTotal.addEventListener('input', function() {
        const valor = this.value.trim();
        if (valor.length > 2) {
            fetch(`agregar.php?buscar_cliente_total=1&buscar_busqueda=${encodeURIComponent(valor)}`)
                .then(response => response.json())
                .then(data => {
                    sugerenciasTotal.innerHTML = '';
                    if (data.length > 0) {
                        sugerenciasTotal.style.display = 'block';
                        data.forEach(cliente => {
                            const div = document.createElement('div');
                            div.className = 'sugerencia';
                            div.textContent = `${cliente.nombre} - ${cliente.direccion} (${cliente.telefono})`;
                            div.onclick = () => {
                                document.getElementById('nombre_cliente').value = cliente.nombre;
                                document.getElementById('direccion_cliente').value = cliente.direccion;
                                document.getElementById('barrio_cliente').value = cliente.barrio;
                                document.getElementById('telefono_cliente').value = cliente.telefono;
                                document.getElementById('observacion_cliente').value = cliente.observacion || '';
                                document.getElementById('cliente_id').value = cliente.id;
                                sugerenciasTotal.innerHTML = '';
                                sugerenciasTotal.style.display = 'none';
                                inputTotal.value = '';
                                // Cargar últimos pedidos
                                fetch(`agregar.php?obtener_pedidos=1&cliente_id=${cliente.id}`)
                                    .then(response => response.json())
                                    .then(pedidos => {
                                        const tbody = document.querySelector('#tablaPedidos tbody');
                                        tbody.innerHTML = '';
                                        if (pedidos.length > 0) {
                                            pedidos.forEach((pedido, index) => {
                                                const fila = `<tr>
                                                    <td>${index + 1}</td>
                                                    <td>${pedido.tipo_pedido || '-'}</td>
                                                    <td>${pedido.direccion}</td>
                                                    <td>${pedido.barrio}</td>
                                                    <td>${pedido.telefono}</td>
                                                    <td>${pedido.cliente_nombre}</td>
                                                    <td>${pedido.observacion_cliente}</td>
                                                    <td>${pedido.estado}</td>
                                                    <td>$${parseFloat(pedido.precio).toFixed(2)}</td>
                                                    <td>${pedido.observacion_pedido}</td>
                                                    <td>${pedido.fecha_creacion}</td>
                                                    <td>${pedido.repartidor_nombre ? pedido.repartidor_nombre + ' ' + pedido.repartidor_apellido : 'Sin asignar'}</td>
                                                </tr>`;
                                                tbody.innerHTML += fila;
                                            });
                                        } else {
                                            tbody.innerHTML = '<tr><td colspan="12">No hay pedidos registrados para este cliente.</td></tr>';
                                        }
                                    });
                            };
                            sugerenciasTotal.appendChild(div);
                        });
                    } else {
                        sugerenciasTotal.style.display = 'none';
                    }
                })
                .catch(error => console.error('Error:', error));
        } else {
            sugerenciasTotal.innerHTML = '';
            sugerenciasTotal.style.display = 'none';
        }
    });

    // Búsqueda por dirección
    const direccionInput = document.getElementById('direccion_cliente');
    const sugerenciasDir = document.getElementById('sugerencias');
    
    direccionInput.addEventListener('input', function() {
        const valor = this.value.trim();
        if (valor.length > 2) {
            fetch(`agregar.php?buscar_cliente=1&direccion_busqueda=${encodeURIComponent(valor)}`)
                .then(response => response.json())
                .then(data => {
                    sugerenciasDir.innerHTML = '';
                    if (data.length > 0) {
                        sugerenciasDir.style.display = 'block';
                        data.forEach(cliente => {
                            const div = document.createElement('div');
                            div.className = 'sugerencia';
                            div.textContent = `${cliente.direccion} ${cliente.barrio} - ${cliente.nombre} (${cliente.telefono})`;
                            div.onclick = () => {
                                direccionInput.value = cliente.direccion;
                                document.getElementById('nombre_cliente').value = cliente.nombre;
                                document.getElementById('barrio_cliente').value = cliente.barrio;
                                document.getElementById('telefono_cliente').value = cliente.telefono;
                                document.getElementById('observacion_cliente').value = cliente.observacion || '';
                                document.getElementById('cliente_id').value = cliente.id;
                                sugerenciasDir.innerHTML = '';
                                sugerenciasDir.style.display = 'none';
                                // Cargar últimos pedidos
                                fetch(`agregar.php?obtener_pedidos=1&cliente_id=${cliente.id}`)
                                    .then(response => response.json())
                                    .then(pedidos => {
                                        const tbody = document.querySelector('#tablaPedidos tbody');
                                        tbody.innerHTML = '';
                                        if (pedidos.length > 0) {
                                            pedidos.forEach((pedido, index) => {
                                                const fila = `<tr>
                                                    <td>${index + 1}</td>
                                                    <td>${pedido.tipo_pedido || '-'}</td>
                                                    <td>${pedido.direccion}</td>
                                                    <td>${pedido.barrio}</td>
                                                    <td>${pedido.telefono}</td>
                                                    <td>${pedido.cliente_nombre}</td>
                                                    <td>${pedido.observacion_cliente}</td>
                                                    <td>${pedido.estado}</td>
                                                    <td>$${parseFloat(pedido.precio).toFixed(2)}</td>
                                                    <td>${pedido.observacion_pedido}</td>
                                                    <td>${pedido.fecha_creacion}</td>
                                                    <td>${pedido.repartidor_nombre ? pedido.repartidor_nombre + ' ' + pedido.repartidor_apellido : 'Sin asignar'}</td>
                                                </tr>`;
                                                tbody.innerHTML += fila;
                                            });
                                        } else {
                                            tbody.innerHTML = '<tr><td colspan="12">No hay pedidos registrados para este cliente.</td></tr>';
                                        }
                                    });
                            };
                            sugerenciasDir.appendChild(div);
                        });
                    } else {
                        sugerenciasDir.style.display = 'none';
                    }
                })
                .catch(error => console.error('Error:', error));
        } else {
            sugerenciasDir.innerHTML = '';
            sugerenciasDir.style.display = 'none';
        }
    });

    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!sugerenciasTotal.contains(e.target) && e.target !== inputTotal) {
            sugerenciasTotal.style.display = 'none';
        }
        if (!sugerenciasDir.contains(e.target) && e.target !== direccionInput) {
            sugerenciasDir.style.display = 'none';
        }
    });
</script>
</body>
</html>
<?php $conexion->close(); ?>