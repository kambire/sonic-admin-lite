
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123456789';

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

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully for user ID:', decoded.id);
    
    // Para el usuario demo, permitir acceso directo
    if (decoded.username === 'admin' && decoded.id === 1) {
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
      'SELECT id, username, email, role FROM admin_users WHERE id = ?',
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
