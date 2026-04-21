<?php
/**
 * Login con JWT
 * Método: POST
 * Body: { username: string, password: string }
 * Response: { success: boolean, token?: string, user?: object, message?: string }
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/jwt_helper.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos JSON inválidos']);
    exit();
}

$username = isset($data['username']) ? trim($data['username']) : '';
$password = isset($data['password']) ? $data['password'] : '';

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Usuario y contraseña son requeridos']);
    exit();
}

try {
    $conexion = conectarBD();

    // Buscar usuario
    $query = "SELECT id, username, password_hash, nombre, apellido, email, telefono, rol, activo
              FROM usuarios
              WHERE username = ?";

    $stmt = $conexion->prepare($query);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Credenciales inválidas']);
        exit();
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    // Verificar si está activo
    if (!$user['activo']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Usuario desactivado']);
        exit();
    }

    // Verificar contraseña
    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Credenciales inválidas']);
        exit();
    }

    // Actualizar último acceso
    $updateQuery = "UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?";
    $updateStmt = $conexion->prepare($updateQuery);
    $updateStmt->bind_param("i", $user['id']);
    $updateStmt->execute();
    $updateStmt->close();

    $conexion->close();

    // Preparar datos para el token
    $tokenData = [
        'id' => $user['id'],
        'username' => $user['username'],
        'nombre' => $user['nombre'],
        'apellido' => $user['apellido'],
        'email' => $user['email'],
        'telefono' => $user['telefono'],
        'rol' => $user['rol'],
        'nombre_completo' => $user['nombre'] . ' ' . ($user['apellido'] ?: '')
    ];

    // Generar JWT
    $token = JWTAuth::generateToken($tokenData);

    echo json_encode([
        'success' => true,
        'message' => 'Login exitoso',
        'token' => $token,
        'user' => $tokenData
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
