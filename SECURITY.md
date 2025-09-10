# Configuraciones de Seguridad - SonicAdmin Lite

## Resumen de Seguridad Implementada

Este documento describe todas las medidas de seguridad implementadas en SonicAdmin Lite para el entorno de producción.

## 🔐 Autenticación y Autorización

### JWT Security
- **Tokens seguros**: JWT con issuer y audience validation
- **Expiración reducida**: 8 horas en producción vs 24h en desarrollo
- **Secret seguro**: Generado automáticamente con OpenSSL (32 bytes hex)
- **Validación de payload**: Verificación de estructura y contenido del token

### Protección contra Ataques de Fuerza Bruta
- **Rate limiting por IP**: 5 intentos de login por 15 minutos
- **Bloqueo de cuenta**: Cuenta bloqueada después de 5 intentos fallidos
- **Tiempo de bloqueo**: 15 minutos de espera después del bloqueo
- **Reset automático**: Intentos se resetean después de login exitoso
- **Información de estado**: API devuelve intentos restantes y tiempo de desbloqueo

## 🛡️ Headers de Seguridad

### Helmet.js Configuration
- **Content Security Policy**: Habilitado en producción con directivas estrictas
- **HSTS**: Strict Transport Security con 1 año de duración
- **X-Frame-Options**: DENY para prevenir clickjacking
- **X-Content-Type-Options**: nosniff para prevenir MIME sniffing
- **X-XSS-Protection**: Habilitado con modo block
- **Referrer Policy**: same-origin para controlar información de referencia

## 🌐 CORS y Rate Limiting

### CORS Configuration
- **Desarrollo**: Permite múltiples orígenes locales
- **Producción**: Solo permite el dominio del frontend configurado
- **Credentials**: Habilitado para envío de cookies y headers de auth
- **Métodos**: Solo métodos HTTP necesarios permitidos

### Rate Limiting
- **Global**: 100 requests por 15 minutos en producción
- **Login**: 5 intentos por 15 minutos específicamente para auth
- **Skip en desarrollo**: Rate limiting relajado para IPs locales
- **Headers estándar**: Información de límites en response headers

## 🔍 Validación y Sanitización

### Input Validation
- **Validación de tipos**: Verificación de tipos de datos en todos los endpoints
- **Longitud de campos**: Límites estrictos en username (3-50) y password (3-100)
- **Sanitización**: Limpieza de input antes de procesamiento
- **JSON validation**: Verificación de estructura JSON válida

### XSS Protection
- **Pattern detection**: Detección de patrones peligrosos (script tags, javascript:, etc.)
- **Recursive validation**: Validación recursiva de objetos anidados
- **Character filtering**: Filtrado de caracteres potencialmente peligrosos

## 🗄️ Database Security

### User Management
- **Status field**: Control de estado de usuarios (active, suspended, inactive)
- **Login tracking**: Registro de último login y intentos fallidos
- **Account locking**: Sistema de bloqueo temporal de cuentas
- **Password hashing**: Bcrypt con salt automático

### Connection Security
- **Prepared statements**: Uso exclusivo de consultas preparadas
- **Connection pooling**: Pool de conexiones con límites configurados
- **Timeout configuration**: Timeouts configurados para prevenir ataques DoS

## 🔥 Firewall y Network Security

### UFW Configuration
- **SSH**: Puerto 22 abierto para administración
- **Frontend**: Puerto 7000 para la aplicación web
- **Backend**: Puerto 3000 para la API
- **Icecast**: Puerto 8000 para streaming
- **HTTP/HTTPS**: Puertos 80 y 443 preparados para SSL
- **MySQL**: Puerto 3306 DENEGADO desde exterior

## 📝 Logging y Monitoring

### Security Logging
- **Request logging**: Log completo de todas las requests con IP y User-Agent
- **Suspicious activity**: Detección y log de patrones sospechosos
- **Failed attempts**: Log de intentos de login fallidos
- **Security events**: Log de eventos de seguridad importantes

### Patterns Detection
- **Security tools**: Detección de sqlmap, nmap, nikto, burp, etc.
- **Path traversal**: Detección de intentos de ../../../
- **SQL injection**: Detección de patrones de inyección SQL
- **XSS attempts**: Detección de intentos de XSS

## ⚙️ Environment Configuration

### Production Settings
- **NODE_ENV**: Configurado como 'production'
- **Secrets**: Generación automática de secrets seguros
- **Database**: Configuración de producción con SSL disabled temporalmente
- **CORS**: Configuración estricta para producción
- **Debugging**: Logs de debugging deshabilitados en producción

### Environment Variables
```bash
NODE_ENV=production
JWT_SECRET=[generado-automaticamente-32-bytes]
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=900
RATE_LIMIT_MAX=100
FRONTEND_URL=http://your-server-ip:7000
```

## 🚀 Deployment Security

### Installation Script
- **Automatic setup**: Configuración automática de todos los componentes de seguridad
- **Secure defaults**: Valores por defecto seguros para producción
- **Firewall setup**: Configuración automática del firewall
- **Service management**: Servicios systemd configurados correctamente

### Post-Installation
1. **Cambiar contraseñas**: Cambiar todas las contraseñas por defecto
2. **SSL Configuration**: Configurar SSL/TLS para HTTPS
3. **Backup strategy**: Implementar estrategia de backups
4. **Monitoring**: Configurar monitoreo de logs y métricas
5. **Updates**: Mantener sistema y dependencias actualizadas

## 🔧 Recommended Additional Security

### Para Máxima Seguridad
1. **SSL/TLS**: Implementar certificados SSL válidos
2. **VPN**: Acceso mediante VPN para administración
3. **2FA**: Implementar autenticación de dos factores
4. **WAF**: Web Application Firewall
5. **IDS**: Sistema de detección de intrusiones
6. **Regular audits**: Auditorías de seguridad regulares

## 📞 Security Response

### En caso de incidente
1. **Logs review**: Revisar logs de seguridad inmediatamente
2. **Account lockdown**: Bloquear cuentas comprometidas
3. **IP blocking**: Bloquear IPs maliciosas
4. **Token invalidation**: Invalidar todos los tokens JWT
5. **Password reset**: Forzar cambio de contraseñas

---

**Nota**: Esta configuración está optimizada para un entorno VPS estándar. Para ambientes de alta seguridad, considere implementar medidas adicionales como WAF, IDS, y monitoreo 24/7.