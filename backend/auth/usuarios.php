<?php
/**
 * CRUD de Usuarios (solo admin)
 * Métodos: GET (listar), POST (crear), PUT (actualizar), DELETE (eliminar)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/jwt_helper.php';

// Solo admin puede gestionar usuarios
$currentUser = requireJWTAuth(['admin']);

$method = $_SERVER['REQUEST_METHOD'];
$conexion = conectarBD();

try {
    switch ($method) {
        case 'GET':
            // Listar usuarios (excluyendo password_hash)
            $query = "SELECT id, username, nombre, apellido, email, telefono, rol, activo, ultimo_acceso, created_at
                      FROM usuarios
                      ORDER BY created_at DESC";
            $result = $conexion->query($query);

            $usuarios = [];
            while ($row = $result->fetch_assoc()) {
                $usuarios[] = [
                    'id' => (int)$row['id'],
                    'username' => $row['username'],
                    'nombre' => $row['nombre'],
                    'apellido' => $row['apellido'],
                    'email' => $row['email'],
                    'telefono' => $row['telefono'],
                    'rol' => $row['rol'],
                    'activo' => (bool)$row['activo'],
                    'ultimo_acceso' => $row['ultimo_acceso'],
                    'created_at' => $row['created_at'],
                    'nombre_completo' => $row['nombre'] . ' ' . ($row['apellido'] ?: '')
                ];
            }

            echo json_encode(['success' => true, 'usuarios' => $usuarios]);
            break;

        case 'POST':
            // Crear usuario
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
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

            // Validar rol
            if (!in_array($data['rol'], ['admin', 'usuario', 'repartidor'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Rol no válido']);
                exit();
            }

            // Verificar username único
            $checkQuery = "SELECT id FROM usuarios WHERE username = ?";
            $checkStmt = $conexion->prepare($checkQuery);
            $checkStmt->bind_param("s", $data['username']);
            $checkStmt->execute();
            if ($checkStmt->get_result()->num_rows > 0) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'El nombre de usuario ya existe']);
                exit();
            }
            $checkStmt->close();

            // Crear usuario
            $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
            $email = $data['email'] ?? null;
            $telefono = $data['telefono'] ?? null;
            $apellido = $data['apellido'] ?? '';

            $insertQuery = "INSERT INTO usuarios (username, password_hash, nombre, apellido, email, telefono, rol, activo)
                           VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)";
            $insertStmt = $conexion->prepare($insertQuery);
            $insertStmt->bind_param("sssssss",
                $data['username'],
                $passwordHash,
                $data['nombre'],
                $apellido,
                $email,
                $telefono,
                $data['rol']
            );

            if ($insertStmt->execute()) {
                $userId = $insertStmt->insert_id;
                echo json_encode([
                    'success' => true,
                    'message' => 'Usuario creado correctamente',
                    'user' => [
                        'id' => $userId,
                        'username' => $data['username'],
                        'nombre' => $data['nombre'],
                        'apellido' => $apellido,
                        'rol' => $data['rol']
                    ]
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Error al crear usuario']);
            }
            $insertStmt->close();
            break;

        case 'PUT':
            // Actualizar usuario
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data || empty($data['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID de usuario requerido']);
                exit();
            }

            // No permitir modificar el usuario admin principal
            if ($data['id'] == 1) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'No se puede modificar el usuario administrador principal']);
                exit();
            }

            $allowedFields = ['nombre', 'apellido', 'email', 'telefono', 'rol', 'activo'];
            $updates = [];
            $params = [];
            $types = '';

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updates[] = "$field = ?";
                    $params[] = $data[$field];
                    $types .= is_bool($data[$field]) ? 'i' : 's';
                }
            }

            if (empty($updates)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'No hay campos para actualizar']);
                exit();
            }

            // Actualizar password si se proporciona
            if (!empty($data['password'])) {
                $updates[] = "password_hash = ?";
                $params[] = password_hash($data['password'], PASSWORD_BCRYPT);
                $types .= 's';
            }

            $params[] = $data['id'];
            $types .= 'i';

            $updateQuery = "UPDATE usuarios SET " . implode(', ', $updates) . " WHERE id = ?";
            $updateStmt = $conexion->prepare($updateQuery);
            $updateStmt->bind_param($types, ...$params);

            if ($updateStmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Usuario actualizado correctamente'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Error al actualizar usuario']);
            }
            $updateStmt->close();
            break;

        case 'DELETE':
            // Eliminar usuario (desactivar)
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data || empty($data['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID de usuario requerido']);
                exit();
            }

            // No permitir eliminar el usuario admin principal
            if ($data['id'] == 1) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'No se puede eliminar el usuario administrador principal']);
                exit();
            }

            // No permitir eliminarse a sí mismo
            if ($data['id'] == $currentUser['id']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'No puedes eliminar tu propio usuario']);
                exit();
            }

            // Desactivar usuario (soft delete)
            $deleteQuery = "UPDATE usuarios SET activo = FALSE WHERE id = ?";
            $deleteStmt = $conexion->prepare($deleteQuery);
            $deleteStmt->bind_param("i", $data['id']);

            if ($deleteStmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Usuario eliminado correctamente'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Error al eliminar usuario']);
            }
            $deleteStmt->close();
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    }

    $conexion->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
