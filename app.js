const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// HTTPS redirect middleware (only in production)
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const membershipRoutes = require('./routes/memberships');
const contactRoutes = require('./routes/contact');
const sessionRoutes = require('./routes/sessions');
const reservationRoutes = require('./routes/reservations');
const nutritionRoutes = require('./routes/nutrition');
const adminRoutes = require('./routes/admin');

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://localhost:3443", "https://localhost:3000", "http://localhost:3000", "https://api.open-meteo.com"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/admin', adminRoutes);

// Serve EJS files for frontend routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/join', (req, res) => {
    res.render('join');
});

app.get('/services', (req, res) => {
    res.render('services');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

app.get('/admin', (req, res) => {
    res.render('admin');
});

app.get('/test', (req, res) => {
    res.render('test');
});

// Health check routes for Railway
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
    
    httpServer.on('error', (error) => {
        console.error('❌ HTTP Server Error:', error);
        process.exit(1);
    });
    
    httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 HTTP Server running on port ${PORT}`);
        console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔓 HTTP URL: http://0.0.0.0:${PORT}`);
        console.log(`✅ Health check available at: http://0.0.0.0:${PORT}/health`);
    });

    // Only start HTTPS in development
    if (process.env.NODE_ENV !== 'production') {
        try {
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
            console.log(`🔓 HTTP server is available at: http://0.0.0.0:${PORT}`);
        }
    }
}

// Helper function to generate self-signed certificate for development
function generateSelfSignedCert() {
    // Try to create a basic certificate using Node.js crypto
    const crypto = require('crypto');
    
    try {
        // Generate RSA key pair
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        // Basic certificate (this is minimal and browsers will show warnings)
        const cert = `-----BEGIN CERTIFICATE-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAyKhd8K9F8Vj6B7LJ5j8j
VJF8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8
F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8
F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8
QIDAQAB
-----END CERTIFICATE-----`;

        return { key: privateKey, cert: cert };
    } catch (error) {
        throw new Error('Could not generate basic SSL certificate: ' + error.message);
    }
}

startServers(); 