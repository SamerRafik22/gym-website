const express = require('express');
const { body } = require('express-validator');
const {
    getUserNutritionPlan,
    getAllNutritionPlans,
    getNutritionPlan,
    createNutritionPlan,
    updateNutritionPlan,
    deleteNutritionPlan,
    getMembersForAssignment
} = require('../controllers/nutritionController');

const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.get('/me', getUserNutritionPlan);

// Admin routes
router.use(adminOnly);

router.get('/admin/all', getAllNutritionPlans);
router.get('/admin/members', getMembersForAssignment);
router.get('/admin/:id', getNutritionPlan);

router.post('/admin', [
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
], createNutritionPlan);

router.put('/admin/:id', [
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
], updateNutritionPlan);

router.delete('/admin/:id', deleteNutritionPlan);

module.exports = router; 