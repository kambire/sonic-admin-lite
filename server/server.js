
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
require('dotenv').config();

// Controllers
const authController = require('./controllers/authController');
const clientsController = require('./controllers/clientsController');

// Middleware
const { authenticateToken } = require('./middleware/auth');
const { loginLimiter, apiLimiter, validateInput, securityLogger } = require('./middleware/security');

// Database
const db = require('./config/database');

const app = express();
const PORT = process.env.SERVER_PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

console.log('🚀 Starting SonicAdmin Lite API Server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Production mode:', isProduction);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  } : false,
  hsts: isProduction ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false,
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' }
}));

// CORS configuration
const corsOptions = {
  origin: isProduction ? 
    process.env.FRONTEND_URL || false : 
    ['http://localhost:7000', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isProduction ? 100 : 1000, // Más estricto en producción
  message: {
    error: 'Too many requests from this IP, please try again later',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (isProduction) return false;
    // Solo saltar en desarrollo para IPs locales
    const ip = req.ip || req.connection.remoteAddress;
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || 
           ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.');
  }
});
app.use(limiter);

// Body parsing with security
app.use(bodyParser.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ success: false, message: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

// Security logging
app.use(securityLogger);

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${ip} - User-Agent: ${req.get('User-Agent')}`);
  next();
});

// Input validation for all POST/PUT requests
app.use((req, res, next) => {
  if (['POST', 'PUT'].includes(req.method)) {
    return validateInput(req, res, next);
  }
  next();
});

// Initialize database connection
db.createPool();

// API Routes with rate limiting
app.use('/api/', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth routes with strict rate limiting
app.post('/api/auth/login', loginLimiter, authController.login);
app.get('/api/auth/verify', authenticateToken, authController.verify);

// Clients routes
app.get('/api/clients', authenticateToken, clientsController.getAll);
app.post('/api/clients', authenticateToken, clientsController.create);
app.put('/api/clients/:id', authenticateToken, clientsController.update);
app.delete('/api/clients/:id', authenticateToken, clientsController.delete);

// Plans routes (usando datos mock por ahora)
app.get('/api/plans', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Básico',
        diskSpace: 5,
        listeners: 50,
        bitrate: 128,
        price: 19.99,
        features: ['Streaming 24/7', 'Panel de control', 'Estadísticas básicas'],
        isActive: true
      },
      {
        id: '2',
        name: 'Profesional',
        diskSpace: 20,
        listeners: 200,
        bitrate: 320,
        price: 49.99,
        features: ['Streaming 24/7', 'AutoDJ incluido', 'Estadísticas avanzadas', 'API access'],
        isActive: true
      },
      {
        id: '3',
        name: 'Enterprise',
        diskSpace: 100,
        listeners: 1000,
        bitrate: 320,
        price: 149.99,
        features: ['Streaming 24/7', 'AutoDJ Premium', 'CDN global', 'Soporte prioritario', 'White label'],
        isActive: true
      }
    ]
  });
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const [totalRadios] = await db.query('SELECT COUNT(*) as count FROM radios');
    const [activeRadios] = await db.query('SELECT COUNT(*) as count FROM radios WHERE status = "active"');
    const [suspendedRadios] = await db.query('SELECT COUNT(*) as count FROM radios WHERE status = "suspended"');
    const [totalClients] = await db.query('SELECT COUNT(*) as count FROM clients');
    const [totalListeners] = await db.query('SELECT SUM(listeners) as total FROM radios WHERE status = "active"');

    res.json({
      success: true,
      data: {
        totalRadios: totalRadios.count || 0,
        activeRadios: activeRadios.count || 0,
        suspendedRadios: suspendedRadios.count || 0,
        totalClients: totalClients.count || 0,
        totalListeners: totalListeners.total || 0,
        revenue: 219.97
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard stats' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SonicAdmin Lite API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Development mode - SSL disabled`);
});

module.exports = app;
