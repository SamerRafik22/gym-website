const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    logout,
    checkUsername,
    checkEmail,
    checkPhone,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const router = express.Router();

// Validation middleware
const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('username')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('phone')
        .isLength({ min: 10, max: 15 })
        .withMessage('Please enter a valid phone number'),
    body('age')
        .isInt({ min: 16, max: 100 })
        .withMessage('Age must be between 16 and 100'),
    body('gender')
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),
    body('membershipType')
        .optional()
        .isIn(['standard', 'premium', 'elite'])
        .withMessage('Invalid membership type'),
    body('fitnessGoals')
        .optional()
        .isArray()
        .withMessage('Fitness goals must be an array'),
    body('fitnessGoals.*')
        .optional()
        .isIn(['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'strength', 'general_fitness'])
        .withMessage('Invalid fitness goal'),
    body('medicalConditions')
        .optional()
        .isArray()
        .withMessage('Medical conditions must be an array'),
    body('billingType')
        .optional()
        .isIn(['monthly', 'annual'])
        .withMessage('Invalid billing type')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    body('phone')
        .optional()
        .matches(/^(\+201|01)[0-9]{9}$/)
        .withMessage('Please enter a valid Egyptian phone number'),
    body('age')
        .optional()
        .isInt({ min: 16, max: 100 })
        .withMessage('Age must be between 16 and 100'),
    body('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),
    body('fitnessGoals')
        .optional()
        .isArray()
        .withMessage('Fitness goals must be an array'),
    body('fitnessGoals.*')
        .optional()
        .isIn(['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'strength', 'general_fitness'])
        .withMessage('Invalid fitness goal'),
    body('medicalConditions')
        .optional()
        .isArray()
        .withMessage('Medical conditions must be an array'),
    body('emergencyContact.name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Emergency contact name must be between 2 and 50 characters'),
    body('emergencyContact.phone')
        .optional()
        .matches(/^(\+201|01)[0-9]{9}$/)
        .withMessage('Please enter a valid Egyptian phone number for emergency contact'),
    body('emergencyContact.relationship')
        .optional()
        .trim()
        .isLength({ min: 2, max: 30 })
        .withMessage('Relationship must be between 2 and 30 characters')
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('New password must be different from current password');
            }
            return true;
        })
];

const forgotPasswordValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email address')
];

const resetPasswordValidation = [
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('token')
        .notEmpty()
        .withMessage('Reset token is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.put('/change-password', protect, changePasswordValidation, changePassword);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);

// Validation routes for AJAX
router.get('/check-username/:username', checkUsername);
router.get('/check-email/:email', checkEmail);
router.get('/check-phone/:phone', checkPhone);

module.exports = router; 