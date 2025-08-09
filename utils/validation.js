const { body, validationResult, param, query } = require('express-validator');

/**
 * Error handler for validation results
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

/**
 * Common validation rules
 */
const validationRules = {
    // User registration validation
    userRegistration: [
        body('name')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('phoneNumber')
            .optional()
            .isMobilePhone()
            .withMessage('Please provide a valid phone number')
    ],

    // User login validation
    userLogin: [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
    ],

    // Profile update validation
    profileUpdate: [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters'),
        body('email')
            .optional()
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('phoneNumber')
            .optional()
            .isMobilePhone()
            .withMessage('Please provide a valid phone number'),
        body('dateOfBirth')
            .optional()
            .isISO8601()
            .withMessage('Please provide a valid date')
    ],

    // Password change validation
    passwordChange: [
        body('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('New password must be at least 6 characters long'),
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Password confirmation does not match');
                }
                return true;
            })
    ],

    // Contact form validation
    contact: [
        body('name')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Name must be between 2 and 100 characters'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('subject')
            .trim()
            .isLength({ min: 5, max: 200 })
            .withMessage('Subject must be between 5 and 200 characters'),
        body('message')
            .trim()
            .isLength({ min: 10, max: 1000 })
            .withMessage('Message must be between 10 and 1000 characters')
    ],

    // Reservation validation
    reservation: [
        body('sessionId')
            .isMongoId()
            .withMessage('Invalid session ID'),
        body('date')
            .isISO8601()
            .withMessage('Please provide a valid date'),
        body('notes')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Notes must not exceed 500 characters')
    ],

    // MongoDB ID validation
    mongoId: [
        param('id')
            .isMongoId()
            .withMessage('Invalid ID format')
    ],

    // Pagination validation
    pagination: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100')
    ]
};

/**
 * Create validation middleware chain
 * @param {string} ruleName - Name of the validation rule
 * @returns {Array} Array of validation middlewares
 */
const validate = (ruleName) => {
    const rules = validationRules[ruleName];
    if (!rules) {
        throw new Error(`Validation rule '${ruleName}' not found`);
    }
    return [...rules, handleValidationErrors];
};

/**
 * Custom validation middleware for file uploads
 */
const validateFileUpload = (options = {}) => {
    const {
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
        maxSize = 5 * 1024 * 1024, // 5MB
        required = false
    } = options;

    return (req, res, next) => {
        if (!req.file) {
            if (required) {
                return res.status(400).json({
                    success: false,
                    message: 'File upload is required'
                });
            }
            return next();
        }

        // Check file type
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
            });
        }

        // Check file size
        if (req.file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`
            });
        }

        next();
    };
};

module.exports = {
    validate,
    validateFileUpload,
    handleValidationErrors,
    validationRules
};
