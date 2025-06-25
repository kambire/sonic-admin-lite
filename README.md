
# 🎵 SonicAdmin Lite

<div align="center">

![SonicAdmin Logo](https://via.placeholder.com/400x150/4F46E5/FFFFFF?text=SonicAdmin+Lite)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-blue.svg)](https://tailwindcss.com/)

**Panel de administración moderno y potente para gestión de radios Shoutcast/Icecast**

[🚀 Demo en Vivo](https://sonic-admin-lite.lovable.app) · [📖 Documentación](#-características) · [🐛 Reportar Bug](https://github.com/kambire/sonic-admin-lite/issues) · [💡 Solicitar Feature](https://github.com/kambire/sonic-admin-lite/issues)

</div>

---

## ✨ Características

### 🎛️ **Gestión Completa de Radios**
- ✅ Crear y eliminar estaciones de radio Shoutcast/Icecast
- ✅ AutoDJ opcional para cada radio
- ✅ Suspender/reactivar radios en tiempo real
- ✅ Monitoreo de oyentes en vivo
- ✅ Gestión de puertos automática

### 👥 **Administración de Clientes**
- ✅ CRUD completo de clientes
- ✅ Estados activo/suspendido
- ✅ Información de contacto
- ✅ Historial de creación

### 💰 **Planes Personalizables**
- ✅ Configuración flexible de recursos
- ✅ Espacio en disco, oyentes, bitrate
- ✅ Sistema de precios
- ✅ Características por plan

### 📊 **Dashboard Intuitivo**
- ✅ Estadísticas en tiempo real
- ✅ Estado de servicios del sistema
- ✅ Gráficos de rendimiento
- ✅ Alertas y notificaciones

### 🔐 **Seguridad Robusta**
- ✅ Autenticación de administrador
- ✅ Sesiones seguras
- ✅ Roles y permisos
- ✅ Logs de auditoría

---

## 🚀 Instalación Rápida

### 📋 Requisitos Previos

- **Sistema Operativo**: Ubuntu Server 22.04 LTS (recomendado)
- **RAM**: Mínimo 2GB (4GB recomendado)
- **Espacio**: 20GB libres
- **Red**: Acceso a internet para descargas
- **Usuario**: Usuario con privilegios sudo (NO ejecutar como root)

### ⚡ Instalación Automática

```bash
# 1. Clonar el repositorio
git clone https://github.com/kambire/sonic-admin-lite.git

# 2. Cambiar al directorio del proyecto
cd sonic-admin-lite

# 3. Dar permisos de ejecución al script
chmod +x install.sh

# 4. Ejecutar el instalador (IMPORTANTE: NO como root)
./install.sh
```

> ⚠️ **IMPORTANTE**: NO ejecutes el script como root. Usa un usuario normal con privilegios sudo.

### 🔧 Si ya clonaste como root:

```bash
# Si ya clonaste el proyecto como root, ejecuta estos comandos:
sudo chown -R $USER:$USER /sonic-admin-lite
cd /sonic-admin-lite
chmod +x install.sh
./install.sh
```

### 🛠️ Instalación Manual

```bash
# Clonar el repositorio
git clone https://github.com/kambire/sonic-admin-lite.git
cd sonic-admin-lite

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env
nano .env

# Construir para producción
npm run build

# Iniciar servidor
npm start
```

---

## 🔧 Configuración

### 🌐 Variables de Entorno

```bash
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sonic_admin
DB_USER=sonic_admin
DB_PASS=tu_password_seguro

# Servidor
SERVER_PORT=3000
SERVER_HOST=0.0.0.0

# Streaming
SHOUTCAST_PATH=/opt/shoutcast
ICECAST_PATH=/etc/icecast2

# Seguridad
JWT_SECRET=tu_jwt_secret_muy_seguro
API_KEY=sonic_admin_api_key_2024

# Email (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_app
```

### 🔑 Credenciales por Defecto

- **Usuario**: `admin`
- **Contraseña**: `admin123`

> ⚠️ **Importante**: Cambia estas credenciales en producción

---

## 🎯 Uso

### 1️⃣ **Acceder al Panel**
Abre tu navegador en `http://tu-servidor-ip`

### 2️⃣ **Configurar Planes**
1. Ve a **Planes** → **Nuevo Plan**
2. Define recursos (espacio, oyentes, bitrate)
3. Establece precio y características

### 3️⃣ **Crear Clientes**
1. Ve a **Clientes** → **Nuevo Cliente**
2. Completa información de contacto
3. Asigna estado activo

### 4️⃣ **Crear Radios**
1. Ve a **Radios** → **Nueva Radio**
2. Selecciona cliente y plan
3. Configura Shoutcast/Icecast
4. ¡Activa AutoDJ si es necesario!

---

## 🐛 Solución de Problemas

### 🚫 **Error: "Permission denied" al ejecutar install.sh**
```bash
chmod +x install.sh
./install.sh
```

### 🚫 **Error: "Este script no debe ejecutarse como root"**
```bash
# Salir de root
exit

# Cambiar a usuario normal
su - tu_usuario

# Ir al directorio del proyecto
cd /ruta/al/sonic-admin-lite

# Ejecutar el script
./install.sh
```

### 🚫 **Error: Node.js no encontrado**
```bash
# Verificar instalación de Node.js
node --version
npm --version

# Si no está instalado, el script lo instalará automáticamente
```

### 🚫 **Error de permisos en MySQL**
```bash
# Reiniciar MySQL
sudo systemctl restart mysql

# Verificar estado
sudo systemctl status mysql
```

---

## 🏗️ Arquitectura Técnica

### 🎨 **Frontend**
- **React 18.3** con TypeScript
- **Tailwind CSS** para styling
- **Shadcn/UI** componentes
- **Lucide React** iconografía
- **Vite** build tool

### ⚙️ **Backend Simulado**
- **LocalStorage** para datos de demo
- **Context API** para estado global
- **React Query** para manejo de datos
- **Hooks personalizados** para lógica

### 🗄️ **Base de Datos**
- **MySQL 8.0** (producción)
- **Estructura normalizada**
- **Índices optimizados**
- **Backups automáticos**

---

## 📡 API Reference

### 🔐 Autenticación

```typescript
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

### 📻 Radios

```typescript
// Listar radios
GET /api/radios

// Crear radio
POST /api/radios
{
  "name": "Mi Radio FM",
  "clientId": "1",
  "planId": "2",
  "serverType": "shoutcast",
  "hasAutoDJ": true
}

// Suspender/Activar radio
PATCH /api/radios/:id/status
{
  "status": "suspended" | "active"
}
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! 

### 🛠️ **Configurar Desarrollo**

```bash
# Fork y clonar
git clone https://github.com/kambire/sonic-admin-lite.git
cd sonic-admin-lite

# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev
```

### 📝 **Guidelines**

1. 🔀 Crea una rama para tu feature
2. ✍️ Commit con mensajes descriptivos
3. 🧪 Incluye tests si es necesario
4. 📖 Actualiza documentación
5. 🔄 Crea Pull Request

---

## 📞 Soporte

### 🆘 **¿Necesitas Ayuda?**

- 📧 **Email**: support@sonicadmin.com
- 💬 **Discord**: [Únete a nuestro servidor](https://discord.gg/sonicadmin)
- 📱 **Telegram**: [@SonicAdminSupport](https://t.me/SonicAdminSupport)
- 🐛 **Issues**: [GitHub Issues](https://github.com/kambire/sonic-admin-lite/issues)

### 📚 **Recursos**

- [📖 Documentación Completa](https://docs.sonicadmin.com)
- [🎥 Video Tutoriales](https://youtube.com/sonicadmin)
- [❓ FAQ](https://docs.sonicadmin.com/faq)
- [🔧 Troubleshooting](https://docs.sonicadmin.com/troubleshooting)

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver [LICENSE](LICENSE) para más detalles.

---

## 🌟 Agradecimientos

### 💖 **Gracias a**

- [React Team](https://reactjs.org/) por el framework increíble
- [Tailwind Labs](https://tailwindcss.com/) por el CSS utility-first
- [Shadcn](https://ui.shadcn.com/) por los componentes hermosos
- [Lucide](https://lucide.dev/) por los iconos perfectos
- [Lovable](https://lovable.dev/) por el hosting y desarrollo

---

<div align="center">

### 🚀 **¡Hecho con ❤️ para la comunidad de radio!**

[⭐ Dale una estrella](https://github.com/kambire/sonic-admin-lite) · [🔄 Hacer Fork](https://github.com/kambire/sonic-admin-lite/fork) · [📢 Compartir](https://twitter.com/intent/tweet?text=Check%20out%20SonicAdmin%20Lite%20-%20Modern%20radio%20management%20panel&url=https://github.com/kambire/sonic-admin-lite)

**[⬆️ Volver arriba](#-sonicadmin-lite)**

</div>
