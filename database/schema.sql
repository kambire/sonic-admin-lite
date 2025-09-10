
-- SonicAdmin Lite Database Schema
-- Para Ubuntu 22.04 con MySQL 8.0

CREATE DATABASE IF NOT EXISTS sonic_admin;
USE sonic_admin;

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'superadmin') DEFAULT 'admin',
    status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    status ENUM('active', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de planes
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) NOT NULL,
    disk_space INT NOT NULL COMMENT 'GB',
    listeners INT NOT NULL,
    bitrate INT NOT NULL COMMENT 'kbps',
    price DECIMAL(10,2) NOT NULL COMMENT 'monthly price',
    features JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de radios
CREATE TABLE IF NOT EXISTS radios (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    client_id VARCHAR(36) NOT NULL,
    plan_id VARCHAR(36) NOT NULL,
    server_type ENUM('shoutcast', 'icecast') NOT NULL,
    port INT UNIQUE NOT NULL,
    status ENUM('active', 'suspended', 'offline') DEFAULT 'active',
    listeners INT DEFAULT 0,
    max_listeners INT NOT NULL,
    has_auto_dj BOOLEAN DEFAULT FALSE,
    stream_url VARCHAR(255),
    config_path VARCHAR(255),
    pid_file VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_online TIMESTAMP NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
);

-- Tabla de logs del sistema
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level ENUM('info', 'warning', 'error', 'success') NOT NULL,
    message TEXT NOT NULL,
    details JSON,
    user_id VARCHAR(36),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX idx_radios_client_id ON radios(client_id);
CREATE INDEX idx_radios_plan_id ON radios(plan_id);
CREATE INDEX idx_radios_status ON radios(status);
CREATE INDEX idx_radios_port ON radios(port);
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);

-- Insertar usuario administrador por defecto (hash de 'admin123')
INSERT INTO admin_users (username, email, password_hash, role, status) 
VALUES ('admin', 'admin@localhost', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin', 'active')
ON DUPLICATE KEY UPDATE username=username;

-- Insertar datos de ejemplo
INSERT INTO plans (name, disk_space, listeners, bitrate, price, features, is_active) VALUES
('Básico', 5, 50, 128, 19.99, '["Streaming 24/7", "Panel de control", "Estadísticas básicas"]', TRUE),
('Profesional', 20, 200, 320, 49.99, '["Streaming 24/7", "AutoDJ incluido", "Estadísticas avanzadas", "API access"]', TRUE),
('Enterprise', 100, 1000, 320, 149.99, '["Streaming 24/7", "AutoDJ Premium", "CDN global", "Soporte prioritario", "White label"]', TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- Insertar clientes de ejemplo
INSERT INTO clients (name, email, phone, status) VALUES
('Radio Música FM', 'contacto@radiomusica.com', '+34 666 123 456', 'active'),
('Beats Online', 'info@beatsonline.net', '+34 677 987 654', 'active'),
('Radio Clásica', 'admin@radioclasica.es', '+34 688 456 789', 'suspended')
ON DUPLICATE KEY UPDATE name=name;
