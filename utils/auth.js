const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware - verifies JWT token and loads user
 */
const authenticate = async (req, res, next) => {
    let token;

    // Extract token from different sources
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // Handle missing token
    if (!token) {
        // For API requests, return JSON
        if (req.path.startsWith('/api/') || (req.headers.accept && req.headers.accept.includes('application/json'))) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please provide a valid token.'
            });
        }
        // For browser requests, redirect to login
        return res.redirect('/login');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Token may be invalid.'
            });
        }

        // Check if user account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error('Authentication error:', error);
        
        // Handle different JWT errors
        let message = 'Invalid or expired token';
        if (error.name === 'TokenExpiredError') {
            message = 'Token has expired. Please log in again.';
        } else if (error.name === 'JsonWebTokenError') {
            message = 'Invalid token format. Please log in again.';
        }
        
        return res.status(401).json({
            success: false,
            message: message
        });
    }
};

/**
 * Authorization middleware factory - checks user roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // Ensure user is authenticated first
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required before authorization check.'
            });
        }

        // Check if user's role is in the allowed roles
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
            });
        }

        next();
    };
};

/**
 * Admin-only middleware - shorthand for authorize('admin')
 */
const adminOnly = authorize('admin');

/**
 * Membership requirement middleware - checks for active membership
 */
const requireActiveMembership = async (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    try {
        // Check if user has active membership
        if (!req.user.isMembershipActive || !req.user.isMembershipActive()) {
            return res.status(403).json({
                success: false,
                message: 'Active membership required to access this feature. Please upgrade your membership.'
            });
        }

        next();
    } catch (error) {
        console.error('Membership check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking membership status.'
        });
    }
};

/**
 * Optional authentication - loads user if token exists, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    let token;

    // Extract token from different sources
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // If no token, continue without user
    if (!token) {
        return next();
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
            req.user = user;
        }
    } catch (error) {
        // Log error but don't fail the request
        console.log('Optional auth failed:', error.message);
    }

    next();
};

module.exports = {
    authenticate,
    authorize,
    adminOnly,
    requireActiveMembership,
    optionalAuth,
    // Legacy exports for backward compatibility (will be removed later)
    protect: authenticate
};
