
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

## 🖼️ Capturas de Pantalla

<div align="center">

### 🏠 Dashboard Principal
![Dashboard](https://via.placeholder.com/800x400/F8FAFC/64748B?text=Dashboard+Principal)

### 📻 Gestión de Radios
![Radios](https://via.placeholder.com/800x400/EFF6FF/3B82F6?text=Gestión+de+Radios)

### 👨‍💼 Administración de Clientes
![Clientes](https://via.placeholder.com/800x400/F0FDF4/10B981?text=Gestión+de+Clientes)

</div>

---

## 🚀 Instalación Rápida

### 📋 Requisitos Previos

- **Sistema Operativo**: Ubuntu Server 22.04 LTS (recomendado)
- **RAM**: Mínimo 2GB (4GB recomendado)
- **Espacio**: 20GB libres
- **Red**: Acceso a internet para descargas

### ⚡ Instalación Automática

```bash
# Descargar e instalar
wget https://raw.githubusercontent.com/kambire/sonic-admin-lite/main/install.sh
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

## 🎛️ Características Avanzadas

### 🔄 **AutoDJ**
- Reproducción automática 24/7
- Gestión de playlist
- Crossfade y efectos
- Programación horaria

### 📊 **Monitoreo**
- Oyentes en tiempo real
- Estadísticas de uso
- Logs de conexión
- Alertas automáticas

### 🌐 **Multi-servidor**
- Balanceador de carga
- Redundancia automática
- CDN integration
- Geo-distribución

---

## 🚀 Roadmap

### 📅 **Q1 2024**
- [ ] 🎵 Player web integrado
- [ ] 📱 App móvil nativa
- [ ] 🔌 API SonicPanel completa
- [ ] 📈 Analytics avanzados

### 📅 **Q2 2024**
- [ ] 🤖 IA para recomendaciones
- [ ] 🎙️ Grabación de programas
- [ ] 💰 Facturación automática
- [ ] 🌍 Multi-idioma

### 📅 **Q3 2024**
- [ ] ☁️ Migración cloud
- [ ] 🔐 2FA avanzado
- [ ] 📺 Streaming video
- [ ] 🎪 Eventos en vivo

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

```
MIT License

Copyright (c) 2024 SonicAdmin Lite

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🌟 Agradecimientos

### 💖 **Gracias a**

- [React Team](https://reactjs.org/) por el framework increíble
- [Tailwind Labs](https://tailwindcss.com/) por el CSS utility-first
- [Shadcn](https://ui.shadcn.com/) por los componentes hermosos
- [Lucide](https://lucide.dev/) por los iconos perfectos
- [Lovable](https://lovable.dev/) por el hosting y desarrollo

### 🏆 **Sponsors**

¿Quieres ser sponsor? [Contáctanos](mailto:sponsor@sonicadmin.com)

---

<div align="center">

### 🚀 **¡Hecho con ❤️ para la comunidad de radio!**

[⭐ Dale una estrella](https://github.com/kambire/sonic-admin-lite) · [🔄 Hacer Fork](https://github.com/kambire/sonic-admin-lite/fork) · [📢 Compartir](https://twitter.com/intent/tweet?text=Check%20out%20SonicAdmin%20Lite%20-%20Modern%20radio%20management%20panel&url=https://github.com/kambire/sonic-admin-lite)

**[⬆️ Volver arriba](#-sonicadmin-lite)**

</div>
