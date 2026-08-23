<?php
/**
 * Verificar estado de sesión
 * Método: GET
 * Response: { authenticated: boolean, user?: object }
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';
cors_headers();

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