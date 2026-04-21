<?php
/**
 * Script de diagnóstico completo para el sistema de login
 * Ejecutar en navegador: http://localhost/gestor_clientes_pedidos_react/backend/diagnostico.php
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 Diagnóstico del Sistema de Login</h1>";
echo "<hr>";

$errores = [];
$advertencias = [];
$ok = [];

// ============================================
// 1. Verificar conexión a la base de datos
// ============================================
echo "<h2>1. Conexión a la Base de Datos</h2>";

try {
    require_once __DIR__ . '/conexion.php';
    $conexion = conectarBD();
    $ok[] = "✅ Conexión a la base de datos exitosa";
    echo "<p style='color:green'>✅ Conexión exitosa</p>";

    // Verificar configuración cargada
    $config = gestor_cargar_bd_config();
    echo "<p><strong>Host:</strong> {$config['host']}</p>";
    echo "<p><strong>Base de datos:</strong> {$config['name']}</p>";
    echo "<p><strong>Usuario:</strong> {$config['user']}</p>";

} catch (Exception $e) {
    $errores[] = "❌ Error de conexión: " . $e->getMessage();
    echo "<p style='color:red'>❌ Error: " . $e->getMessage() . "</p>";
    die("<p>No se puede continuar sin conexión a la base de datos.</p>");
}

// ============================================
// 2. Verificar tabla usuarios
// ============================================
echo "<hr><h2>2. Tabla 'usuarios'</h2>";

$resultado = $conexion->query("SHOW TABLES LIKE 'usuarios'");
if ($resultado->num_rows === 0) {
    $errores[] = "❌ La tabla 'usuarios' NO existe";
    echo "<p style='color:red'>❌ La tabla 'usuarios' NO existe</p>";
} else {
    $ok[] = "✅ Tabla 'usuarios' existe";
    echo "<p style='color:green'>✅ Tabla 'usuarios' existe</p>";

    // Ver estructura de la tabla
    $estructura = $conexion->query("DESCRIBE usuarios");
    echo "<h3>Estructura de la tabla:</h3>";
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Nulo</th><th>Key</th><th>Default</th></tr>";
    while ($row = $estructura->fetch_assoc()) {
        echo "<tr>";
        echo "<td>{$row['Field']}</td>";
        echo "<td>{$row['Type']}</td>";
        echo "<td>{$row['Null']}</td>";
        echo "<td>{$row['Key']}</td>";
        echo "<td>{$row['Default']}</td>";
        echo "</tr>";
    }
    echo "</table>";

    // Verificar si existe campo password_hash
    $estructura = $conexion->query("DESCRIBE usuarios");
    $tiene_password_hash = false;
    while ($row = $estructura->fetch_assoc()) {
        if ($row['Field'] === 'password_hash') {
            $tiene_password_hash = true;
            break;
        }
    }

    if (!$tiene_password_hash) {
        $errores[] = "❌ La tabla no tiene el campo 'password_hash'";
        echo "<p style='color:red'>❌ Falta el campo 'password_hash'</p>";
    }
}

// ============================================
// 3. Verificar usuario admin
// ============================================
echo "<hr><h2>3. Usuario 'admin'</h2>";

$query = "SELECT id, username, password_hash, nombre, apellido, rol, activo
          FROM usuarios WHERE username = 'admin'";
$resultado = $conexion->query($query);

if ($resultado->num_rows === 0) {
    $errores[] = "❌ El usuario 'admin' NO existe";
    echo "<p style='color:red'>❌ El usuario 'admin' NO existe</p>";

    // Listar usuarios existentes
    echo "<h3>Usuarios existentes:</h3>";
    $usuarios = $conexion->query("SELECT username, nombre, rol FROM usuarios LIMIT 10");
    if ($usuarios->num_rows === 0) {
        echo "<p style='color:red'>⚠️ No hay usuarios en la tabla</p>";
        $advertencias[] = "No hay usuarios en la tabla";
    } else {
        echo "<ul>";
        while ($u = $usuarios->fetch_assoc()) {
            echo "<li>{$u['username']} ({$u['nombre']}) - Rol: {$u['rol']}</li>";
        }
        echo "</ul>";
    }
} else {
    $usuario = $resultado->fetch_assoc();
    $ok[] = "✅ Usuario 'admin' encontrado";
    echo "<p style='color:green'>✅ Usuario 'admin' encontrado</p>";
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><td><strong>ID:</strong></td><td>{$usuario['id']}</td></tr>";
    echo "<tr><td><strong>Username:</strong></td><td>{$usuario['username']}</td></tr>";
    echo "<tr><td><strong>Nombre:</strong></td><td>{$usuario['nombre']} {$usuario['apellido']}</td></tr>";
    echo "<tr><td><strong>Rol:</strong></td><td>{$usuario['rol']}</td></tr>";
    echo "<tr><td><strong>Activo:</strong></td><td>" . ($usuario['activo'] ? 'Sí ✅' : 'No ❌') . "</td></tr>";
    echo "<tr><td><strong>Password Hash:</strong></td><td style='font-family:monospace;font-size:10px;word-break:break-all;'>{$usuario['password_hash']}</td></tr>";
    echo "</table>";

    if (!$usuario['activo']) {
        $errores[] = "❌ El usuario admin está desactivado";
        echo "<p style='color:red'>⚠️ El usuario está desactivado</p>";
    }

    // ============================================
    // 4. Verificar hash de contraseña
    // ============================================
    echo "<hr><h2>4. Verificación del Hash de Contraseña</h2>";

    $test_password = 'admin123';
    $hash = $usuario['password_hash'];

    echo "<p><strong>Contraseña a probar:</strong> {$test_password}</p>";
    echo "<p><strong>Hash almacenado:</strong> <code>{$hash}</code></p>";

    // Verificar con password_verify
    $verificacion = password_verify($test_password, $hash);

    if ($verificacion) {
        $ok[] = "✅ El hash de contraseña es válido para 'admin123'";
        echo "<p style='color:green;font-size:18px'><strong>✅ password_verify() funciona correctamente</strong></p>";
    } else {
        $errores[] = "❌ El hash de contraseña NO es válido para 'admin123'";
        echo "<p style='color:red;font-size:18px'><strong>❌ password_verify() FALLÓ</strong></p>";
        echo "<p>El hash almacenado no coincide con la contraseña 'admin123'</p>";

        // Generar nuevo hash correcto
        echo "<h3>Nuevo hash generado:</h3>";
        $nuevo_hash = password_hash($test_password, PASSWORD_BCRYPT);
        echo "<pre style='background:#f4f4f4;padding:10px;'>$nuevo_hash</pre>";

        // Verificar que el nuevo hash funciona
        $verificacion_nuevo = password_verify($test_password, $nuevo_hash);
        echo "<p>Verificación del nuevo hash: " . ($verificacion_nuevo ? '✅ OK' : '❌ FALLÓ') . "</p>";

        // Botón para arreglar
        echo "<form method='post' action=''>";
        echo "<input type='hidden' name='accion' value='fix_password'>";
        echo "<input type='hidden' name='nuevo_hash' value='{$nuevo_hash}'>";
        echo "<button type='submit' style='padding:10px 20px;background:#4CAF50;color:white;border:none;cursor:pointer;font-size:16px;'>🔧 Corregir contraseña del admin</button>";
        echo "</form>";
    }
}

// ============================================
// 5. Verificar archivos de autenticación
// ============================================
echo "<hr><h2>5. Archivos de Autenticación</h2>";

$archivos = [
    'conexion.php' => __DIR__ . '/conexion.php',
    'login_jwt.php' => __DIR__ . '/auth/login_jwt.php',
    'jwt_helper.php' => __DIR__ . '/auth/jwt_helper.php',
    'config.php' => __DIR__ . '/config.php',
];

echo "<table border='1' cellpadding='5'>";
foreach ($archivos as $nombre => $ruta) {
    if (file_exists($ruta)) {
        $tamaño = filesize($ruta);
        echo "<tr style='color:green'><td>{$nombre}</td><td>✅ Existe</td><td>{$tamaño} bytes</td></tr>";
    } else {
        echo "<tr style='color:red'><td>{$nombre}</td><td>❌ NO existe</td><td>-</td></tr>";
        $errores[] = "❌ Falta archivo: {$nombre}";
    }
}
echo "</table>";

// ============================================
// 6. Probar login directamente
// ============================================
echo "<hr><h2>6. Prueba de Login Directa</h2>";

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['test_login'])) {
    $test_user = $_POST['test_user'] ?? 'admin';
    $test_pass = $_POST['test_pass'] ?? 'admin123';

    $stmt = $conexion->prepare("SELECT id, username, password_hash, rol, activo FROM usuarios WHERE username = ?");
    $stmt->bind_param("s", $test_user);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 0) {
        echo "<p style='color:red'>❌ Usuario '{$test_user}' no encontrado</p>";
    } else {
        $user = $resultado->fetch_assoc();

        echo "<h3>Usuario encontrado:</h3>";
        echo "<pre>";
        print_r($user);
        echo "</pre>";

        $verificacion = password_verify($test_pass, $user['password_hash']);
        echo "<p><strong>password_verify('{$test_pass}', hash):</strong> " . ($verificacion ? '✅ TRUE' : '❌ FALSE') . "</p>";

        if ($verificacion && $user['activo']) {
            echo "<p style='color:green;font-size:18px'>✅ Login exitoso simulado</p>";
        } else if (!$user['activo']) {
            echo "<p style='color:orange'>⚠️ Usuario inactivo</p>";
        } else {
            echo "<p style='color:red'>❌ Contraseña incorrecta</p>";
        }
    }
}

echo "<form method='post' action=''>";
echo "<h3>Probar login manual:</h3>";
echo "<label>Usuario: <input type='text' name='test_user' value='admin'></label><br><br>";
echo "<label>Contraseña: <input type='text' name='test_pass' value='admin123'></label><br><br>";
echo "<button type='submit' name='test_login' value='1' style='padding:10px 20px;'>🧪 Probar Login</button>";
echo "</form>";

// ============================================
// 7. Acciones de corrección
// ============================================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['accion'])) {
    if ($_POST['accion'] === 'fix_password' && isset($_POST['nuevo_hash'])) {
        $nuevo_hash = $_POST['nuevo_hash'];
        $stmt = $conexion->prepare("UPDATE usuarios SET password_hash = ? WHERE username = 'admin'");
        $stmt->bind_param("s", $nuevo_hash);

        if ($stmt->execute()) {
            echo "<div style='background:#d4edda;padding:15px;margin:10px 0;border-radius:5px;'>";
            echo "<h3>✅ Contraseña actualizada correctamente</h3>";
            echo "<p>La contraseña del usuario 'admin' ahora es: <strong>admin123</strong></p>";
            echo "<p><a href='diagnostico.php'>🔄 Recargar diagnóstico</a></p>";
            echo "</div>";
        } else {
            echo "<div style='background:#f8d7da;padding:15px;margin:10px 0;border-radius:5px;'>";
            echo "<h3>❌ Error al actualizar: " . $stmt->error . "</h3>";
            echo "</div>";
        }
    }
}

// ============================================
// RESUMEN
// ============================================
echo "<hr><h2>📊 Resumen</h2>";

if (empty($errores)) {
    echo "<div style='background:#d4edda;padding:15px;border-radius:5px;'>";
    echo "<h3 style='color:green'>✅ Todo parece estar correcto</h3>";
    echo "<p>El sistema de login debería funcionar. Prueba iniciar sesión con:</p>";
    echo "<ul><li><strong>Usuario:</strong> admin</li><li><strong>Contraseña:</strong> admin123</li></ul>";
    echo "</div>";
} else {
    echo "<div style='background:#f8d7da;padding:15px;border-radius:5px;'>";
    echo "<h3 style='color:red'>❌ Se encontraron errores</h3>";
    echo "<ul>";
    foreach ($errores as $error) {
        echo "<li>{$error}</li>";
    }
    echo "</ul>";
    echo "</div>";
}

if (!empty($advertencias)) {
    echo "<div style='background:#fff3cd;padding:15px;margin-top:10px;border-radius:5px;'>";
    echo "<h3>⚠️ Advertencias</h3>";
    echo "<ul>";
    foreach ($advertencias as $adv) {
        echo "<li>{$adv}</li>";
    }
    echo "</ul>";
    echo "</div>";
}

if (!empty($ok)) {
    echo "<div style='background:#d1ecf1;padding:15px;margin-top:10px;border-radius:5px;'>";
    echo "<h3>✅ Verificaciones OK</h3>";
    echo "<ul>";
    foreach ($ok as $o) {
        echo "<li>{$o}</li>";
    }
    echo "</ul>";
    echo "</div>";
}

// Ver logs de PHP
echo "<hr><h2>📋 Últimos errores de PHP (últimas 20 líneas)</h2>";
$log_file = 'C:/xampp/php/logs/php_error_log';
if (file_exists($log_file)) {
    $lines = array_slice(file($log_file), -20);
    echo "<pre style='background:#f4f4f4;padding:10px;font-size:11px;overflow:auto;'>";
    foreach ($lines as $line) {
        echo htmlspecialchars($line);
    }
    echo "</pre>";
} else {
    echo "<p>No se encontró el archivo de log de PHP</p>";
}

// Enlace para eliminar este script
echo "<hr><p><a href='#' onclick='if(confirm(\"¿Eliminar este script de diagnóstico?\")){window.location=\"eliminar_diagnostico.php\"}' style='color:red;'>🗑️ Eliminar script de diagnóstico (por seguridad)</a></p>";

$conexion->close();
