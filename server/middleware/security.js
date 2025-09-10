const rateLimit = require('express-rate-limit');

// Rate limiting para endpoints sensibles
const createStrictLimiter = (windowMs = 15 * 60 * 1000, max = 5) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many attempts, please try again later',
      retryAfter: Math.ceil(windowMs / 1000 / 60)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    }
  });
};

// Rate limiting específico para login
const loginLimiter = createStrictLimiter(15 * 60 * 1000, 5); // 5 intentos por 15 minutos

// Rate limiting para endpoints de API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    error: 'API rate limit exceeded',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validación de entrada para prevenir inyecciones
const validateInput = (req, res, next) => {
  const { body } = req;
  
  // Verificar que no hay caracteres peligrosos en strings
  const checkForDangerousChars = (value) => {
    if (typeof value === 'string') {
      const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /eval\s*\(/gi,
        /expression\s*\(/gi
      ];
      
      return dangerousPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  const validateObject = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
          if (validateObject(value)) return true;
        } else if (checkForDangerousChars(value)) {
          return true;
        }
      }
    }
    return false;
  };

  if (validateObject(body)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }

  next();
};

// Middleware para logging de seguridad
const securityLogger = (req, res, next) => {
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress;
  
  // Log requests sospechosos
  const suspiciousPatterns = [
    /sqlmap/i,
    /nmap/i,
    /nikto/i,
    /gobuster/i,
    /dirbuster/i,
    /burp/i,
    /\.\.\/\.\.\//,
    /union.*select/i,
    /script/i
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(userAgent) || 
    pattern.test(req.url) || 
    pattern.test(JSON.stringify(req.body))
  );

  if (isSuspicious) {
    console.warn(`🚨 SUSPICIOUS REQUEST: ${ip} - ${req.method} ${req.url} - UA: ${userAgent}`);
  }

  next();
};

module.exports = {
  loginLimiter,
  apiLimiter,
  validateInput,
  securityLogger,
  createStrictLimiter
};