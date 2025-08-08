const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Session name is required'],
        trim: true,
        maxlength: [100, 'Session name cannot be more than 100 characters']
    },
    type: {
        type: String,
        enum: ['group', 'private-coach', 'private-session'],
        required: [true, 'Session type is required']
    },
    date: {
        type: Date,
        required: [true, 'Session date is required']
    },
    time: {
        type: String,
        required: [true, 'Session time is required'],
        match: [/^(1[0-2]|[1-9]):[0-5][0-9] (AM|PM)$/, 'Please enter a valid time format (e.g., "10:00 AM")']
    },
    duration: {
        type: Number,
        default: 60, // minutes
        min: [15, 'Session duration must be at least 15 minutes'],
        max: [180, 'Session duration cannot exceed 3 hours']
    },
    maxCapacity: {
        type: Number,
        required: [true, 'Maximum capacity is required'],
        min: [1, 'Maximum capacity must be at least 1']
    },
    currentBookings: {
        type: Number,
        default: 0,
        min: [0, 'Current bookings cannot be negative']
    },
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() {
            return this.type === 'private-coach' || this.type === 'private-session';
        }
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'Price cannot be negative']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    location: {
        type: String,
        default: 'Main Gym Area'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    equipment: [{
        type: String,
        trim: true
    }],
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate'
    }
}, {
    timestamps: true
});

// Index for better query performance
sessionSchema.index({ date: 1, time: 1 });
sessionSchema.index({ type: 1, isActive: 1 });
sessionSchema.index({ trainer: 1 });

// Virtual for available slots
sessionSchema.virtual('availableSlots').get(function() {
    return Math.max(0, this.maxCapacity - this.currentBookings);
});

// Virtual for isFull
sessionSchema.virtual('isFull').get(function() {
    return this.currentBookings >= this.maxCapacity;
});

// Virtual for formatted date and time
sessionSchema.virtual('formattedDateTime').get(function() {
    const date = new Date(this.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    return `${formattedDate} at ${this.time}`;
});

// Method to check if session can accept more bookings
sessionSchema.methods.canAcceptBookings = function() {
    return this.isActive && this.currentBookings < this.maxCapacity;
};

// Method to add booking
sessionSchema.methods.addBooking = function() {
    if (this.currentBookings >= this.maxCapacity) {
        throw new Error('Session is at maximum capacity');
    }
    this.currentBookings += 1;
    return this.save();
};

// Method to remove booking
sessionSchema.methods.removeBooking = function() {
    if (this.currentBookings > 0) {
        this.currentBookings -= 1;
        return this.save();
    }
    return this;
};

// Static method to get upcoming sessions
sessionSchema.statics.getUpcomingSessions = function(limit = 10) {
    const now = new Date();
    return this.find({
        date: { $gte: now },
        isActive: true
    })
    .sort({ date: 1, time: 1 })
    .limit(limit)
    .populate('trainer', 'name email');
};

// Static method to get sessions by date range
sessionSchema.statics.getSessionsByDateRange = function(startDate, endDate) {
    return this.find({
        date: { $gte: startDate, $lte: endDate },
        isActive: true
    })
    .sort({ date: 1, time: 1 })
    .populate('trainer', 'name email');
};

// Static method to get session statistics
sessionSchema.statics.getSessionStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalBookings: { $sum: '$currentBookings' },
                avgCapacity: { $avg: '$maxCapacity' }
            }
        }
    ]);
    
    const totalSessions = await this.countDocuments({ isActive: true });
    const upcomingSessions = await this.countDocuments({
        date: { $gte: new Date() },
        isActive: true
    });
    
    return {
        totalSessions,
        upcomingSessions,
        breakdown: stats
    };
};

module.exports = mongoose.model('Session', sessionSchema); 