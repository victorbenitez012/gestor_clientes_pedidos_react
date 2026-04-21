<?php
/**
 * Middleware de autenticación - Soporta JWT y Sesiones PHP
 * Incluir este archivo al inicio de cada endpoint protegido
 *
 * Uso:
 *   require_once __DIR__ . '/../auth/middleware.php';
 *   $auth = requireAuth(); // Retorna datos del usuario o false
 *   $auth = requireAuth(['admin']); // Solo permite admin
 */

require_once __DIR__ . '/jwt_helper.php';

// Iniciar sesión si no está iniciada (para compatibilidad con endpoints que usan sesiones)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Verificar autenticación (JWT primero, luego sesión)
 *
 * @param array|string|null $roles - Rol(es) requeridos (opcional)
 * @return array|bool - Datos del usuario o false si no está autenticado
 */
function requireAuth($roles = null) {
    // Primero intentar JWT (nuevo sistema)
    $jwtUser = getJWTUser();

    if ($jwtUser) {
        $user = $jwtUser;
    }
    // Si no hay JWT, verificar sesión PHP (sistema legacy)
    else if (isset($_SESSION['user_id'])) {
        $user = [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'rol' => $_SESSION['rol'],
            'nombre' => $_SESSION['nombre']
        ];
    }
    // No autenticado
    else {
        http_response_code(401);
        echo json_encode(['error' => 'No autorizado', 'message' => 'Debe iniciar sesión']);
        exit();
    }

    // Verificar roles si se especificaron
    if ($roles !== null) {
        $rolesArray = is_array($roles) ? $roles : [$roles];

        if (!isset($user['rol']) || !in_array($user['rol'], $rolesArray)) {
            http_response_code(403);
            echo json_encode([
                'error' => 'Acceso denegado',
                'message' => 'No tiene permisos para esta acción',
                'rol_requerido' => $rolesArray,
                'rol_actual' => $user['rol'] ?? 'none'
            ]);
            exit();
        }
    }

    return $user;
}

/**
 * Verificar si el usuario está autenticado sin detener la ejecución
 *
 * @return array|null - Datos del usuario o null
 */
function checkAuth() {
    // Primero intentar JWT
    $jwtUser = getJWTUser();
    if ($jwtUser) {
        return $jwtUser;
    }

    // Luego sesión
    if (isset($_SESSION['user_id'])) {
        return [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'rol' => $_SESSION['rol'],
            'nombre' => $_SESSION['nombre']
        ];
    }

    return null;
}

/**
 * Verificar si el usuario es admin
 *
 * @return bool
 */
function isAdmin() {
    $user = checkAuth();
    return $user && $user['rol'] === 'admin';
}

/**
 * Obtener el rol del usuario actual
 *
 * @return string|null
 */
function getCurrentRole() {
    $user = checkAuth();
    return $user['rol'] ?? null;
}

/**
 * Obtener el ID del usuario actual
 *
 * @return int|null
 */
function getCurrentUserId() {
    $user = checkAuth();
    return $user['id'] ?? null;
}
