const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

/**
 * Rate limiting configurations
 */
const rateLimiters = {
    // General API rate limit
    general: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: {
            success: false,
            message: 'Too many requests from this IP, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false
    }),

    // Strict rate limit for authentication endpoints
    auth: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // Limit each IP to 5 login attempts per windowMs
        message: {
            success: false,
            message: 'Too many authentication attempts, please try again in 15 minutes.'
        },
        standardHeaders: true,
        legacyHeaders: false,
        // Skip successful requests
        skipSuccessfulRequests: true
    }),

    // Rate limit for password reset
    passwordReset: rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // Limit each IP to 3 password reset attempts per hour
        message: {
            success: false,
            message: 'Too many password reset attempts, please try again in 1 hour.'
        },
        standardHeaders: true,
        legacyHeaders: false
    }),

    // Rate limit for contact form
    contact: rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // Limit each IP to 10 contact form submissions per hour
        message: {
            success: false,
            message: 'Too many contact form submissions, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false
    }),

    // Rate limit for file uploads
    upload: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 20, // Limit each IP to 20 file uploads per 15 minutes
        message: {
            success: false,
            message: 'Too many file uploads, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false
    })
};

/**
 * Security headers configuration
 */
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://api.openweathermap.org"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false // Allow loading external resources
});

/**
 * Data sanitization middleware
 */
const sanitizeData = [
    // Prevent NoSQL injection attacks
    mongoSanitize(),
    
    // Prevent XSS attacks
    xss(),
    
    // Prevent HTTP Parameter Pollution
    hpp({
        whitelist: ['sort', 'fields', 'page', 'limit'] // Allow multiple values for these params
    })
];

/**
 * CORS configuration
 */
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://localhost:3000',
            'https://localhost:3001',
            // Add your production domains here
        ];
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Allow cookies to be sent
    optionsSuccessStatus: 200
};

/**
 * Security validation middleware
 */
const validateRequest = (req, res, next) => {
    // Check for common attack patterns in URLs
    const suspiciousPatterns = [
        /\.\./,  // Directory traversal
        /<script/i,  // XSS attempt
        /javascript:/i,  // JavaScript protocol
        /vbscript:/i,  // VBScript protocol
        /onload=/i,  // Event handler
        /onerror=/i  // Event handler
    ];

    const url = req.originalUrl || req.url;
    const userAgent = req.get('User-Agent') || '';

    // Check URL for suspicious patterns
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(url)) {
            console.warn(`Suspicious request detected: ${url} from ${req.ip}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid request format'
            });
        }
    }

    // Block requests with suspicious user agents
    const blockedUserAgents = [
        /sqlmap/i,
        /nikto/i,
        /nessus/i,
        /nmap/i,
        /masscan/i
    ];

    for (const pattern of blockedUserAgents) {
        if (pattern.test(userAgent)) {
            console.warn(`Blocked user agent: ${userAgent} from ${req.ip}`);
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
    }

    next();
};

/**
 * Request logging middleware for security monitoring
 */
const securityLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log request details
    const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer')
    };

    // Log after response
    res.on('finish', () => {
        logData.statusCode = res.statusCode;
        logData.responseTime = Date.now() - start;
        
        // Log suspicious activities
        if (res.statusCode >= 400) {
            console.warn('Security log:', JSON.stringify(logData));
        }
    });

    next();
};

module.exports = {
    rateLimiters,
    securityHeaders,
    sanitizeData,
    corsOptions,
    validateRequest,
    securityLogger
};
