-- =============================================
-- TABLA: usuarios
-- Sistema de autenticación independiente
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
    ultimo_acceso DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Índices para búsquedas frecuentes
    INDEX idx_rol (rol),
    INDEX idx_activo (activo),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- USUARIO ADMIN POR DEFECTO
-- Username: admin
-- Password: admin123
-- =============================================

-- Primero verificamos si ya existe
DELETE FROM usuarios WHERE username = 'admin';

-- Insertar usuario admin (cambiar contraseña en producción)
INSERT INTO usuarios (username, password_hash, nombre, apellido, rol, activo)
VALUES (
    'admin',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'Administrador',
    'Sistema',
    'admin',
    TRUE
);

-- =============================================
-- USUARIO DE PRUEBA (opcional)
-- Username: usuario
-- Password: usuario123
-- =============================================

DELETE FROM usuarios WHERE username = 'usuario';

INSERT INTO usuarios (username, password_hash, nombre, apellido, rol, activo)
VALUES (
    'usuario',
    '$2y$10$h4kFS8k.M8yP.Loy8d1zzeUNdMPGH4rzhQjG9gKaXRUFzJ9xJQ/6a', -- usuario123
    'Usuario',
    'Normal',
    'usuario',
    TRUE
);

-- =============================================
-- TABLA: sesiones (opcional - para manejo de tokens)
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
