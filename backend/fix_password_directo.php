<?php
/**
 * Actualiza la contraseña del admin directamente con un hash válido
 * URL: http://localhost/gestor_clientes_pedidos_react/backend/fix_password_directo.php
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔧 Corrección de Contraseña</h1>";

try {
    require_once __DIR__ . '/conexion.php';
    $conexion = conectarBD();

    // Contraseña a establecer
    $password = 'admin123';
    $hash = password_hash($password, PASSWORD_BCRYPT);

    echo "<p>Nuevo hash generado: <code>{$hash}</code></p>";

    // Verificar que el hash funciona
    $test = password_verify($password, $hash);
    echo "<p>Verificación del hash: " . ($test ? '✅ OK' : '❌ FALLÓ') . "</p>";

    // Actualizar en la base de datos
    $stmt = $conexion->prepare("UPDATE usuarios SET password_hash = ? WHERE username = 'admin'");
    $stmt->bind_param("s", $hash);

    if ($stmt->execute()) {
        echo "<div style='background:#d4edda;padding:15px;margin:10px 0;border-radius:5px;'>";
        echo "<h2>✅ ¡Contraseña actualizada correctamente!</h2>";
        echo "<p><strong>Usuario:</strong> admin</p>";
        echo "<p><strong>Contraseña:</strong> admin123</p>";
        echo "<p>Ahora puedes intentar iniciar sesión.</p>";
        echo "</div>";
    } else {
        echo "<div style='background:#f8d7da;padding:15px;margin:10px 0;border-radius:5px;'>";
        echo "<h2>❌ Error al actualizar</h2>";
        echo "<p>" . $stmt->error . "</p>";
        echo "</div>";
    }

    // También actualizar otros usuarios
    $usuarios = [
        ['usuario', 'usuario123'],
        ['repartidor1', 'repartidor123'],
        ['repartidor2', 'repartidor123'],
        ['operario', 'operario123'],
    ];

    echo "<hr><h2>Actualizando otros usuarios...</h2>";

    foreach ($usuarios as $u) {
        $username = $u[0];
        $pass = $u[1];
        $new_hash = password_hash($pass, PASSWORD_BCRYPT);

        $stmt2 = $conexion->prepare("UPDATE usuarios SET password_hash = ? WHERE username = ?");
        $stmt2->bind_param("ss", $new_hash, $username);

        if ($stmt2->execute() && $stmt2->affected_rows > 0) {
            echo "<p>✅ {$username} actualizado (pass: {$pass})</p>";
        } else {
            echo "<p>⚠️ {$username} no se actualizó (quizás no existe)</p>";
        }
    }

    echo "<hr>";
    echo "<p><a href='ping_db.php' style='color:blue;'>Verificar conexión</a> |<a href='#' onclick='if(confirm(\"Eliminar scripts de diagnóstico?\")){window.location=\"limpiar.php\"}' style='color:red;'>Eliminar scripts de diagnóstico</a></p>";

    $conexion->close();

} catch (Exception $e) {
    echo "<div style='background:#f8d7da;padding:15px;margin:10px 0;border-radius:5px;'>";
    echo "<h2>❌ Error</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
    echo "</div>";
}
