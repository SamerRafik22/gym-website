const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies (for browser requests)
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
        // For API requests, return JSON
        if (req.path.startsWith('/api/') || req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        // For browser requests, redirect to login
        return res.redirect('/login');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Add user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

// Authorize roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }

        next();
    };
};

// Check if user has active membership
const requireActiveMembership = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    // Check if user has active membership
    if (!req.user.isMembershipActive()) {
        return res.status(403).json({
            success: false,
            message: 'Active membership required to access this feature'
        });
    }

    next();
};

module.exports = {
    protect,
    authorize,
    requireActiveMembership
}; 