const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const membershipRoutes = require('./routes/memberships');
const reservationRoutes = require('./routes/reservations');
const sessionRoutes = require('./routes/sessions');
const nutritionRoutes = require('./routes/nutrition');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');

// Import middleware
const { protect, adminOnly } = require('./utils/auth');

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            objectSrc: ["'none'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://localhost:3443", "https://localhost:3000", "http://localhost:3000", "https://api.open-meteo.com"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'https://localhost:3443',
            'http://127.0.0.1:3000',
            'https://127.0.0.1:3443'
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
let dbConnected = false;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/redefinelab', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Connected to MongoDB successfully');
    dbConnected = true;
    
    // Create first admin user if none exists
    try {
        const User = require('./models/User');
        await User.createFirstAdmin();
    } catch (error) {
        console.error('⚠️  Error creating admin user:', error.message);
    }
})
.catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️  App will continue without database connection');
    dbConnected = false;
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is working!',
        timestamp: new Date().toISOString()
    });
});

// API Routes (keeping the /api prefix for backend functionality)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/admin', adminRoutes);

// Additional route aliases without /api prefix for compatibility
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/memberships', membershipRoutes);
app.use('/contact', contactRoutes);
app.use('/sessions', sessionRoutes);
app.use('/reservations', reservationRoutes);
app.use('/nutrition', nutritionRoutes);
app.use('/admin', adminRoutes);

// Serve main pages
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/services', (req, res) => {
    res.render('services');
});

// Contact route is handled by contactRoutes middleware

app.get('/join', (req, res) => {
    res.render('join');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});

app.get('/reset-password', (req, res) => {
    res.render('reset-password');
});

app.get('/dashboard', protect, (req, res) => {
    res.render('dashboard');
});

app.get('/admin', protect, adminOnly, (req, res) => {
    res.render('admin');
});

app.get('/test', (req, res) => {
    res.render('test');
});

// HTML file aliases for compatibility
app.get('/index.html', (req, res) => {
    res.render('index');
});

app.get('/login.html', (req, res) => {
    res.render('login');
});

app.get('/register.html', (req, res) => {
    res.render('join');
});

app.get('/join.html', (req, res) => {
    res.render('join');
});

app.get('/services.html', (req, res) => {
    res.render('services');
});

app.get('/about.html', (req, res) => {
    res.render('about');
});

// Contact route is handled by contactRoutes middleware

app.get('/dashboard.html', protect, (req, res) => {
    res.render('dashboard');
});

app.get('/admin.html', protect, adminOnly, (req, res) => {
    res.render('admin');
});

app.get('/test.html', (req, res) => {
    res.render('test');
});

// Health check routes
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        port: PORT,
        database: dbConnected ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start servers
function startServers() {
    // Start HTTP server
    const httpServer = http.createServer(app);
    httpServer.listen(PORT, () => {
        console.log(`🚀 HTTP Server running on port ${PORT}`);
        console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔓 HTTP URL: http://localhost:${PORT}`);
    });

    // Try to start HTTPS server with self-signed certificate for development
    if (process.env.NODE_ENV !== 'production') {
        try {
            // For development, we'll create a simple HTTPS server
            // In production, you should use proper SSL certificates
            const httpsOptions = {
                key: process.env.SSL_KEY_PATH ? fs.readFileSync(process.env.SSL_KEY_PATH) : generateSelfSignedCert().key,
                cert: process.env.SSL_CERT_PATH ? fs.readFileSync(process.env.SSL_CERT_PATH) : generateSelfSignedCert().cert
            };

            
            const httpsServer = https.createServer(httpsOptions, app);
            httpsServer.listen(HTTPS_PORT, () => {
                console.log(`🔒 HTTPS Server running on port ${HTTPS_PORT}`);
                console.log(`🌐 HTTPS URL: https://localhost:${HTTPS_PORT}`);
                console.log(`⚠️  Using self-signed certificate for development`);
            });
        } catch (error) {
            console.log(`⚠️  Could not start HTTPS server: ${error.message}`);
            console.log(`🔓 HTTP server is available at: http://localhost:${PORT}`);
        }
    } else {
        // In production, you should configure proper SSL certificates
        console.log(`🔒 For HTTPS in production, configure SSL_KEY_PATH and SSL_CERT_PATH environment variables`);
    }
}

// Helper function to generate self-signed certificate for development
function generateSelfSignedCert() {
    // Try to create a basic certificate using Node.js crypto
    const crypto = require('crypto');
    
    try {
        // Generate a simple self-signed certificate for development
        const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDIqF3wr0XxWPoH
ssnmPyNUkXwXw...
-----END PRIVATE KEY-----`;

        const cert = `-----BEGIN CERTIFICATE-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAyKhd8K9F8Vj6B7LJ5j8j
VJF8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8
QIDAQAB
-----END CERTIFICATE-----`;

        return { key: privateKey, cert: cert };
    } catch (error) {
        throw new Error('Could not generate basic SSL certificate: ' + error.message);
    }
}

startServers();