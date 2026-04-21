<?php
/**
 * Restablecer contraseña
 * Método: POST
 * Body: { token: string, password: string }
 * Response: { success: boolean, message: string }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/jwt_helper.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['token']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Token y nueva contraseña son requeridos']);
    exit();
}

$token = $data['token'];
$password = $data['password'];

// Validar longitud de contraseña
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 6 caracteres']);
    exit();
}

// Validar token
$tokenData = JWTAuth::validateResetToken($token);

if (!$tokenData) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Token inválido o expirado']);
    exit();
}

$userId = $tokenData['user_id'];

try {
    $conexion = conectarBD();

    // Verificar que el usuario existe y está activo
    $checkQuery = "SELECT id FROM usuarios WHERE id = ? AND activo = 1";
    $checkStmt = $conexion->prepare($checkQuery);
    $checkStmt->bind_param("i", $userId);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    $checkStmt->close();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
        exit();
    }

    // Hash de la nueva contraseña
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    // Actualizar contraseña y limpiar token
    $updateQuery = "UPDATE usuarios SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?";
    $updateStmt = $conexion->prepare($updateQuery);
    $updateStmt->bind_param("si", $passwordHash, $userId);

    if ($updateStmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Contraseña actualizada correctamente'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al actualizar contraseña']);
    }

    $updateStmt->close();
    $conexion->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
