<?php

declare(strict_types=1);

/**
 * Credenciales por defecto (XAMPP clasico).
 * Sobrescribir sin tocar el repo: copie config.local.example.php a config.local.php
 * o defina variables de entorno GESTOR_DB_* (ver abajo).
 */
function gestor_db_config(): array
{
    $config = [
        'host' => '127.0.0.1',
        'port' => 3306,
        'user' => 'root',
        'pass' => '',
        'name' => 'gestor_clientes_pedidos_react',
    ];

    foreach (
        [
            'GESTOR_DB_HOST' => 'host',
            'GESTOR_DB_PORT' => 'port',
            'GESTOR_DB_USER' => 'user',
            'GESTOR_DB_PASS' => 'pass',
            'GESTOR_DB_NAME' => 'name',
        ] as $env => $key
    ) {
        $v = getenv($env);
        if ($v !== false && $v !== '') {
            if ($key === 'port') {
                $config['port'] = (int) $v;
            } else {
                $config[$key] = $v;
            }
        }
    }

    $localPath = __DIR__ . '/config.local.php';
    if (is_readable($localPath)) {
        $local = require $localPath;
        if (is_array($local)) {
            if (isset($local['port'])) {
                $local['port'] = (int) $local['port'];
            }
            $config = array_merge($config, $local);
        }
    }

    return $config;
}
