const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^(\+201|01)[0-9]{9}$/, 'Please enter a valid Egyptian phone number']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [100, 'Subject cannot be more than 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [1000, 'Message cannot be more than 1000 characters']
    },
    inquiryType: {
        type: String,
        enum: ['general', 'membership', 'training', 'classes', 'equipment', 'other'],
        default: 'general'
    },
    preferredContact: {
        type: String,
        enum: ['email', 'phone', 'whatsapp'],
        default: 'email'
    },
    status: {
        type: String,
        enum: ['new', 'in_progress', 'responded', 'closed'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    responseMessage: {
        type: String,
        maxlength: [1000, 'Response message cannot be more than 1000 characters']
    },
    respondedAt: {
        type: Date
    },
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: [{
        type: String,
        trim: true
    }],
    source: {
        type: String,
        enum: ['website', 'phone', 'walk_in', 'social_media'],
        default: 'website'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

// Index for better query performance
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ inquiryType: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ email: 1 });

// Virtual for response time
contactSchema.virtual('responseTime').get(function() {
    if (this.respondedAt && this.createdAt) {
        return this.respondedAt - this.createdAt;
    }
    return null;
});

// Virtual for response time in hours
contactSchema.virtual('responseTimeHours').get(function() {
    if (this.responseTime) {
        return Math.round(this.responseTime / (1000 * 60 * 60));
    }
    return null;
});

// Method to mark as responded
contactSchema.methods.markAsResponded = function(responseMessage, respondedBy) {
    this.status = 'responded';
    this.responseMessage = responseMessage;
    this.respondedAt = new Date();
    this.respondedBy = respondedBy;
    return this.save();
};

// Method to update status
contactSchema.methods.updateStatus = function(status, assignedTo = null) {
    this.status = status;
    if (assignedTo) {
        this.assignedTo = assignedTo;
    }
    return this.save();
};

// Static method to get contact statistics
contactSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    
    const total = await this.countDocuments();
    const newContacts = await this.countDocuments({ status: 'new' });
    const responded = await this.countDocuments({ status: 'responded' });
    
    return {
        total,
        new: newContacts,
        responded,
        responseRate: total > 0 ? Math.round((responded / total) * 100) : 0,
        breakdown: stats
    };
};

// Static method to get average response time
contactSchema.statics.getAverageResponseTime = async function() {
    const result = await this.aggregate([
        {
            $match: {
                respondedAt: { $exists: true },
                createdAt: { $exists: true }
            }
        },
        {
            $group: {
                _id: null,
                avgResponseTime: {
                    $avg: { $subtract: ['$respondedAt', '$createdAt'] }
                }
            }
        }
    ]);
    
    if (result.length > 0) {
        return Math.round(result[0].avgResponseTime / (1000 * 60 * 60)); // in hours
    }
    return 0;
};

module.exports = mongoose.model('Contact', contactSchema); 