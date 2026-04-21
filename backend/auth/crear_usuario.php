<?php
/**
 * Script para crear nuevos usuarios
 * Método: POST
 * Body: { username, password, nombre, apellido, email?, telefono?, rol? }
 *
 * IMPORTANTE: Este endpoint debería estar protegido y solo permitir admin
 * en producción. Por ahora no requiere autenticación para facilitar la creación
 * del primer usuario.
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

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos JSON inválidos']);
    exit();
}

// Validar campos requeridos
$required = ['username', 'password', 'nombre', 'rol'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Campo requerido: {$field}"]);
        exit();
    }
}

$username = trim($data['username']);
$password = $data['password'];
$nombre = trim($data['nombre']);
$apellido = isset($data['apellido']) ? trim($data['apellido']) : '';
$email = isset($data['email']) ? trim($data['email']) : null;
$telefono = isset($data['telefono']) ? trim($data['telefono']) : null;
$rol = $data['rol'];

// Validar rol
$rolesPermitidos = ['admin', 'usuario', 'repartidor'];
if (!in_array($rol, $rolesPermitidos)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Rol no válido']);
    exit();
}

// Validar longitud de contraseña
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 6 caracteres']);
    exit();
}

try {
    $conexion = conectarBD();

    // Verificar si el username ya existe
    $checkQuery = "SELECT id FROM usuarios WHERE username = ?";
    $checkStmt = $conexion->prepare($checkQuery);
    $checkStmt->bind_param("s", $username);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        http_response_code(409); // Conflict
        echo json_encode(['success' => false, 'message' => 'El nombre de usuario ya existe']);
        exit();
    }
    $checkStmt->close();

    // Hash de la contraseña
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    // Insertar usuario
    $insertQuery = "INSERT INTO usuarios (username, password_hash, nombre, apellido, email, telefono, rol, activo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)";

    $insertStmt = $conexion->prepare($insertQuery);
    $insertStmt->bind_param("sssssss", $username, $password_hash, $nombre, $apellido, $email, $telefono, $rol);

    if ($insertStmt->execute()) {
        $userId = $insertStmt->insert_id;
        echo json_encode([
            'success' => true,
            'message' => 'Usuario creado exitosamente',
            'user' => [
                'id' => $userId,
                'username' => $username,
                'nombre' => $nombre,
                'apellido' => $apellido,
                'rol' => $rol
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al crear usuario: ' . $insertStmt->error]);
    }

    $insertStmt->close();
    $conexion->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
?>