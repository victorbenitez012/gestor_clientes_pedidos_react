<?php
// Limpia los archivos temporales creados para diagnóstico
$archivos = [
    'diagnostico.php',
    'eliminar_diagnostico.php',
    'fix_password_directo.php',
    'generar_hashes.php',
    'limpiar.php',
    'test_auth.php',
    'verificar_sistema.php'
];

echo "<h2>🧹 Limpieza de scripts temporales</h2>";
echo "<ul>";

$eliminados = 0;
foreach ($archivos as $archivo) {
    $ruta = __DIR__ . '/' . $archivo;
    if (file_exists($ruta)) {
        if (unlink($ruta)) {
            echo "<li>✅ Eliminado: {$archivo}</li>";
            $eliminados++;
        } else {
            echo "<li>❌ No se pudo eliminar: {$archivo}</li>";
        }
    }
}

echo "</ul>";
echo "<p>Total eliminados: {$eliminados}/" . count($archivos) . "</p>";
echo "<p><a href='ping_db.php'>Volver a ping_db.php</a></p>";
