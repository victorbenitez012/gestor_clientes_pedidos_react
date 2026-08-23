<?php
/**
 * Helper centralizado para CORS.
 *
 * Lista blanca de orígenes permitidos. Refleja el Origin solo si está
 * en la lista; nunca devuelve "*" junto con credentials (los navegadores
 * lo rechazan).
 *
 * Si llega un preflight OPTIONS, responde 204 y termina el script.
 *
 * Uso en cada endpoint:
 *   require_once __DIR__ . '/../cors.php';
 *   cors_headers();
 */

function cors_headers(): void {
    $allowed = [
        'http://localhost:3000',                       // CRA dev server
        'http://localhost',                            // XAMPP raíz
        'http://localhost/gestor_clientes_pedidos_react',
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowed, true)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit();
    }
}
