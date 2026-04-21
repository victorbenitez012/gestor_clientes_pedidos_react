-- =============================================
-- ACTUALIZACIÓN: Agregar campos para recuperación de contraseña
-- y más usuarios de prueba
-- =============================================

-- Agregar columnas para recuperación de contraseña
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME NULL,
ADD INDEX IF NOT EXISTS idx_reset_token (reset_token);

-- =============================================
-- USUARIOS DE PRUEBA ADICIONALES
-- =============================================

-- Repartidor 1
INSERT IGNORE INTO usuarios (username, password_hash, nombre, apellido, email, telefono, rol, activo)
VALUES (
    'repartidor1',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- repartidor123
    'Juan',
    'Pérez',
    'repartidor1@example.com',
    '5491122334455',
    'repartidor',
    TRUE
);

-- Repartidor 2
INSERT IGNORE INTO usuarios (username, password_hash, nombre, apellido, email, telefono, rol, activo)
VALUES (
    'repartidor2',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- repartidor123
    'María',
    'González',
    'repartidor2@example.com',
    '5491166778899',
    'repartidor',
    TRUE
);

-- Usuario operario
INSERT IGNORE INTO usuarios (username, password_hash, nombre, apellido, email, telefono, rol, activo)
VALUES (
    'operario',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- operario123
    'Carlos',
    'López',
    'operario@example.com',
    '5491133445566',
    'usuario',
    TRUE
);

-- =============================================
-- RESUMEN DE USUARIOS DISPONIBLES
-- =============================================
-- admin / admin123           (rol: admin)
-- usuario / usuario123       (rol: usuario)
-- repartidor1 / repartidor123 (rol: repartidor)
-- repartidor2 / repartidor123 (rol: repartidor)
-- operario / operario123     (rol: usuario)
-- =============================================

SELECT 'Usuarios creados:' as mensaje;
SELECT username, nombre, apellido, rol, activo FROM usuarios WHERE activo = TRUE;
