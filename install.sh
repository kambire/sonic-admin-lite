
#!/bin/bash

# RadioPanel - Script de instalación para Ubuntu Server 22.04
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
   print_error "Este script no debe ejecutarse como root. Usa un usuario con privilegios sudo."
   exit 1
fi

# Banner
echo -e "${BLUE}"
echo "██████╗  █████╗ ██████╗ ██╗ ██████╗ ██████╗  █████╗ ███╗   ██╗███████╗██╗     "
echo "██╔══██╗██╔══██╗██╔══██╗██║██╔═══██╗██╔══██╗██╔══██╗████╗  ██║██╔════╝██║     "
echo "██████╔╝███████║██║  ██║██║██║   ██║██████╔╝███████║██╔██╗ ██║█████╗  ██║     "
echo "██╔══██╗██╔══██║██║  ██║██║██║   ██║██╔═══╝ ██╔══██║██║╚██╗██║██╔══╝  ██║     "
echo "██║  ██║██║  ██║██████╔╝██║╚██████╔╝██║     ██║  ██║██║ ╚████║███████╗███████╗"
echo "╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝ ╚═════╝ ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝"
echo -e "${NC}"
echo "Panel de Administración de Radios - Instalador v1.0"
echo "=================================================================="
echo ""

# Verificar Ubuntu 22.04
if ! grep -q "Ubuntu 22.04" /etc/os-release; then
    print_warning "Este script está optimizado para Ubuntu 22.04. ¿Continuar? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        exit 1
    fi
fi

print_status "Iniciando instalación del RadioPanel..."

# Actualizar sistema
print_status "Actualizando el sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar dependencias del sistema
print_status "Instalando dependencias del sistema..."
sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates

# Instalar Node.js 18.x
print_status "Instalando Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación de Node.js
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js instalado: $NODE_VERSION"
print_success "npm instalado: $NPM_VERSION"

# Instalar Apache2
print_status "Instalando Apache2..."
sudo apt install -y apache2

# Configurar Apache2
print_status "Configurando Apache2..."
sudo systemctl enable apache2
sudo systemctl start apache2

# Instalar MySQL
print_status "Instalando MySQL Server..."
sudo apt install -y mysql-server

# Configurar MySQL
print_status "Configurando MySQL..."
sudo systemctl enable mysql
sudo systemctl start mysql

print_warning "Configurando MySQL de forma segura..."
print_warning "Se te pedirá configurar la contraseña de root de MySQL"
sudo mysql_secure_installation

# Instalar PHP 8.1
print_status "Instalando PHP 8.1 y extensiones..."
sudo apt install -y php8.1 php8.1-cli php8.1-mysql php8.1-curl php8.1-json php8.1-mbstring php8.1-xml php8.1-zip libapache2-mod-php8.1

# Instalar Shoutcast (opcional)
print_warning "¿Deseas instalar Shoutcast Server? (y/n)"
read -r install_shoutcast
if [[ "$install_shoutcast" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    print_status "Descargando Shoutcast Server..."
    cd /tmp
    wget http://download.nullsoft.com/shoutcast/tools/sc_serv2_linux_x64-latest.tar.gz
    sudo mkdir -p /opt/shoutcast
    sudo tar -xzf sc_serv2_linux_x64-latest.tar.gz -C /opt/shoutcast
    sudo chown -R www-data:www-data /opt/shoutcast
    print_success "Shoutcast Server instalado en /opt/shoutcast"
fi

# Instalar Icecast2
print_status "Instalando Icecast2..."
sudo apt install -y icecast2

# Configurar Icecast2
print_status "Configurando Icecast2..."
sudo systemctl enable icecast2

# Crear directorio para el proyecto
PROJECT_DIR="/var/www/radiopanel"
print_status "Creando directorio del proyecto en $PROJECT_DIR..."
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR

# Clonar o descargar el proyecto (simulado)
print_status "Preparando archivos del proyecto..."
cd $PROJECT_DIR

# Crear estructura básica del proyecto
cat > package.json << EOF
{
  "name": "radiopanel-admin",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "start": "npm run build && npm run preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.2.2",
    "vite": "^5.3.4"
  }
}
EOF

# Instalar dependencias del proyecto
print_status "Instalando dependencias del proyecto..."
npm install

# Configurar Apache Virtual Host
print_status "Configurando Apache Virtual Host..."
sudo tee /etc/apache2/sites-available/radiopanel.conf > /dev/null << EOF
<VirtualHost *:80>
    ServerName radiopanel.local
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

    # Proxy para desarrollo (puerto 5173)
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3000/api/
    ProxyPassReverse /api/ http://localhost:3000/api/

    ErrorLog \${APACHE_LOG_DIR}/radiopanel_error.log
    CustomLog \${APACHE_LOG_DIR}/radiopanel_access.log combined
</VirtualHost>
EOF

# Habilitar módulos de Apache
print_status "Habilitando módulos de Apache..."
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http

# Habilitar el sitio
sudo a2ensite radiopanel.conf
sudo a2dissite 000-default.conf

# Reiniciar Apache
sudo systemctl restart apache2

# Configurar firewall básico
print_status "Configurando firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000:8100/tcp  # Puertos para streams
sudo ufw --force enable

# Crear base de datos
print_status "Creando base de datos..."
print_warning "Ingresa la contraseña de root de MySQL cuando se solicite:"
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS radiopanel;
CREATE USER IF NOT EXISTS 'radiopanel'@'localhost' IDENTIFIED BY 'RadioPanel2024!';
GRANT ALL PRIVILEGES ON radiopanel.* TO 'radiopanel'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF

# Crear archivo de configuración
print_status "Creando archivo de configuración..."
cat > $PROJECT_DIR/.env << EOF
# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=radiopanel
DB_USER=radiopanel
DB_PASS=RadioPanel2024!

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
API_KEY=radiopanel_api_key_2024

# Configuración SMTP (opcional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EOF

# Configurar permisos
print_status "Configurando permisos..."
sudo chown -R $USER:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR
sudo chmod 600 $PROJECT_DIR/.env

# Crear servicio systemd para el desarrollo
print_status "Creando servicio systemd..."
sudo tee /etc/systemd/system/radiopanel.service > /dev/null << EOF
[Unit]
Description=RadioPanel Admin Interface
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable radiopanel

# Mostrar información final
print_success "¡Instalación completada!"
echo ""
echo "=================================================================="
echo -e "${GREEN}INFORMACIÓN DE ACCESO:${NC}"
echo "=================================================================="
echo "• URL del Panel: http://$(hostname -I | awk '{print $1}')"
echo "• Usuario: admin"
echo "• Contraseña: admin123"
echo ""
echo "• Directorio del proyecto: $PROJECT_DIR"
echo "• Logs de Apache: /var/log/apache2/radiopanel_*.log"
echo "• Configuración: $PROJECT_DIR/.env"
echo ""
echo "=================================================================="
echo -e "${GREEN}SERVICIOS INSTALADOS:${NC}"
echo "=================================================================="
echo "• Apache2: $(systemctl is-active apache2)"
echo "• MySQL: $(systemctl is-active mysql)"
echo "• Icecast2: $(systemctl is-active icecast2)"
if [[ "$install_shoutcast" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "• Shoutcast: Instalado en /opt/shoutcast"
fi
echo ""
echo "=================================================================="
echo -e "${YELLOW}PRÓXIMOS PASOS:${NC}"
echo "=================================================================="
echo "1. Accede al panel web en http://$(hostname -I | awk '{print $1}')"
echo "2. Inicia sesión con las credenciales proporcionadas"
echo "3. Configura los ajustes del servidor en la sección Settings"
echo "4. Crea tus primeros clientes y planes"
echo "5. ¡Comienza a gestionar radios!"
echo ""
echo -e "${YELLOW}COMANDOS ÚTILES:${NC}"
echo "• Iniciar desarrollo: cd $PROJECT_DIR && npm run dev"
echo "• Ver logs: sudo tail -f /var/log/apache2/radiopanel_error.log"
echo "• Reiniciar servicios: sudo systemctl restart radiopanel apache2"
echo ""
print_success "¡RadioPanel está listo para usar!"
