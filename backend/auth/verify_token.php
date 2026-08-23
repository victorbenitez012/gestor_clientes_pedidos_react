<?php
/**
 * Verificar token JWT
 * Método: GET
 * Response: { valid: boolean, user?: object, message?: string }
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';
cors_headers();

require_once __DIR__ . '/jwt_helper.php';

$token = JWTAuth::getBearerToken();

if (!$token) {
    echo json_encode([
        'valid' => false,
        'message' => 'No se proporcionó token'
    ]);
    exit();
}

$user = JWTAuth::validateToken($token);

if (!$user) {
    echo json_encode([
        'valid' => false,
        'message' => 'Token inválido o expirado'
    ]);
    exit();
}

echo json_encode([
    'valid' => true,
    'user' => $user
]);
