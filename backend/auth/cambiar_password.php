<?php
/**
 * Cambiar contraseña (usuario logueado)
 * Método: POST
 * Body: { current_password: string, new_password: string }
 * Response: { success: boolean, message: string }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/jwt_helper.php';

$user = requireJWTAuth(); // Cualquier usuario autenticado

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['current_password']) || empty($data['new_password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Contraseña actual y nueva son requeridas']);
    exit();
}

$currentPassword = $data['current_password'];
$newPassword = $data['new_password'];

// Validar nueva contraseña
if (strlen($newPassword) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La nueva contraseña debe tener al menos 6 caracteres']);
    exit();
}

try {
    $conexion = conectarBD();

    // Obtener hash actual
    $query = "SELECT password_hash FROM usuarios WHERE id = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("i", $user['id']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
        exit();
    }

    $userData = $result->fetch_assoc();
    $stmt->close();

    // Verificar contraseña actual
    if (!password_verify($currentPassword, $userData['password_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Contraseña actual incorrecta']);
        exit();
    }

    // Hash de la nueva contraseña
    $newPasswordHash = password_hash($newPassword, PASSWORD_BCRYPT);

    // Actualizar
    $updateQuery = "UPDATE usuarios SET password_hash = ? WHERE id = ?";
    $updateStmt = $conexion->prepare($updateQuery);
    $updateStmt->bind_param("si", $newPasswordHash, $user['id']);

    if ($updateStmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Contraseña cambiada correctamente'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al cambiar contraseña']);
    }

    $updateStmt->close();
    $conexion->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
