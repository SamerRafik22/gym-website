const NutritionPlan = require('../models/NutritionPlan');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all nutrition plans (admin only) - shows member-specific plans
const getAllNutritionPlans = async (req, res) => {
    try {
        const plans = await NutritionPlan.find({ isActive: true })
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email membershipType')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        console.error('Error fetching nutrition plans:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching nutrition plans', 
            error: error.message 
        });
    }
};

// Get nutrition plan by ID
const getNutritionPlan = async (req, res) => {
    try {
        const plan = await NutritionPlan.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email membershipType');
        
        if (!plan) {
            return res.status(404).json({ 
                success: false,
                message: 'Nutrition plan not found' 
            });
        }
        
        res.json({
            success: true,
            data: plan
        });
    } catch (error) {
        console.error('Error fetching nutrition plan:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching nutrition plan', 
            error: error.message 
        });
    }
};

// Create nutrition plan for specific member (admin only)
const createNutritionPlan = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }

        const { 
            assignedTo, 
            memberName, 
            memberEmail, 
            planTitle, 
            goals, 
            notes, 
            schedule, 
            targetCalories, 
            targetProtein, 
            targetWater 
        } = req.body;

        // Verify the member exists
        const member = await User.findById(assignedTo);
        if (!member) {
            return res.status(404).json({ 
                success: false,
                message: 'Member not found' 
            });
        }

        const planData = {
            assignedTo,
            memberName: memberName || member.name,
            memberEmail: memberEmail || member.email,
            planTitle: planTitle || 'Custom Nutrition Plan',
            goals: goals || '',
            notes: notes || '',
            schedule: schedule || {},
            targetCalories: targetCalories || 2000,
            targetProtein: targetProtein || 150,
            targetWater: targetWater || 2.5,
            createdBy: req.user.id
        };

        // Use createOrUpdatePlan to handle existing plans
        const plan = await NutritionPlan.createOrUpdatePlan(planData);

        res.status(201).json({
            success: true,
            message: 'Nutrition plan created successfully',
            data: plan
        });
    } catch (error) {
        console.error('Error creating nutrition plan:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false,
                message: 'This member already has a nutrition plan. Use update instead.' 
            });
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                message: 'Validation failed', 
                errors: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Error creating nutrition plan', 
            error: error.message 
        });
    }
};

// Update nutrition plan (admin only)
const updateNutritionPlan = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }

        const plan = await NutritionPlan.findById(req.params.id);
        
        if (!plan) {
            return res.status(404).json({ 
                success: false,
                message: 'Nutrition plan not found' 
            });
        }

        // Update plan fields
        Object.assign(plan, req.body);
        await plan.save();

        const updatedPlan = await NutritionPlan.findById(plan._id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email membershipType');

        res.json({
            success: true,
            message: 'Nutrition plan updated successfully',
            data: updatedPlan
        });
    } catch (error) {
        console.error('Error updating nutrition plan:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                message: 'Validation failed', 
                errors: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Error updating nutrition plan', 
            error: error.message 
        });
    }
};

// Delete nutrition plan (admin only)
const deleteNutritionPlan = async (req, res) => {
    try {
        const plan = await NutritionPlan.findById(req.params.id);
        
        if (!plan) {
            return res.status(404).json({ 
                success: false,
                message: 'Nutrition plan not found' 
            });
        }

        // Soft delete by setting isActive to false
        plan.isActive = false;
        await plan.save();

        res.json({ 
            success: true,
            message: 'Nutrition plan deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting nutrition plan:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting nutrition plan', 
            error: error.message 
        });
    }
};

// Get user's nutrition plan
const getUserNutritionPlan = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Check if user has Elite membership (optional - remove this check if all members can have plans)
        const user = await User.findById(userId);
        if (user.membershipType !== 'elite') {
            return res.status(403).json({ 
                success: false,
                message: 'Nutrition plans are only available for Elite members' 
            });
        }

        const plan = await NutritionPlan.getMemberPlan(userId);
        
        if (!plan) {
            return res.status(404).json({ 
                success: false,
                message: 'No nutrition plan assigned to you yet' 
            });
        }

        res.json({
            success: true,
            data: plan
        });
    } catch (error) {
        console.error('Error fetching user nutrition plan:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching nutrition plan', 
            error: error.message 
        });
    }
};

// Get all members for nutrition plan assignment (admin only)
const getMembersForAssignment = async (req, res) => {
    try {
        // Get all members and their current nutrition plan status
        const members = await User.find({ role: 'member' })
            .select('name email membershipType')
            .sort({ name: 1 });

        // Check which members already have nutrition plans
        const memberIds = members.map(m => m._id);
        const existingPlans = await NutritionPlan.find({ 
            assignedTo: { $in: memberIds },
            isActive: true 
        }).select('assignedTo');

        const membersWithPlanStatus = members.map(member => ({
            ...member.toObject(),
            hasNutritionPlan: existingPlans.some(plan => 
                plan.assignedTo.toString() === member._id.toString()
            )
        }));

        res.json({
            success: true,
            data: membersWithPlanStatus
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching members', 
            error: error.message 
        });
    }
};

module.exports = {
    getAllNutritionPlans,
    getNutritionPlan,
    createNutritionPlan,
    updateNutritionPlan,
    deleteNutritionPlan,
    getUserNutritionPlan,
    getMembersForAssignment
}; 