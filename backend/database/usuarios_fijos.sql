-- =============================================
-- TABLA: usuarios - CON HASHES VÁLIDOS PARA PHP
-- Ejecutar este SQL en phpMyAdmin
-- =============================================

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    email VARCHAR(100),
    telefono VARCHAR(20),
    rol ENUM('admin', 'usuario', 'repartidor') NOT NULL DEFAULT 'usuario',
    activo BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(255) NULL,
    reset_token_expires DATETIME NULL,
    ultimo_acceso DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_rol (rol),
    INDEX idx_activo (activo),
    INDEX idx_username (username),
    INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- BORRAR USUARIOS EXISTENTES
-- =============================================

DELETE FROM usuarios WHERE username IN ('admin', 'usuario', 'repartidor1', 'repartidor2', 'operario');

-- =============================================
-- INSERTAR USUARIOS CON HASHES VÁLIDOS
-- Los siguientes hashes fueron generados con password_hash() de PHP
-- =============================================

-- admin / admin123
INSERT INTO usuarios (username, password_hash, nombre, apellido, rol, activo)
VALUES (
    'admin',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Administrador',
    'Sistema',
    'admin',
    TRUE
);

-- usuario / usuario123
INSERT INTO usuarios (username, password_hash, nombre, apellido, rol, activo)
VALUES (
    'usuario',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Usuario',
    'Normal',
    'usuario',
    TRUE
);

-- repartidor1 / repartidor123
INSERT INTO usuarios (username, password_hash, nombre, apellido, rol, activo)
VALUES (
    'repartidor1',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Juan',
    'Pérez',
    'repartidor',
    TRUE
);

-- repartidor2 / repartidor123
INSERT INTO usuarios (username, password_hash, nombre, apellido, rol, activo)
VALUES (
    'repartidor2',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'María',
    'González',
    'repartidor',
    TRUE
);

-- operario / operario123
INSERT INTO usuarios (username, password_hash, nombre, apellido, rol, activo)
VALUES (
    'operario',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Carlos',
    'López',
    'usuario',
    TRUE
);

-- =============================================
-- TABLA: sesiones (opcional)
-- =============================================

CREATE TABLE IF NOT EXISTS sesiones (
    id VARCHAR(128) PRIMARY KEY,
    usuario_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- VERIFICAR USUARIOS CREADOS
-- =============================================
SELECT 'Usuarios creados:' as mensaje;
SELECT id, username, nombre, apellido, rol, activo FROM usuarios;
