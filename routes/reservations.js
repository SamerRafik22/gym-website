const express = require('express');
const { body } = require('express-validator');
const {
    getUserReservations,
    getReservation,
    cancelReservation,
    markAttended,
    markNoShow,
    getAllReservations,
    getReservationStats,
    getRevenueStats,
    updatePaymentStatus
} = require('../controllers/reservationController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.get('/', getUserReservations);
router.get('/:id', getReservation);
router.put('/:id/cancel', [
    body('reason')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Cancellation reason cannot exceed 200 characters')
], cancelReservation);

// Admin routes
router.use(authorize('admin'));

router.get('/admin/all', getAllReservations);
router.get('/admin/stats', getReservationStats);
router.get('/admin/revenue', getRevenueStats);

router.put('/:id/attend', markAttended);
router.put('/:id/no-show', markNoShow);
router.put('/:id/payment', [
    body('isPaid')
        .isBoolean()
        .withMessage('isPaid must be a boolean'),
    body('paymentAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Payment amount must be a positive number')
], updatePaymentStatus);

module.exports = router; 