<?php
/**
 * Login - Autenticación de usuarios
 * Método: POST
 * Body: { username: string, password: string }
 * Response: { success: boolean, user?: object, token?: string, message?: string }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000'); // Cambiar según tu frontend
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

// Incluir conexión
require_once __DIR__ . '/../conexion.php';

// Obtener datos del body
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos JSON inválidos']);
    exit();
}

$username = isset($data['username']) ? trim($data['username']) : '';
$password = isset($data['password']) ? $data['password'] : '';

// Validar campos requeridos
if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Usuario y contraseña son requeridos']);
    exit();
}

try {
    $conexion = conectarBD();

    // Buscar usuario por username
    $query = "SELECT id, username, password_hash, nombre, apellido, rol, activo
              FROM usuarios
              WHERE username = ?";

    $stmt = $conexion->prepare($query);

    if (!$stmt) {
        throw new Exception("Error preparando consulta: " . $conexion->error);
    }

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

    // Verificar si el usuario está activo
    if (!$user['activo']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Usuario desactivado']);
        exit();
    }

    // Verificar contraseña con password_verify
    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Credenciales inválidas']);
        exit();
    }

    // Iniciar sesión
    session_start();
    session_regenerate_id(true); // Prevenir session fixation

    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['rol'] = $user['rol'];
    $_SESSION['nombre'] = $user['nombre'];

    // Actualizar último acceso
    $updateQuery = "UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?";
    $updateStmt = $conexion->prepare($updateQuery);
    $updateStmt->bind_param("i", $user['id']);
    $updateStmt->execute();
    $updateStmt->close();

    $conexion->close();

    // Generar token simple (opcional, para APIs stateless)
    $token = bin2hex(random_bytes(32));

    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Login exitoso',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'nombre' => $user['nombre'],
            'apellido' => $user['apellido'],
            'rol' => $user['rol'],
            'nombre_completo' => $user['nombre'] . ' ' . ($user['apellido'] ?: '')
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
?>