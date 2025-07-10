
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123456789';

class AuthController {
  async login(req, res) {
    try {
      console.log('Login attempt:', { username: req.body.username, ip: req.ip });
      
      const { username, password } = req.body;

      if (!username || !password) {
        console.log('Missing credentials');
        return res.status(400).json({ 
          success: false, 
          message: 'Username and password are required' 
        });
      }

      // Para desarrollo, permitir login directo con credenciales demo
      if (username === 'admin' && password === 'admin123') {
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
        'SELECT * FROM admin_users WHERE username = ? OR email = ?',
        [username, username]
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
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      console.log('Login successful for user:', username);

      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
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
