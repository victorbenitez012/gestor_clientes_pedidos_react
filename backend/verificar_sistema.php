<?php
/**
 * Verificación completa del sistema
 * URL: http://localhost/gestor_clientes_pedidos_react/backend/verificar_sistema.php
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>✅ Verificación del Sistema</h1>";
echo "<hr>";

// 1. Verificar archivos críticos
$archivos_criticos = [
    'auth/login_jwt.php' => __DIR__ . '/auth/login_jwt.php',
    'auth/middleware.php' => __DIR__ . '/auth/middleware.php',
    'auth/jwt_helper.php' => __DIR__ . '/auth/jwt_helper.php',
    'conexion.php' => __DIR__ . '/conexion.php',
    'config.php' => __DIR__ . '/config.php',
];

echo "<h2>1. Archivos del Backend</h2>";
echo "<table border='1' cellpadding='5'>";
foreach ($archivos_criticos as $nombre => $ruta) {
    $existe = file_exists($ruta);
    echo "<tr>";
    echo "<td>{$nombre}</td>";
    echo "<td style='color:" . ($existe ? 'green' : 'red') . "'>" . ($existe ? '✅ OK' : '❌ NO EXISTE') . "</td>";
    echo "</tr>";
}
echo "</table>";

// 2. Verificar base de datos
echo "<hr><h2>2. Base de Datos</h2>";
try {
    require_once __DIR__ . '/conexion.php';
    $conexion = conectarBD();
    echo "<p style='color:green'>✅ Conexión exitosa</p>";

    // Verificar tabla usuarios
    $result = $conexion->query("SHOW TABLES LIKE 'usuarios'");
    if ($result->num_rows > 0) {
        echo "<p style='color:green'>✅ Tabla 'usuarios' existe</p>";

        // Contar usuarios
        $count = $conexion->query("SELECT COUNT(*) as total FROM usuarios")->fetch_assoc();
        echo "<p>Total de usuarios: {$count['total']}</p>";

        // Verificar usuario admin
        $admin = $conexion->query("SELECT username, activo, rol FROM usuarios WHERE username = 'admin'")->fetch_assoc();
        if ($admin) {
            echo "<p style='color:green'>✅ Usuario 'admin' existe</p>";
            echo "<ul>";
            echo "<li>Activo: " . ($admin['activo'] ? 'Sí' : 'No') . "</li>";
            echo "<li>Rol: {$admin['rol']}</li>";
            echo "</ul>";
        } else {
            echo "<p style='color:red'>❌ Usuario 'admin' NO existe</p>";
        }
    } else {
        echo "<p style='color:red'>❌ Tabla 'usuarios' NO existe</p>";
    }

    $conexion->close();
} catch (Exception $e) {
    echo "<p style='color:red'>❌ Error: " . $e->getMessage() . "</p>";
}

// 3. Verificar configuración JWT
echo "<hr><h2>3. Configuración JWT</h2>";
require_once __DIR__ . '/auth/jwt_helper.php';
$test_data = ['id' => 1, 'username' => 'test', 'rol' => 'admin'];
$token = JWTAuth::generateToken($test_data);
$decoded = JWTAuth::validateToken($token);
if ($decoded) {
    echo "<p style='color:green'>✅ JWT funciona correctamente</p>";
} else {
    echo "<p style='color:red'>❌ JWT no funciona</p>";
}

// 4. Verificar middleware
echo "<hr><h2>4. Middleware de Autenticación</h2>";
echo "<p>El middleware ahora soporta JWT y Sesiones PHP.</p>";

// 5. Instrucciones finales
echo "<hr><h2>5. Próximos Pasos</h2>";
echo "<ol>";
echo "<li><strong>Reconstruir el frontend:</strong><br>";
echo "Abre una terminal en la carpeta <code>frontend</code> y ejecuta:<br>";
echo "<pre style='background:#f4f4f4;padding:10px;'>cd frontend<br>npm run build</pre>";
echo "</li>";
echo "<li><strong>Probar login:</strong> Usa admin / admin123</li>";
echo "<li>Si hay errores, revisa la consola del navegador (F12)</li>";
echo "</ol>";

echo "<hr><p><a href='limpiar.php'>🧹 Limpiar scripts temporales</a></p>";
