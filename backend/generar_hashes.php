<?php
/**
 * Genera hashes válidos para el archivo SQL de usuarios
 * Abrir: http://localhost/gestor_clientes_pedidos_react/backend/generar_hashes.php
 */

header('Content-Type: text/plain; charset=utf-8');

echo "-- =============================================\n";
echo "-- TABLA: usuarios\n";
echo "-- Sistema de autenticación independiente\n";
echo "-- GENERADO AUTOMÁTICAMENTE - Hash válidos para PHP\n";
echo "-- =============================================\n\n";

echo "CREATE TABLE IF NOT EXISTS usuarios (\n";
echo "    id INT AUTO_INCREMENT PRIMARY KEY,\n";
echo "    username VARCHAR(50) NOT NULL UNIQUE,\n";
echo "    password_hash VARCHAR(255) NOT NULL,\n";
echo "    nombre VARCHAR(100) NOT NULL,\n";
echo "    apellido VARCHAR(100),\n";
echo "    email VARCHAR(100),\n";
echo "    telefono VARCHAR(20),\n";
echo "    rol ENUM('admin', 'usuario', 'repartidor') NOT NULL DEFAULT 'usuario',\n";
echo "    activo BOOLEAN DEFAULT TRUE,\n";
echo "    reset_token VARCHAR(255) NULL,\n";
echo "    reset_token_expires DATETIME NULL,\n";
echo "    ultimo_acceso DATETIME NULL,\n";
echo "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n";
echo "    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n";
echo "\n";
echo "    INDEX idx_rol (rol),\n";
echo "    INDEX idx_activo (activo),\n";
echo "    INDEX idx_username (username),\n";
echo "    INDEX idx_reset_token (reset_token)\n";
echo ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n";

// Generar hashes válidos
$usuarios = [
    ['admin', 'admin123', 'Administrador', 'Sistema', 'admin'],
    ['usuario', 'usuario123', 'Usuario', 'Normal', 'usuario'],
    ['repartidor1', 'repartidor123', 'Juan', 'Pérez', 'repartidor'],
    ['repartidor2', 'repartidor123', 'María', 'González', 'repartidor'],
    ['operario', 'operario123', 'Carlos', 'López', 'usuario'],
];

echo "-- =============================================\n";
echo "-- USUARIOS CON HASHES VÁLIDOS\n";
echo "-- =============================================\n\n";

echo "-- Limpiar usuarios existentes\n";
echo "DELETE FROM usuarios WHERE username IN ('" . implode("', '", array_column($usuarios, 0)) . "');\n\n";

echo "-- Insertar usuarios\n";
foreach ($usuarios as $u) {
    $hash = password_hash($u[1], PASSWORD_BCRYPT);
    echo "INSERT INTO usuarios (username, password_hash, nombre, apellido, rol, activo) VALUES\n";
    echo "('{$u[0]}', '{$hash}', '{$u[2]}', '{$u[3]}', '{$u[4]}', TRUE);\n";
    echo "-- Contraseña: {$u[1]}\n\n";
}

echo "-- =============================================\n";
echo "-- TABLA: sesiones (opcional)\n";
echo "-- =============================================\n\n";

echo "CREATE TABLE IF NOT EXISTS sesiones (\n";
echo "    id VARCHAR(128) PRIMARY KEY,\n";
echo "    usuario_id INT NOT NULL,\n";
echo "    ip_address VARCHAR(45),\n";
echo "    user_agent TEXT,\n";
echo "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n";
echo "    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n";
echo "    expires_at TIMESTAMP NOT NULL,\n";
echo "\n";
echo "    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,\n";
echo "    INDEX idx_expires (expires_at)\n";
echo ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n";

echo "\n\n-- =============================================\n";
echo "-- INSTRUCCIONES:\n";
echo "-- 1. Copia TODO el contenido de arriba\n";
echo "-- 2. Ve a phpMyAdmin\n";
echo "-- 3. Selecciona tu base de datos\n";
echo "-- 4. Ve a la pestaña SQL\n";
echo "-- 5. Pega el contenido y ejecuta\n";
echo "-- =============================================\n";
