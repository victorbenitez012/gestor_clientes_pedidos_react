<?php
/**
 * Verificar estado de sesión
 * Método: GET
 * Response: { authenticated: boolean, user?: object }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'rol' => $_SESSION['rol'],
            'nombre' => $_SESSION['nombre']
        ]
    ]);
} else {
    echo json_encode([
        'authenticated' => false,
        'user' => null
    ]);
}
?>