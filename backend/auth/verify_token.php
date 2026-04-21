<?php
/**
 * Verificar token JWT
 * Método: GET
 * Response: { valid: boolean, user?: object, message?: string }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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
