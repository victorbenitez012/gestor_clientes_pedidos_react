<?php

declare(strict_types=1);

/**
 * Comprueba lectura de config y conexion a la base (sin datos sensibles en la respuesta).
 * Abrir en el navegador: .../backend/ping_db.php
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/conexion.php';

try {
    $c = gestor_cargar_bd_config();
    $mysqli = conectarBD();
    $mysqli->query('SELECT 1');
    $mysqli->close();
    echo json_encode([
        'ok' => true,
        'database' => $c['name'],
        'host' => $c['host'],
        'port' => (int) ($c['port'] ?? 3306),
        'user' => $c['user'],
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage(),
    ]);
}
