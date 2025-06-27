
#!/bin/bash

# SonicAdmin Lite - Script de instalación para Ubuntu Server 22.04
# Este script instala todas las dependencias necesarias para el panel de administración de radios

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si se ejecuta como root
if [[ $EUID -eq 0 ]]; then
   print_error "Este script no debe ejecutarse como root."
   print_warning "Por favor, cambia a un usuario normal con privilegios sudo:"
   echo -e "${YELLOW}   exit${NC}                    # Salir de root"
   echo -e "${YELLOW}   su - sonic${NC}              # Cambiar al usuario sonic"
   echo -e "${YELLOW}   cd ~/sonic-admin-lite${NC}   # Ir al directorio del proyecto"
   echo -e "${YELLOW}   ./install.sh${NC}            # Ejecutar el script"
   exit 1
fi

# Verificar que estemos en el directorio correcto
if [[ ! -f "package.json" ]] || [[ ! -f "install.sh" ]]; then
    print_error "No se encuentra en el directorio correcto del proyecto."
    print_warning "Asegúrate de estar en el directorio sonic-admin-lite"
    print_warning "Ejecuta: cd ~/sonic-admin-lite"
    exit 1
fi

# Banner
echo -e "${BLUE}"
echo "███████╗ ██████╗ ███╗   ██╗██╗ ██████╗     █████╗ ██████╗ ███╗   ███╗██╗███╗   ██╗"
echo "██╔════╝██╔═══██╗████╗  ██║██║██╔════╝    ██╔══██╗██╔══██╗████╗ ████║██║████╗  ██║"
echo "███████╗██║   ██║██╔██╗ ██║██║██║         ███████║██║  ██║██╔████╔██║██║██╔██╗ ██║"
echo "╚════██║██║   ██║██║╚██╗██║██║██║         ██╔══██║██║  ██║██║╚██╔╝██║██║██║╚██╗██║"
echo "███████║╚██████╔╝██║ ╚████║██║╚██████╗    ██║  ██║██████╔╝██║ ╚═╝ ██║██║██║ ╚████║"
echo "╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚═════╝    ╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝"
echo "██╗     ██╗████████╗███████╗"
echo "██║     ██║╚══██╔══╝██╔════╝"
echo "██║     ██║   ██║   █████╗  "
echo "██║     ██║   ██║   ██╔══╝  "
echo "███████╗██║   ██║   ███████╗"
echo "╚══════╝╚═╝   ╚═╝   ╚══════╝"
echo -e "${NC}"
echo "Panel de Administración de Radios - Instalador v1.1"
echo "=================================================================="
echo ""

# Verificar Ubuntu 22.04
if ! grep -q "Ubuntu 22.04" /etc/os-release; then
    print_warning "Este script está optimizado para Ubuntu 22.04."
    print_warning "Continuando con la instalación..."
fi

print_status "Iniciando instalación del SonicAdmin Lite..."

# Configurar instalación no interactiva
export DEBIAN_FRONTEND=noninteractive

# Actualizar sistema
print_status "Actualizando el sistema..."
sudo apt update -qq && sudo apt upgrade -y -qq

# Instalar dependencias del sistema
print_status "Instalando dependencias del sistema..."
sudo apt install -y -qq curl wget gnupg2 software-properties-common apt-transport-https ca-certificates git

# Instalar Node.js 18.x
print_status "Instalando Node.js 18.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y -qq nodejs
fi

# Verificar instalación de Node.js
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js instalado: $NODE_VERSION"
print_success "npm instalado: $NPM_VERSION"

# Instalar Apache2
print_status "Instalando Apache2..."
sudo apt install -y -qq apache2

# Configurar Apache2
print_status "Configurando Apache2..."
sudo systemctl enable apache2 >/dev/null 2>&1
sudo systemctl start apache2

# Configurar MySQL automáticamente
print_status "Configurando MySQL para instalación automática..."
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password SonicAdmin2024!'
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password SonicAdmin2024!'

# Instalar MySQL
print_status "Instalando MySQL Server..."
sudo apt install -y -qq mysql-server

# Configurar MySQL
print_status "Configurando MySQL..."
sudo systemctl enable mysql >/dev/null 2>&1
sudo systemctl start mysql

# Configuración automática de MySQL
print_status "Configurando seguridad de MySQL..."
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'SonicAdmin2024!';" 2>/dev/null || true
sudo mysql -u root -pSonicAdmin2024! -e "DELETE FROM mysql.user WHERE User='';" 2>/dev/null || true
sudo mysql -u root -pSonicAdmin2024! -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');" 2>/dev/null || true
sudo mysql -u root -pSonicAdmin2024! -e "DROP DATABASE IF EXISTS test;" 2>/dev/null || true
sudo mysql -u root -pSonicAdmin2024! -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';" 2>/dev/null || true
sudo mysql -u root -pSonicAdmin2024! -e "FLUSH PRIVILEGES;" 2>/dev/null || true

# Instalar PHP 8.1 (sin php8.1-json que no existe)
print_status "Instalando PHP 8.1 y extensiones..."
sudo apt install -y -qq php8.1 php8.1-cli php8.1-mysql php8.1-curl php8.1-mbstring php8.1-xml php8.1-zip libapache2-mod-php8.1

# Instalar Icecast2 de forma no interactiva
print_status "Instalando Icecast2..."
echo "icecast2 icecast2/icecast-setup boolean true" | sudo debconf-set-selections
echo "icecast2 icecast2/hostname string localhost" | sudo debconf-set-selections
echo "icecast2 icecast2/sourcepassword password SonicAdmin2024!" | sudo debconf-set-selections
echo "icecast2 icecast2/relaypassword password SonicAdmin2024!" | sudo debconf-set-selections
echo "icecast2 icecast2/adminpassword password SonicAdmin2024!" | sudo debconf-set-selections
sudo apt install -y -qq icecast2

# Configurar Icecast2
print_status "Configurando Icecast2..."
sudo systemctl enable icecast2 >/dev/null 2>&1

# Obtener el directorio actual del proyecto
CURRENT_DIR=$(pwd)
PROJECT_DIR="/var/www/sonic-admin-lite"

# Crear directorio para el proyecto
print_status "Creando directorio del proyecto en $PROJECT_DIR..."
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR

# Copiar archivos del proyecto actual
print_status "Copiando archivos del proyecto..."
sudo cp -r $CURRENT_DIR/* $PROJECT_DIR/
sudo chown -R $USER:www-data $PROJECT_DIR

# Instalar dependencias del frontend
print_status "Instalando dependencias del frontend..."
cd $PROJECT_DIR
npm install --silent

# Instalar dependencias del backend
print_status "Instalando dependencias del backend..."
cd $PROJECT_DIR/server
npm install --silent

# Cambiar puerto de Apache a 7000
print_status "Configurando Apache para puerto 7000..."
sudo sed -i 's/Listen 80/Listen 7000/' /etc/apache2/ports.conf
sudo sed -i 's/<VirtualHost \*:80>/<VirtualHost *:7000>/' /etc/apache2/sites-available/000-default.conf

# Configurar Apache Virtual Host
print_status "Configurando Apache Virtual Host..."
sudo tee /etc/apache2/sites-available/sonic-admin.conf > /dev/null << EOF
<VirtualHost *:7000>
    ServerName sonic-admin.local
    DocumentRoot $PROJECT_DIR/dist
    
    <Directory $PROJECT_DIR/dist>
        AllowOverride All
        Require all granted
        Options Indexes FollowSymLinks
        DirectoryIndex index.html
        
        # Configuración para SPA
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Proxy para API backend (puerto 3000)
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3000/api/
    ProxyPassReverse /api/ http://localhost:3000/api/

    ErrorLog \${APACHE_LOG_DIR}/sonic_admin_error.log
    CustomLog \${APACHE_LOG_DIR}/sonic_admin_access.log combined
</VirtualHost>
EOF

# Habilitar módulos de Apache
print_status "Habilitando módulos de Apache..."
sudo a2enmod rewrite >/dev/null 2>&1
sudo a2enmod proxy >/dev/null 2>&1
sudo a2enmod proxy_http >/dev/null 2>&1

# Habilitar el sitio
sudo a2ensite sonic-admin.conf >/dev/null 2>&1
sudo a2dissite 000-default.conf >/dev/null 2>&1

# Reiniciar Apache
sudo systemctl restart apache2

# Configurar firewall básico
print_status "Configurando firewall..."
sudo ufw allow 22/tcp >/dev/null 2>&1
sudo ufw allow 7000/tcp >/dev/null 2>&1
sudo ufw allow 3000/tcp >/dev/null 2>&1
sudo ufw allow 443/tcp >/dev/null 2>&1
sudo ufw allow 8000:8100/tcp >/dev/null 2>&1
sudo ufw --force enable >/dev/null 2>&1

# Crear base de datos y usuario
print_status "Creando base de datos..."
sudo mysql -u root -pSonicAdmin2024! << 'EOF'
CREATE DATABASE IF NOT EXISTS sonic_admin;
CREATE USER IF NOT EXISTS 'sonic_admin'@'localhost' IDENTIFIED BY 'SonicAdmin2024!';
GRANT ALL PRIVILEGES ON sonic_admin.* TO 'sonic_admin'@'localhost';
FLUSH PRIVILEGES;
EOF

# Inicializar esquema de base de datos
print_status "Inicializando esquema de base de datos..."
cd $PROJECT_DIR
mysql -u sonic_admin -pSonicAdmin2024! sonic_admin < database/schema.sql

# Crear archivo de configuración para el backend
print_status "Creando archivo de configuración del backend..."
cat > $PROJECT_DIR/server/.env << EOF
# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sonic_admin
DB_USER=sonic_admin
DB_PASS=SonicAdmin2024!

# Configuración del servidor
SERVER_PORT=3000
SERVER_HOST=0.0.0.0

# Rutas de los servidores de streaming
SHOUTCAST_PATH=/opt/shoutcast
ICECAST_PATH=/etc/icecast2

# Configuración de dominios
BASE_DOMAIN=localhost
ADMIN_EMAIL=admin@localhost

# Claves de seguridad (cambiar en producción)
JWT_SECRET=supersecretkey123456789
API_KEY=sonic_admin_api_key_2024

# Configuración SMTP (opcional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Icecast2 passwords
ICECAST_SOURCE_PASSWORD=SonicAdmin2024!
ICECAST_RELAY_PASSWORD=SonicAdmin2024!
ICECAST_ADMIN_PASSWORD=SonicAdmin2024!
EOF

# Crear archivo de configuración para el frontend
print_status "Creando archivo de configuración del frontend..."
cat > $PROJECT_DIR/.env << EOF
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=SonicAdmin Lite
VITE_APP_VERSION=1.0.0
EOF

# Construir el proyecto frontend
print_status "Construyendo el proyecto para producción..."
cd $PROJECT_DIR
npm run build --silent

# Configurar permisos
print_status "Configurando permisos..."
sudo chown -R $USER:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR
sudo chmod 600 $PROJECT_DIR/.env
sudo chmod 600 $PROJECT_DIR/server/.env

# Crear servicio systemd para el backend
print_status "Creando servicio systemd para el backend..."
sudo tee /etc/systemd/system/sonic-admin-backend.service > /dev/null << EOF
[Unit]
Description=SonicAdmin Lite Backend API
After=network.target mysql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR/server
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Crear servicio systemd para el frontend (desarrollo)
sudo tee /etc/systemd/system/sonic-admin-frontend.service > /dev/null << EOF
[Unit]
Description=SonicAdmin Lite Frontend Development Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=development
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port 3001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Recargar systemd y habilitar servicios
sudo systemctl daemon-reload
sudo systemctl enable sonic-admin-backend >/dev/null 2>&1
sudo systemctl start sonic-admin-backend

# Mostrar información final
print_success "¡Instalación completada!"
echo ""
echo "=================================================================="
echo -e "${GREEN}INFORMACIÓN DE ACCESO:${NC}"
echo "=================================================================="
echo "• URL del Panel: http://$(hostname -I | awk '{print $1}'):7000"
echo "• Usuario: admin"
echo "• Contraseña: admin123"
echo ""
echo "• API Backend: http://$(hostname -I | awk '{print $1}'):3000/api"
echo "• MySQL Root Password: SonicAdmin2024!"
echo "• Icecast Admin Password: SonicAdmin2024!"
echo "• Directorio del proyecto: $PROJECT_DIR"
echo ""
echo "=================================================================="
echo -e "${GREEN}SERVICIOS INSTALADOS:${NC}"
echo "=================================================================="
echo "• Apache2 (Puerto 7000): $(systemctl is-active apache2)"
echo "• MySQL: $(systemctl is-active mysql)"
echo "• Icecast2: $(systemctl is-active icecast2)"
echo "• Backend API: $(systemctl is-active sonic-admin-backend)"
echo ""
echo "=================================================================="
echo -e "${YELLOW}PRÓXIMOS PASOS:${NC}"
echo "=================================================================="
echo "1. Accede al panel web en http://$(hostname -I | awk '{print $1}'):7000"
echo "2. Inicia sesión con: admin / admin123"
echo "3. Configura los ajustes del servidor en Settings"
echo "4. ¡Comienza a gestionar radios!"
echo ""
echo -e "${YELLOW}COMANDOS ÚTILES:${NC}"
echo "• Ver estado de servicios: sudo systemctl status sonic-admin-backend"
echo "• Ver logs del backend: sudo journalctl -u sonic-admin-backend -f"
echo "• Ver logs de Apache: sudo tail -f /var/log/apache2/sonic_admin_error.log"
echo "• Reiniciar backend: sudo systemctl restart sonic-admin-backend"
echo "• Reiniciar Apache: sudo systemctl restart apache2"
echo ""
print_success "¡SonicAdmin Lite con backend completo está listo en el puerto 7000!"
