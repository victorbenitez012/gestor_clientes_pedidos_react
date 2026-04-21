<?php
// Script para eliminar el diagnóstico por seguridad
$files = [
    __DIR__ . '/diagnostico.php',
    __DIR__ . '/eliminar_diagnostico.php'
];

$deleted = 0;
foreach ($files as $file) {
    if (file_exists($file) && unlink($file)) {
        $deleted++;
    }
}

echo "<h2>Scripts de diagnóstico eliminados</h2>";
echo "<p>Se eliminaron {$deleted} archivo(s).</p>";
echo "<p><a href='ping_db.php'>Volver</a></p>";
