const express = require('express');
const { body } = require('express-validator');
const {
    getSessions,
    getSession,
    createSession,
    updateSession,
    deleteSession,
    reserveSession,
    getSessionStats,
    getUpcomingSessions
} = require('../controllers/sessionController');

const { protect, authorize } = require('../utils/auth');

const router = express.Router();

// Public routes
router.get('/', getSessions);
router.get('/upcoming', getUpcomingSessions);
router.get('/:id', getSession);

// Protected routes
router.use(protect);

// User routes
router.post('/:id/reserve', reserveSession);

// Admin routes
router.use(authorize('admin'));

router.get('/stats', getSessionStats);

router.post('/', [
    body('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Session name must be between 3 and 100 characters'),
    body('type')
        .isIn(['group', 'private-coach', 'private-session'])
        .withMessage('Invalid session type'),
    body('date')
        .isISO8601()
        .withMessage('Invalid date format'),
    body('time')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/)
        .withMessage('Invalid time format (e.g., "10:00 AM")'),
    body('duration')
        .optional()
        .isInt({ min: 15, max: 180 })
        .withMessage('Duration must be between 15 and 180 minutes'),
    body('maxCapacity')
        .isInt({ min: 1 })
        .withMessage('Maximum capacity must be at least 1'),
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('difficulty')
        .optional()
        .isIn(['beginner', 'intermediate', 'advanced'])
        .withMessage('Invalid difficulty level')
], createSession);

router.put('/:id', [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Session name must be between 3 and 100 characters'),
    body('type')
        .optional()
        .isIn(['group', 'private-coach', 'private-session'])
        .withMessage('Invalid session type'),
    body('date')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),
    body('time')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/)
        .withMessage('Invalid time format (e.g., "10:00 AM")'),
    body('duration')
        .optional()
        .isInt({ min: 15, max: 180 })
        .withMessage('Duration must be between 15 and 180 minutes'),
    body('maxCapacity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Maximum capacity must be at least 1'),
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('difficulty')
        .optional()
        .isIn(['beginner', 'intermediate', 'advanced'])
        .withMessage('Invalid difficulty level')
], updateSession);

router.delete('/:id', deleteSession);

module.exports = router; 