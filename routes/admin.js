const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
    // User management
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    
    // Session management
    getAllSessions,
    getSession,
    createSession,
    updateSession,
    deleteSession,
    
    // Reservation management
    getAllReservations,
    updateReservationStatus,
    
    // Nutrition plan management
    getAllNutritionPlans,
    getNutritionPlan,
    createNutritionPlan,
    updateNutritionPlan,
    deleteNutritionPlan,
    assignNutritionPlan,
    getMembersForAssignment,
    
    // Analytics
    getDashboardStats
} = require('../controllers/adminController');

const router = express.Router();

// Apply protection and admin check to all routes
router.use(protect);
router.use(adminOnly);

// ========== USER MANAGEMENT ROUTES ==========
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:userId/nutrition-plan', assignNutritionPlan);

// ========== SESSION MANAGEMENT ROUTES ==========
const sessionValidation = [
    body('name')
        .notEmpty()
        .withMessage('Session name is required')
        .isLength({ max: 100 })
        .withMessage('Session name must be less than 100 characters'),
    body('type')
        .isIn(['group', 'private-coach', 'private-session'])
        .withMessage('Invalid session type'),
    body('date')
        .isISO8601()
        .withMessage('Invalid date format'),
    body('time')
        .notEmpty()
        .withMessage('Time is required'),
    body('maxCapacity')
        .isInt({ min: 1, max: 100 })
        .withMessage('Max capacity must be between 1 and 100')
];

router.get('/sessions', getAllSessions);
router.get('/sessions/:id', getSession);
router.post('/sessions', sessionValidation, createSession);
router.put('/sessions/:id', sessionValidation, updateSession);
router.delete('/sessions/:id', deleteSession);

// ========== RESERVATION MANAGEMENT ROUTES ==========
router.get('/reservations', getAllReservations);
router.put('/reservations/:id', [
    body('status')
        .isIn(['pending', 'confirmed', 'cancelled'])
        .withMessage('Invalid reservation status')
], updateReservationStatus);

// ========== NUTRITION PLAN MANAGEMENT ROUTES ==========
const nutritionValidation = [
    body('assignedTo')
        .notEmpty()
        .withMessage('Member assignment is required'),
    body('planTitle')
        .optional()
        .isString()
        .withMessage('Plan title must be a string'),
    body('goals')
        .optional()
        .isString()
        .withMessage('Goals must be a string'),
    body('notes')
        .optional()
        .isString()
        .withMessage('Notes must be a string'),
    body('targetCalories')
        .optional()
        .isNumeric()
        .withMessage('Target calories must be a number'),
    body('targetProtein')
        .optional()
        .isNumeric()
        .withMessage('Target protein must be a number'),
    body('targetWater')
        .optional()
        .isNumeric()
        .withMessage('Target water must be a number')
];

router.get('/nutrition-plans', getAllNutritionPlans);
router.get('/nutrition-plans/:id', getNutritionPlan);
router.get('/members-for-nutrition', getMembersForAssignment);
router.post('/nutrition-plans', nutritionValidation, createNutritionPlan);
router.put('/nutrition-plans/:id', nutritionValidation, updateNutritionPlan);
router.delete('/nutrition-plans/:id', deleteNutritionPlan);

// ========== ANALYTICS ROUTES ==========
router.get('/stats', getDashboardStats);

module.exports = router; 