const Session = require('../models/Session');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all sessions with pagination
// @route   GET /api/sessions
// @access  Public
const getSessions = async (req, res) => {
    try {
        const { type, date, trainer, difficulty, page = 1, limit = 20 } = req.query;
        
        const filter = { isActive: true };
        
        // Filter by session type
        if (type) {
            filter.type = type;
        }
        
        // Filter by date
        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);
            filter.date = { $gte: searchDate, $lt: nextDay };
        }
        
        // Filter by trainer
        if (trainer) {
            filter.trainer = trainer;
        }
        
        // Filter by difficulty
        if (difficulty) {
            filter.difficulty = difficulty;
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = pageNum * limitNum;

        // Get total count for pagination info
        const total = await Session.countDocuments(filter);
        
        const sessions = await Session.find(filter)
            .populate('trainer', 'name email')
            .sort({ date: 1, time: 1 })
            .limit(limitNum)
            .skip(startIndex);
        
        // Add virtual fields to response
        const sessionsWithVirtuals = sessions.map(session => ({
            ...session.toObject(),
            availableSlots: session.availableSlots,
            isFull: session.isFull,
            formattedDateTime: session.formattedDateTime
        }));

        // Pagination info
        const pagination = {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalItems: total,
            itemsPerPage: limitNum,
            hasNextPage: endIndex < total,
            hasPrevPage: pageNum > 1
        };
        
        res.status(200).json({
            success: true,
            pagination,
            data: {
                sessions: sessionsWithVirtuals
            }
        });
        
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get sessions',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get single session
// @route   GET /api/sessions/:id
// @access  Public
const getSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)
            .populate('trainer', 'name email');
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        
        // Get reservations for this session
        const reservations = await Reservation.getSessionReservations(session._id);
        
        res.status(200).json({
            success: true,
            data: {
                session: {
                    ...session.toObject(),
                    availableSlots: session.availableSlots,
                    isFull: session.isFull,
                    formattedDateTime: session.formattedDateTime
                },
                reservations: reservations.length,
                attendees: reservations.map(r => ({
                    id: r.userId._id,
                    name: r.userId.name,
                    email: r.userId.email
                }))
            }
        });
        
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get session',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Create session (Admin only)
// @route   POST /api/sessions
// @access  Private/Admin
const createSession = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        
        const {
            name,
            type,
            date,
            time,
            duration,
            maxCapacity,
            trainer,
            price,
            description,
            location,
            tags,
            equipment,
            difficulty
        } = req.body;
        
        // Validate trainer exists and is a trainer
        if (trainer) {
            const trainerUser = await User.findById(trainer);
            if (!trainerUser || trainerUser.role !== 'trainer') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid trainer selected'
                });
            }
        }
        
        const session = await Session.create({
            name,
            type,
            date,
            time,
            duration,
            maxCapacity,
            trainer,
            price,
            description,
            location,
            tags,
            equipment,
            difficulty
        });
        
        await session.populate('trainer', 'name email');
        
        res.status(201).json({
            success: true,
            message: 'Session created successfully',
            data: {
                session: {
                    ...session.toObject(),
                    availableSlots: session.availableSlots,
                    isFull: session.isFull,
                    formattedDateTime: session.formattedDateTime
                }
            }
        });
        
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create session',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Update session (Admin only)
// @route   PUT /api/sessions/:id
// @access  Private/Admin
const updateSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        
        const updateFields = req.body;
        
        // Validate trainer if being updated
        if (updateFields.trainer) {
            const trainerUser = await User.findById(updateFields.trainer);
            if (!trainerUser || trainerUser.role !== 'trainer') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid trainer selected'
                });
            }
        }
        
        // Update fields
        Object.keys(updateFields).forEach(key => {
            session[key] = updateFields[key];
        });
        
        await session.save();
        await session.populate('trainer', 'name email');
        
        res.status(200).json({
            success: true,
            message: 'Session updated successfully',
            data: {
                session: {
                    ...session.toObject(),
                    availableSlots: session.availableSlots,
                    isFull: session.isFull,
                    formattedDateTime: session.formattedDateTime
                }
            }
        });
        
    } catch (error) {
        console.error('Update session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update session',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Delete session (Admin only)
// @route   DELETE /api/sessions/:id
// @access  Private/Admin
const deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        
        // Check if there are active reservations
        const activeReservations = await Reservation.countDocuments({
            sessionId: session._id,
            status: 'confirmed'
        });
        
        if (activeReservations > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete session. ${activeReservations} active reservations exist.`
            });
        }
        
        // Soft delete - deactivate the session
        session.isActive = false;
        await session.save();
        
        res.status(200).json({
            success: true,
            message: 'Session deactivated successfully'
        });
        
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete session',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Reserve session
// @route   POST /api/sessions/:id/reserve
// @access  Private
const reserveSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        
        if (!session.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Session is not active'
            });
        }
        
        if (session.isFull) {
            return res.status(400).json({
                success: false,
                message: 'Session is at maximum capacity'
            });
        }
        
        const user = await User.findById(req.user.id);
        
        // Check if user already has a reservation for this session
        const existingReservation = await Reservation.findOne({
            userId: user._id,
            sessionId: session._id
        });
        
        if (existingReservation) {
            return res.status(400).json({
                success: false,
                message: 'You already have a reservation for this session'
            });
        }
        
        // Check membership tier restrictions
        let isPaid = false;
        let paymentAmount = 0;
        
        if (session.type === 'private-session' || session.type === 'private-coach') {
            if (user.membershipType === 'standard') {
                // Standard members must pay for private sessions
                isPaid = false;
                paymentAmount = session.price;
            } else if (user.membershipType === 'elite') {
                // Elite members get personal training sessions included
                if (user.personalTrainingSessionsRemaining > 0) {
                    user.personalTrainingSessionsRemaining -= 1;
                    await user.save();
                    isPaid = true;
                    paymentAmount = 0;
                } else {
                    // No sessions remaining, must pay
                    isPaid = false;
                    paymentAmount = session.price;
                }
            } else {
                // Premium members must pay for private sessions
                isPaid = false;
                paymentAmount = session.price;
            }
        } else if (session.type === 'group') {
            // Group classes are included for Premium and Elite
            if (user.membershipType === 'premium' || user.membershipType === 'elite') {
                isPaid = true;
                paymentAmount = 0;
            } else {
                // Standard members must pay for group classes
                isPaid = false;
                paymentAmount = session.price;
            }
        }
        
        // Create reservation
        const reservation = await Reservation.create({
            userId: user._id,
            sessionId: session._id,
            isPaid,
            paymentAmount,
            status: 'confirmed'
        });
        
        // Update session's current bookings count
        session.currentBookings += 1;
        await session.save();
        
        await reservation.populate('sessionId');
        
        res.status(201).json({
            success: true,
            message: 'Session reserved successfully',
            data: {
                reservation: {
                    id: reservation._id,
                    session: reservation.sessionId,
                    isPaid: reservation.isPaid,
                    paymentAmount: reservation.paymentAmount,
                    status: reservation.status
                },
                user: {
                    personalTrainingSessionsRemaining: user.personalTrainingSessionsRemaining
                }
            }
        });
        
    } catch (error) {
        console.error('Reserve session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reserve session',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get session statistics (Admin only)
// @route   GET /api/sessions/stats
// @access  Private/Admin
const getSessionStats = async (req, res) => {
    try {
        const stats = await Session.getSessionStats();
        
        res.status(200).json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Get session stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get session statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get upcoming sessions
// @route   GET /api/sessions/upcoming
// @access  Public
const getUpcomingSessions = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const sessions = await Session.getUpcomingSessions(parseInt(limit));
        
        const sessionsWithVirtuals = sessions.map(session => ({
            ...session.toObject(),
            availableSlots: session.availableSlots,
            isFull: session.isFull,
            formattedDateTime: session.formattedDateTime
        }));
        
        res.status(200).json({
            success: true,
            data: {
                sessions: sessionsWithVirtuals
            }
        });
        
    } catch (error) {
        console.error('Get upcoming sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get upcoming sessions',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getSessions,
    getSession,
    createSession,
    updateSession,
    deleteSession,
    reserveSession,
    getSessionStats,
    getUpcomingSessions
}; 