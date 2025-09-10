
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return 'supersecretkey123456789';
})();

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Auth middleware - Token present:', !!token);

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    // Validate token format
    if (typeof token !== 'string' || token.length < 10) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'sonic-admin',
      audience: 'sonic-admin-client'
    });
    
    console.log('Token decoded successfully for user ID:', decoded.id);

    // Validate token payload
    if (!decoded.id || !decoded.username) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token payload' 
      });
    }
    
    // Para el usuario demo, permitir acceso directo solo en desarrollo
    if (decoded.username === 'admin' && decoded.id === 1 && process.env.NODE_ENV !== 'production') {
      req.user = {
        id: 1,
        username: 'admin',
        email: 'admin@localhost',
        role: 'admin'
      };
      return next();
    }

    // Para otros usuarios, verificar en base de datos
    const users = await db.query(
      'SELECT id, username, email, role, status FROM admin_users WHERE id = ? AND status = "active"',
      [decoded.id]
    );

    if (users.length === 0) {
      console.log('User not found in database:', decoded.id);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    req.user = users[0];
    console.log('User authenticated:', req.user.username);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

module.exports = { authenticateToken };
