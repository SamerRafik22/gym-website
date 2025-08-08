const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Membership name is required'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    type: {
        type: String,
        enum: ['basic', 'premium', 'elite'],
        required: [true, 'Membership type is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 month']
    },
    durationUnit: {
        type: String,
        enum: ['days', 'weeks', 'months', 'years'],
        default: 'months'
    },
    features: [{
        type: String,
        required: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    maxMembers: {
        type: Number,
        default: null // null means unlimited
    },
    currentMembers: {
        type: Number,
        default: 0
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%']
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date
    },
    terms: [{
        type: String
    }],
    restrictions: [{
        type: String
    }]
}, {
    timestamps: true
});

// Index for better query performance
membershipSchema.index({ type: 1, isActive: 1 });
membershipSchema.index({ isPopular: 1 });

// Virtual for discounted price
membershipSchema.virtual('discountedPrice').get(function() {
    if (this.discountPercentage > 0) {
        return this.price - (this.price * this.discountPercentage / 100);
    }
    return this.price;
});

// Virtual for availability
membershipSchema.virtual('isAvailable').get(function() {
    if (!this.isActive) return false;
    if (this.maxMembers && this.currentMembers >= this.maxMembers) return false;
    if (this.validUntil && new Date() > this.validUntil) return false;
    return true;
});

// Method to check if membership can accept new members
membershipSchema.methods.canAcceptMembers = function() {
    return this.isAvailable;
};

// Method to increment member count
membershipSchema.methods.addMember = function() {
    if (this.maxMembers && this.currentMembers >= this.maxMembers) {
        throw new Error('Membership is at maximum capacity');
    }
    this.currentMembers += 1;
    return this.save();
};

// Method to decrement member count
membershipSchema.methods.removeMember = function() {
    if (this.currentMembers > 0) {
        this.currentMembers -= 1;
        return this.save();
    }
    return this;
};

// Remove sensitive fields from JSON output
membershipSchema.methods.toJSON = function() {
    const membershipObject = this.toObject();
    return membershipObject;
};

module.exports = mongoose.model('Membership', membershipSchema); 