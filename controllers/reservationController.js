const Reservation = require('../models/Reservation');
const Session = require('../models/Session');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get user reservations
// @route   GET /api/reservations
// @access  Private
const getUserReservations = async (req, res) => {
    try {
        const { status, limit = 20 } = req.query;
        
        const reservations = await Reservation.getUserReservations(req.user.id, status);
        
        // Limit results if specified
        const limitedReservations = limit ? reservations.slice(0, parseInt(limit)) : reservations;
        
        res.status(200).json({
            success: true,
            data: {
                reservations: limitedReservations,
                total: reservations.length
            }
        });
        
    } catch (error) {
        console.error('Get user reservations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get reservations',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
const getReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('sessionId')
            .populate('userId', 'name email phone');
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }
        
        // Check if user owns this reservation or is admin
        if (reservation.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this reservation'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                reservation
            }
        });
        
    } catch (error) {
        console.error('Get reservation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get reservation',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Private
const cancelReservation = async (req, res) => {
    try {
        const { reason } = req.body;
        
        const reservation = await Reservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }
        
        // Check if user owns this reservation or is admin
        if (reservation.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this reservation'
            });
        }
        
        // Check if reservation can be cancelled
        if (reservation.status !== 'confirmed') {
            return res.status(400).json({
                success: false,
                message: 'Reservation cannot be cancelled'
            });
        }
        
        // Check if session is in the future
        const session = await Session.findById(reservation.sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        
        const sessionDateTime = new Date(session.date);
        const sessionTime = session.time;
        const [hours, minutes] = sessionTime.match(/(\d+):(\d+) (AM|PM)/).slice(1);
        let hour = parseInt(hours);
        if (sessionTime.includes('PM') && hour !== 12) hour += 12;
        if (sessionTime.includes('AM') && hour === 12) hour = 0;
        sessionDateTime.setHours(hour, parseInt(minutes), 0, 0);
        
        const now = new Date();
        const timeDifference = sessionDateTime.getTime() - now.getTime();
        const hoursDifference = timeDifference / (1000 * 60 * 60);
        
        // Allow cancellation up to 2 hours before session
        if (hoursDifference < 2) {
            return res.status(400).json({
                success: false,
                message: 'Reservation can only be cancelled up to 2 hours before the session'
            });
        }
        
        // Cancel the reservation
        await reservation.cancelReservation(reason, req.user.id);
        
        // Refund personal training session if applicable
        if (!reservation.isPaid && reservation.paymentAmount > 0) {
            const user = await User.findById(reservation.userId);
            if (user && user.membershipType === 'elite') {
                user.personalTrainingSessionsRemaining += 1;
                await user.save();
            }
        }
        
        await reservation.populate('sessionId');
        
        res.status(200).json({
            success: true,
            message: 'Reservation cancelled successfully',
            data: {
                reservation
            }
        });
        
    } catch (error) {
        console.error('Cancel reservation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel reservation',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Mark reservation as attended (Admin/Trainer only)
// @route   PUT /api/reservations/:id/attend
// @access  Private/Admin
const markAttended = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }
        
        if (reservation.status !== 'confirmed') {
            return res.status(400).json({
                success: false,
                message: 'Only confirmed reservations can be marked as attended'
            });
        }
        
        await reservation.markAttended();
        await reservation.populate('sessionId');
        
        res.status(200).json({
            success: true,
            message: 'Reservation marked as attended',
            data: {
                reservation
            }
        });
        
    } catch (error) {
        console.error('Mark attended error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark reservation as attended',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Mark reservation as no-show (Admin/Trainer only)
// @route   PUT /api/reservations/:id/no-show
// @access  Private/Admin
const markNoShow = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }
        
        if (reservation.status !== 'confirmed') {
            return res.status(400).json({
                success: false,
                message: 'Only confirmed reservations can be marked as no-show'
            });
        }
        
        await reservation.markNoShow();
        await reservation.populate('sessionId');
        
        res.status(200).json({
            success: true,
            message: 'Reservation marked as no-show',
            data: {
                reservation
            }
        });
        
    } catch (error) {
        console.error('Mark no-show error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark reservation as no-show',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get all reservations (Admin only)
// @route   GET /api/admin/reservations
// @access  Private/Admin
const getAllReservations = async (req, res) => {
    try {
        const { 
            status, 
            sessionId, 
            userId, 
            date, 
            isPaid,
            limit = 50,
            page = 1
        } = req.query;
        
        const filter = {};
        
        if (status) filter.status = status;
        if (sessionId) filter.sessionId = sessionId;
        if (userId) filter.userId = userId;
        if (isPaid !== undefined) filter.isPaid = isPaid === 'true';
        
        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);
            filter.bookingDate = { $gte: searchDate, $lt: nextDay };
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const reservations = await Reservation.find(filter)
            .populate('sessionId')
            .populate('userId', 'name email phone')
            .sort({ bookingDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Reservation.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            data: {
                reservations,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / parseInt(limit)),
                    totalRecords: total
                }
            }
        });
        
    } catch (error) {
        console.error('Get all reservations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get reservations',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get reservation statistics (Admin only)
// @route   GET /api/admin/reservations/stats
// @access  Private/Admin
const getReservationStats = async (req, res) => {
    try {
        const stats = await Reservation.getReservationStats();
        
        res.status(200).json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Get reservation stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get reservation statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get revenue statistics (Admin only)
// @route   GET /api/admin/reservations/revenue
// @access  Private/Admin
const getRevenueStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let start, end;
        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        }
        
        const revenueStats = await Reservation.getRevenueStats(start, end);
        
        res.status(200).json({
            success: true,
            data: revenueStats
        });
        
    } catch (error) {
        console.error('Get revenue stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get revenue statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Update reservation payment status (Admin only)
// @route   PUT /api/admin/reservations/:id/payment
// @access  Private/Admin
const updatePaymentStatus = async (req, res) => {
    try {
        const { isPaid, paymentAmount } = req.body;
        
        const reservation = await Reservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }
        
        reservation.isPaid = isPaid;
        if (paymentAmount !== undefined) {
            reservation.paymentAmount = paymentAmount;
        }
        
        await reservation.save();
        await reservation.populate('sessionId');
        
        res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            data: {
                reservation
            }
        });
        
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getUserReservations,
    getReservation,
    cancelReservation,
    markAttended,
    markNoShow,
    getAllReservations,
    getReservationStats,
    getRevenueStats,
    updatePaymentStatus
}; 