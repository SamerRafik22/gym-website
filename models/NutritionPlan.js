const mongoose = require('mongoose');

const nutritionPlanSchema = new mongoose.Schema({
    // Member assignment - each plan is for one specific member
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Each member can only have one nutrition plan
    },
    memberName: {
        type: String,
        required: true
    },
    memberEmail: {
        type: String,
        required: true
    },
    
    // Plan details
    planTitle: {
        type: String,
        required: true,
        default: 'Custom Nutrition Plan'
    },
    goals: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    
    // Weekly nutrition schedule - simple table format
    schedule: {
        monday: {
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' },
            snacks: { type: String, default: '' }
        },
        tuesday: {
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' },
            snacks: { type: String, default: '' }
        },
        wednesday: {
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' },
            snacks: { type: String, default: '' }
        },
        thursday: {
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' },
            snacks: { type: String, default: '' }
        },
        friday: {
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' },
            snacks: { type: String, default: '' }
        },
        saturday: {
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' },
            snacks: { type: String, default: '' }
        },
        sunday: {
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' },
            snacks: { type: String, default: '' }
        }
    },
    
    // Goals and targets (optional)
    targetCalories: {
        type: Number,
        default: 2000
    },
    targetProtein: {
        type: Number,
        default: 150
    },
    targetWater: {
        type: Number,
        default: 2.5 // liters
    },
    
    // Admin info
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Ensure each member can only have one active nutrition plan
nutritionPlanSchema.index({ assignedTo: 1 }, { unique: true });

// Static method to get nutrition plan for a specific member
nutritionPlanSchema.statics.getMemberPlan = function(memberId) {
    return this.findOne({ 
        assignedTo: memberId,
        isActive: true 
    }).populate('createdBy', 'name email');
};

// Static method to create or update a member's nutrition plan
nutritionPlanSchema.statics.createOrUpdatePlan = async function(planData) {
    const { assignedTo, memberName, memberEmail } = planData;
    
    // Check if plan already exists for this member
    const existingPlan = await this.findOne({ assignedTo, isActive: true });
    
    if (existingPlan) {
        // Update existing plan
        Object.assign(existingPlan, planData);
        return existingPlan.save();
    } else {
        // Create new plan
        const newPlan = new this(planData);
        return newPlan.save();
    }
};

// Method to get formatted schedule for display
nutritionPlanSchema.methods.getFormattedSchedule = function() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
    
    return days.map(day => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        meals: meals.map(meal => ({
            meal: meal.charAt(0).toUpperCase() + meal.slice(1),
            content: this.schedule[day][meal] || ''
        }))
    }));
};

module.exports = mongoose.model('NutritionPlan', nutritionPlanSchema); 