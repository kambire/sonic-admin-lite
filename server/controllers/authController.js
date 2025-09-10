
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const loginAttemptsController = require('./loginAttemptsController');

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return 'supersecretkey123456789';
})();

class AuthController {
  async login(req, res) {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      console.log('Login attempt:', { username: req.body.username, ip });
      
      const { username, password } = req.body;

      // Input validation
      if (!username || !password) {
        console.log('Missing credentials');
        return res.status(400).json({ 
          success: false, 
          message: 'Username and password are required' 
        });
      }

      // Validate input format
      if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid input format' 
        });
      }

      // Length validation
      if (username.length < 3 || username.length > 50 || password.length < 3 || password.length > 100) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid credentials length' 
        });
      }

      // Sanitize input
      const cleanUsername = username.trim().toLowerCase();

      // Verificar si la cuenta está bloqueada
      const lockInfo = await loginAttemptsController.getLockInfo(cleanUsername);
      if (lockInfo.isLocked) {
        console.log('Account locked for user:', cleanUsername);
        return res.status(423).json({ 
          success: false, 
          message: `Account locked. Try again in ${lockInfo.minutesLeft} minutes.`,
          lockInfo: {
            attempts: lockInfo.attempts,
            unlockTime: lockInfo.unlockTime
          }
        });
      }

      // Para desarrollo, permitir login directo con credenciales demo
      if (cleanUsername === 'admin' && password === 'admin123' && process.env.NODE_ENV !== 'production') {
        console.log('Demo login successful');
        const token = jwt.sign(
          { 
            id: 1, 
            username: 'admin', 
            role: 'admin' 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          success: true,
          data: {
            user: {
              id: 1,
              username: 'admin',
              email: 'admin@localhost',
              role: 'admin'
            },
            token
          }
        });
      }

      // Buscar usuario en base de datos
      const users = await db.query(
        'SELECT * FROM admin_users WHERE (username = ? OR email = ?) AND status = "active"',
        [cleanUsername, cleanUsername]
      );

      if (users.length === 0) {
        console.log('User not found:', username);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      const user = users[0];
      console.log('User found:', { id: user.id, username: user.username });
      
      // Verificar contraseña - más permisivo para desarrollo
      let validPassword = false;
      
      try {
        if (user.password_hash) {
          validPassword = await bcrypt.compare(password, user.password_hash);
        } else {
          // Si no hay hash, comparar directamente (solo para desarrollo)
          validPassword = password === user.password_hash;
        }
      } catch (error) {
        console.log('Password comparison error:', error);
        // Fallback para desarrollo
        validPassword = password === user.password_hash;
      }

      if (!validPassword) {
        console.log('Invalid password for user:', username);
        
        // Incrementar intentos fallidos
        await loginAttemptsController.incrementFailedAttempts(cleanUsername);
        
        // Obtener información actualizada de bloqueo
        const updatedLockInfo = await loginAttemptsController.getLockInfo(cleanUsername);
        
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials',
          remainingAttempts: Math.max(0, (process.env.MAX_LOGIN_ATTEMPTS || 5) - updatedLockInfo.attempts)
        });
      }

      console.log('Login successful for user:', username);

      // Resetear intentos fallidos en login exitoso
      await loginAttemptsController.resetFailedAttempts(cleanUsername);

      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          iat: Math.floor(Date.now() / 1000)
        },
        JWT_SECRET,
        { 
          expiresIn: process.env.NODE_ENV === 'production' ? '8h' : '24h',
          issuer: 'sonic-admin',
          audience: 'sonic-admin-client'
        }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          },
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  async verify(req, res) {
    try {
      const user = req.user;
      console.log('Token verification successful for user:', user.username);
      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Verify error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
}

module.exports = new AuthController();
