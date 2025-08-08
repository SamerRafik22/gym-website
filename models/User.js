const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [20, 'Username cannot be more than 20 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        minlength: [10, 'Phone number must be at least 10 characters'],
        maxlength: [15, 'Phone number cannot be more than 15 characters']
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [16, 'Age must be at least 16'],
        max: [100, 'Age cannot be more than 100']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: [true, 'Gender is required']
    },
    membershipType: {
        type: String,
        enum: ['standard', 'premium', 'elite'],
        default: 'standard'
    },
    membershipStatus: {
        type: String,
        enum: ['active', 'inactive', 'expired', 'pending'],
        default: 'pending'
    },
    guestPassesRemaining: {
        type: Number,
        default: 0,
        min: [0, 'Guest passes cannot be negative']
    },
    personalTrainingSessionsRemaining: {
        type: Number,
        default: 0,
        min: [0, 'Training sessions cannot be negative']
    },
    nutritionPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NutritionPlan'
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    membershipExpiry: {
        type: Date
    },
    profileImage: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    zipCode: {
        type: String,
        default: ''
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    billingType: {
        type: String,
        enum: ['monthly', 'annual'],
        default: 'monthly'
    },
    fitnessGoals: [{
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'strength', 'general_fitness']
    }],
    medicalConditions: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['member', 'trainer', 'admin'],
        default: 'member'
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ membershipStatus: 1 });
userSchema.index({ membershipType: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Get membership days remaining
userSchema.methods.getMembershipDaysRemaining = function() {
    if (!this.membershipExpiry) return 0;
    const now = new Date();
    const expiry = new Date(this.membershipExpiry);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

// Check if membership is active
userSchema.methods.isMembershipActive = function() {
    return this.membershipStatus === 'active' && this.getMembershipDaysRemaining() > 0;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return this.name;
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

// Static method to create first admin user
userSchema.statics.createFirstAdmin = async function() {
    try {
        // Check if any admin exists
        const adminExists = await this.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Admin user already exists');
            return;
        }
        
        // Create first admin from environment variables
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@redefinelab.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
        
        const adminUser = await this.create({
            name: 'System Admin',
            email: adminEmail,
            username: 'admin',
            password: adminPassword,
            phone: '1234567890',
            age: 30,
            dateOfBirth: new Date('1990-01-01'),
            gender: 'other',
            membershipType: 'elite',
            membershipStatus: 'active',
            role: 'admin',
            isActive: true
        });
        
        console.log(`✅ First admin user created: ${adminEmail}`);
        console.log(`🔐 Default password: ${adminPassword}`);
        console.log('⚠️  Please change the password after first login!');
        
    } catch (error) {
        console.error('Error creating first admin:', error);
    }
};

module.exports = mongoose.model('User', userSchema); 