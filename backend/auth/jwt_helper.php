<?php
/**
 * Helper para manejo de Tokens JWT
 *
 * Requiere: composer require firebase/php-jwt
 * O usar implementación simple si no hay composer
 */

// Si tienes composer:
// require_once __DIR__ . '/../vendor/autoload.php';
// use Firebase\JWT\JWT;
// use Firebase\JWT\Key;

// Implementación simple sin dependencias externas
class JWTAuth {
    private static $secret_key = 'tu_clave_secreta_cambiar_en_produccion_2025';
    private static $encrypt_method = 'HS256';
    private static $token_expiration = 86400; // 24 horas en segundos

    /**
     * Generar token JWT
     *
     * @param array $data Datos a incluir en el token
     * @return string Token JWT
     */
    public static function generateToken($data) {
        $issuedAt = time();
        $expiration = $issuedAt + self::$token_expiration;

        $header = json_encode([
            'typ' => 'JWT',
            'alg' => self::$encrypt_method
        ]);

        $payload = json_encode([
            'iat' => $issuedAt,
            'exp' => $expiration,
            'data' => $data
        ]);

        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::$secret_key, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    /**
     * Validar y decodificar token JWT
     *
     * @param string $token Token JWT
     * @return array|false Datos del token o false si es inválido
     */
    public static function validateToken($token) {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return false;
        }

        $base64Header = $parts[0];
        $base64Payload = $parts[1];
        $base64Signature = $parts[2];

        // Verificar firma
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::$secret_key, true);
        $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        if (!hash_equals($expectedSignature, $base64Signature)) {
            return false;
        }

        // Decodificar payload
        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64Payload)), true);

        if (!$payload || !isset($payload['exp'])) {
            return false;
        }

        // Verificar expiración
        if ($payload['exp'] < time()) {
            return false;
        }

        return $payload['data'];
    }

    /**
     * Obtener token del header Authorization
     *
     * @return string|false Token o false
     */
    public static function getBearerToken() {
        $headers = getallheaders();

        if (isset($headers['Authorization'])) {
            $auth = $headers['Authorization'];
            if (strpos($auth, 'Bearer ') === 0) {
                return substr($auth, 7);
            }
        }

        // También buscar en $_SERVER
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $auth = $_SERVER['HTTP_AUTHORIZATION'];
            if (strpos($auth, 'Bearer ') === 0) {
                return substr($auth, 7);
            }
        }

        return false;
    }

    /**
     * Generar token de recuperación (expira en 1 hora)
     */
    public static function generateResetToken($userId) {
        $issuedAt = time();
        $expiration = $issuedAt + 3600; // 1 hora

        $header = json_encode([
            'typ' => 'JWT',
            'alg' => self::$encrypt_method
        ]);

        $payload = json_encode([
            'iat' => $issuedAt,
            'exp' => $expiration,
            'type' => 'password_reset',
            'user_id' => $userId
        ]);

        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::$secret_key, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    /**
     * Validar token de recuperación
     */
    public static function validateResetToken($token) {
        $data = self::validateToken($token);

        if (!$data || !isset($data['type']) || $data['type'] !== 'password_reset') {
            return false;
        }

        return $data;
    }
}

/**
 * Funciones helper para el middleware
 */
function getJWTUser() {
    $token = JWTAuth::getBearerToken();

    if (!$token) {
        return null;
    }

    return JWTAuth::validateToken($token);
}

function requireJWTAuth($roles = null) {
    $user = getJWTUser();

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'No autorizado',
            'message' => 'Token inválido o expirado'
        ]);
        exit();
    }

    if ($roles !== null) {
        $rolesArray = is_array($roles) ? $roles : [$roles];

        if (!isset($user['rol']) || !in_array($user['rol'], $rolesArray)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
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
