
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

// Database
const db = require('./config/database');

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// Security middleware - Configurado para desarrollo sin SSL
app.use(helmet({
  contentSecurityPolicy: false,
  hsts: false // Deshabilitar HSTS
}));

app.use(cors({
  origin: ['http://localhost:7000', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting más permisivo para desarrollo
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Aumentar límite para desarrollo
  skip: (req) => {
    // Saltar rate limiting para localhost
    return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.startsWith('192.168.') || req.ip.startsWith('10.');
  }
});
app.use(limiter);

// Body parsing
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database connection
db.createPool();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SonicAdmin Lite API is running',
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

// Auth routes
app.post('/api/auth/login', authController.login);
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
