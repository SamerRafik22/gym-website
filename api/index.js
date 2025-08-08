// Vercel serverless function entry point
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.open-meteo.com"],
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

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Database connection
if (!mongoose.connection.readyState) {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/redefinelab-gym', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

// Import routes
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/users');
const adminRoutes = require('../routes/admin');
const sessionRoutes = require('../routes/sessions');
const reservationRoutes = require('../routes/reservations');
const membershipRoutes = require('../routes/memberships');
const nutritionRoutes = require('../routes/nutrition');
const contactRoutes = require('../routes/contact');

// Use routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/sessions', sessionRoutes);
app.use('/reservations', reservationRoutes);
app.use('/memberships', membershipRoutes);
app.use('/nutrition', nutritionRoutes);
app.use('/contact', contactRoutes);

// Main routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/services', (req, res) => {
    res.render('services');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/join', (req, res) => {
    res.render('join');
});

app.get('/login', (req, res) => {
    res.render('login');
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

module.exports = app;