<?php
/**
 * Solicitar recuperación de contraseña
 * Método: POST
 * Body: { email: string }
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

if (!$data || empty($data['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email es requerido']);
    exit();
}

$email = trim($data['email']);

// Validar formato de email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email inválido']);
    exit();
}

try {
    $conexion = conectarBD();

    // Buscar usuario por email
    $query = "SELECT id, username, nombre, apellido, email FROM usuarios WHERE email = ? AND activo = 1";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    // Por seguridad, responder igual aunque no exista el email
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
        ]);
        exit();
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    // Generar token de recuperación (expira en 1 hora)
    $resetToken = JWTAuth::generateResetToken($user['id']);

    // Guardar token en la base de datos (opcional, para invalidación manual)
    $updateQuery = "UPDATE usuarios SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?";
    $updateStmt = $conexion->prepare($updateQuery);
    $updateStmt->bind_param("si", $resetToken, $user['id']);
    $updateStmt->execute();
    $updateStmt->close();

    $conexion->close();

    // Construir link de recuperación
    $resetLink = "http://localhost:3000/reset-password?token=" . urlencode($resetToken);

    // Aquí enviarías el email
    // Por ahora, simulamos y devolvemos el link en modo desarrollo
    $isDevelopment = true; // Cambiar a false en producción

    if ($isDevelopment) {
        echo json_encode([
            'success' => true,
            'message' => 'Se han enviado las instrucciones a tu email',
            'dev_link' => $resetLink, // Solo en desarrollo
            'dev_token' => $resetToken // Solo en desarrollo
        ]);
    } else {
        // En producción, enviar email real
        // mail($email, "Recuperación de contraseña", "Haz clic aquí: $resetLink");

        echo json_encode([
            'success' => true,
            'message' => 'Se han enviado las instrucciones a tu email'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
