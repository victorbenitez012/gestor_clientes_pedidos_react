<?php
/**
 * Prueba de autenticación JWT
 * URL: http://localhost/gestor_clientes_pedidos_react/backend/test_auth.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/auth/middleware.php';

echo "{
  \"message\": \"Middleware cargado correctamente\",
  \"auth_header\": \"" . ($_SERVER['HTTP_AUTHORIZATION'] ?? 'NO ENVIADO') . "\",
  \"user\": ";

$user = checkAuth();

if ($user) {
    echo json_encode($user);
} else {
    echo "null";
}

echo "
}";
