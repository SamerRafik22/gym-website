const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: [true, 'Session ID is required']
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paymentAmount: {
        type: Number,
        default: 0,
        min: [0, 'Payment amount cannot be negative']
    },
    status: {
        type: String,
        enum: ['confirmed', 'pending', 'cancelled', 'completed'],
        default: 'confirmed'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    cancellationReason: {
        type: String,
        maxlength: [200, 'Cancellation reason cannot be more than 200 characters']
    },
    cancelledAt: {
        type: Date
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    attendance: {
        type: String,
        enum: ['attended', 'no-show', 'cancelled'],
        default: undefined
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for better query performance
reservationSchema.index({ userId: 1, bookingDate: -1 });
reservationSchema.index({ sessionId: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ isPaid: 1 });

// Compound index for unique user-session combinations
reservationSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

// Virtual for session details
reservationSchema.virtual('sessionDetails', {
    ref: 'Session',
    localField: 'sessionId',
    foreignField: '_id',
    justOne: true
});

// Virtual for user details
reservationSchema.virtual('userDetails', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Method to cancel reservation
reservationSchema.methods.cancelReservation = function(reason, cancelledBy) {
    this.status = 'cancelled';
    this.cancellationReason = reason;
    this.cancelledAt = new Date();
    this.cancelledBy = cancelledBy;
    return this.save();
};

// Method to mark as attended
reservationSchema.methods.markAttended = function() {
    this.attendance = 'attended';
    this.checkInTime = new Date();
    return this.save();
};

// Method to mark as no-show
reservationSchema.methods.markNoShow = function() {
    this.attendance = 'no-show';
    return this.save();
};

// Method to check out
reservationSchema.methods.checkOut = function() {
    this.checkOutTime = new Date();
    return this.save();
};

// Static method to get user reservations
reservationSchema.statics.getUserReservations = function(userId, status = null) {
    const filter = { userId };
    if (status) {
        filter.status = status;
    }
    
    return this.find(filter)
        .populate('sessionId')
        .sort({ bookingDate: -1 });
};

// Static method to get session reservations
reservationSchema.statics.getSessionReservations = function(sessionId) {
    return this.find({ sessionId })
        .populate('userId', 'name email phone')
        .sort({ bookingDate: 1 });
};

// Static method to get upcoming reservations
reservationSchema.statics.getUpcomingReservations = function(userId) {
    const now = new Date();
    return this.find({
        userId,
        status: 'confirmed',
        bookingDate: { $gte: now }
    })
    .populate({
        path: 'sessionId',
        match: { isActive: true }
    })
    .sort({ bookingDate: 1 });
};

// Static method to get reservation statistics
reservationSchema.statics.getReservationStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    
    const totalReservations = await this.countDocuments();
    const confirmedReservations = await this.countDocuments({ status: 'confirmed' });
    const paidReservations = await this.countDocuments({ isPaid: true });
    const attendedReservations = await this.countDocuments({ attendance: 'attended' });
    
    // Calculate attendance rate
    const totalCompleted = await this.countDocuments({ 
        status: { $in: ['confirmed', 'completed'] },
        attendance: { $in: ['attended', 'no-show'] }
    });
    
    const attendanceRate = totalCompleted > 0 ? 
        Math.round((attendedReservations / totalCompleted) * 100) : 0;
    
    return {
        totalReservations,
        confirmedReservations,
        paidReservations,
        attendedReservations,
        attendanceRate,
        breakdown: stats
    };
};

// Static method to get revenue statistics
reservationSchema.statics.getRevenueStats = async function(startDate, endDate) {
    const matchStage = {};
    if (startDate && endDate) {
        matchStage.bookingDate = { $gte: startDate, $lte: endDate };
    }
    
    const revenueStats = await this.aggregate([
        { $match: { ...matchStage, isPaid: true } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$paymentAmount' },
                totalPaidReservations: { $sum: 1 },
                avgPayment: { $avg: '$paymentAmount' }
            }
        }
    ]);
    
    return revenueStats[0] || {
        totalRevenue: 0,
        totalPaidReservations: 0,
        avgPayment: 0
    };
};

// Pre-save middleware to validate session capacity
reservationSchema.pre('save', async function(next) {
    if (this.isNew && this.status === 'confirmed') {
        const Session = mongoose.model('Session');
        const session = await Session.findById(this.sessionId);
        
        if (!session) {
            return next(new Error('Session not found'));
        }
        
        if (!session.canAcceptBookings()) {
            return next(new Error('Session is at maximum capacity'));
        }
        
        // Increment session bookings
        await session.addBooking();
    }
    
    next();
});

// Pre-remove middleware to decrement session bookings
reservationSchema.pre('remove', async function(next) {
    if (this.status === 'confirmed') {
        const Session = mongoose.model('Session');
        const session = await Session.findById(this.sessionId);
        
        if (session) {
            await session.removeBooking();
        }
    }
    
    next();
});

module.exports = mongoose.model('Reservation', reservationSchema); 