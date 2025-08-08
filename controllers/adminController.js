const User = require('../models/User');
const Session = require('../models/Session');
const Reservation = require('../models/Reservation');
const NutritionPlan = require('../models/NutritionPlan');

// ========== USER MANAGEMENT ==========

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Admin only
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Get total count for pagination info
        const total = await User.countDocuments({});

        // Get users with pagination
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(startIndex);

        // Pagination info
        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: endIndex < total,
            hasPrevPage: page > 1
        };

        res.status(200).json({
            success: true,
            count: users.length,
            pagination,
            data: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Admin only
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user'
        });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Admin only
const updateUser = async (req, res) => {
    try {
        const { name, email, membershipType, membershipStatus, role, isActive } = req.body;
        
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (membershipType) user.membershipType = membershipType;
        if (membershipStatus) user.membershipStatus = membershipStatus;
        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                membershipType: user.membershipType,
                membershipStatus: user.membershipStatus,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin only
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Don't allow deleting admin users
        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete admin users'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};

// ========== SESSION MANAGEMENT ==========

// @desc    Get all sessions with pagination
// @route   GET /api/admin/sessions
// @access  Admin only
const getAllSessions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Get total count for pagination info
        const total = await Session.countDocuments({});

        // Get sessions with pagination
        const sessions = await Session.find({})
            .sort({ date: 1, time: 1 })
            .limit(limit)
            .skip(startIndex);

        // Pagination info
        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: endIndex < total,
            hasPrevPage: page > 1
        };

        res.status(200).json({
            success: true,
            count: sessions.length,
            pagination,
            data: sessions
        });
    } catch (error) {
        console.error('Get all sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sessions'
        });
    }
};

// @desc    Get session by ID
// @route   GET /api/admin/sessions/:id
// @access  Admin only
const getSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        
        if (!session) {
            return res.status(404).json({ 
                success: false,
                message: 'Session not found' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching session', 
            error: error.message 
        });
    }
};

// @desc    Create session
// @route   POST /api/admin/sessions
// @access  Admin only
const createSession = async (req, res) => {
    try {
        const { name, type, date, time, maxCapacity, description } = req.body;

        // Validate required fields
        if (!name || !type || !date || !time || !maxCapacity) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, type, date, time, and maxCapacity are required'
            });
        }

        const session = await Session.create({
            name,
            type,
            date,
            time,
            maxCapacity,
            description,
            currentBookings: 0
        });

        res.status(201).json({
            success: true,
            message: 'Session created successfully',
            data: session
        });
    } catch (error) {
        console.error('Create session error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errorMessages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create session'
        });
    }
};

// @desc    Update session
// @route   PUT /api/admin/sessions/:id
// @access  Admin only
const updateSession = async (req, res) => {
    try {
        const { name, type, date, time, maxCapacity, description } = req.body;
        
        const session = await Session.findById(req.params.id);
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Update fields
        if (name) session.name = name;
        if (type) session.type = type;
        if (date) session.date = date;
        if (time) session.time = time;
        if (maxCapacity) session.maxCapacity = maxCapacity;
        if (description) session.description = description;

        await session.save();

        res.status(200).json({
            success: true,
            message: 'Session updated successfully',
            data: session
        });
    } catch (error) {
        console.error('Update session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update session'
        });
    }
};

// @desc    Delete session
// @route   DELETE /api/admin/sessions/:id
// @access  Admin only
const deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Delete all reservations for this session
        await Reservation.deleteMany({ sessionId: req.params.id });

        // Delete the session
        await Session.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Session and related reservations deleted successfully'
        });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete session'
        });
    }
};

// ========== RESERVATION MANAGEMENT ==========

// @desc    Get all reservations with pagination
// @route   GET /api/admin/reservations
// @access  Admin only
const getAllReservations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Get total count for pagination info
        const total = await Reservation.countDocuments({});

        // Get reservations with pagination
        const reservations = await Reservation.find({})
            .populate('userId', 'name email')
            .populate('sessionId', 'name date time type')
            .sort({ bookingDate: -1 })
            .limit(limit)
            .skip(startIndex);

        // Pagination info
        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: endIndex < total,
            hasPrevPage: page > 1
        };

        res.status(200).json({
            success: true,
            count: reservations.length,
            pagination,
            data: reservations
        });
    } catch (error) {
        console.error('Get all reservations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reservations'
        });
    }
};

// @desc    Update reservation status
// @route   PUT /api/admin/reservations/:id
// @access  Admin only
const updateReservationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const reservation = await Reservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        reservation.status = status;
        await reservation.save();

        res.status(200).json({
            success: true,
            message: 'Reservation status updated successfully',
            data: reservation
        });
    } catch (error) {
        console.error('Update reservation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update reservation'
        });
    }
};

// ========== NUTRITION PLAN MANAGEMENT ==========

// @desc    Get all nutrition plans with pagination
// @route   GET /api/admin/nutrition-plans
// @access  Admin only
const getAllNutritionPlans = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Get total count for pagination info
        const total = await NutritionPlan.countDocuments({ isActive: true });

        // Get nutrition plans with pagination
        const plans = await NutritionPlan.find({ isActive: true })
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email membershipType')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(startIndex);

        // Pagination info
        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: endIndex < total,
            hasPrevPage: page > 1
        };

        res.status(200).json({
            success: true,
            count: plans.length,
            pagination,
            data: plans
        });
    } catch (error) {
        console.error('Get all nutrition plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch nutrition plans'
        });
    }
};

// @desc    Get nutrition plan by ID
// @route   GET /api/admin/nutrition-plans/:id
// @access  Admin only
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
        
        res.status(200).json({
            success: true,
            data: plan
        });
    } catch (error) {
        console.error('Get nutrition plan error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching nutrition plan', 
            error: error.message 
        });
    }
};

// @desc    Create nutrition plan
// @route   POST /api/admin/nutrition-plans
// @access  Admin only
const createNutritionPlan = async (req, res) => {
    try {
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
        console.error('Create nutrition plan error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false,
                message: 'This member already has a nutrition plan. Use update instead.' 
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create nutrition plan',
            error: error.message
        });
    }
};

// @desc    Update nutrition plan
// @route   PUT /api/admin/nutrition-plans/:id
// @access  Admin only
const updateNutritionPlan = async (req, res) => {
    try {
        const { name, description, details, category } = req.body;
        
        const plan = await NutritionPlan.findById(req.params.id);
        
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Nutrition plan not found'
            });
        }

        // Update fields
        if (name) plan.name = name;
        if (description) plan.description = description;
        if (details) plan.details = details;
        if (category) plan.category = category;

        await plan.save();

        res.status(200).json({
            success: true,
            message: 'Nutrition plan updated successfully',
            data: plan
        });
    } catch (error) {
        console.error('Update nutrition plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update nutrition plan'
        });
    }
};

// @desc    Delete nutrition plan
// @route   DELETE /api/admin/nutrition-plans/:id
// @access  Admin only
const deleteNutritionPlan = async (req, res) => {
    try {
        const plan = await NutritionPlan.findById(req.params.id);
        
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Nutrition plan not found'
            });
        }

        await NutritionPlan.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Nutrition plan deleted successfully'
        });
    } catch (error) {
        console.error('Delete nutrition plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete nutrition plan'
        });
    }
};

// @desc    Assign nutrition plan to user
// @route   PUT /api/admin/users/:userId/nutrition-plan
// @access  Admin only
const assignNutritionPlan = async (req, res) => {
    try {
        const { nutritionPlanId } = req.body;
        
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const plan = await NutritionPlan.findById(nutritionPlanId);
        
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Nutrition plan not found'
            });
        }

        user.nutritionPlanId = nutritionPlanId;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Nutrition plan assigned successfully',
            data: {
                userId: user._id,
                userName: user.name,
                nutritionPlan: plan.name
            }
        });
    } catch (error) {
        console.error('Assign nutrition plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign nutrition plan'
        });
    }
};

// ========== ANALYTICS ==========

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin only
const getDashboardStats = async (req, res) => {
    try {
        // Get counts
        const totalMembers = await User.countDocuments({ role: 'member' });
        const totalSessions = await Session.countDocuments({});
        const activeReservations = await Reservation.countDocuments({ status: 'confirmed' });
        
        // Get membership distribution
        const membershipStats = await User.aggregate([
            { $match: { role: 'member' } },
            { $group: { _id: '$membershipType', count: { $sum: 1 } } }
        ]);

        // Calculate revenue (simple calculation)
        const membershipPrices = { standard: 39, premium: 59, elite: 99 };
        let monthlyRevenue = 0;
        
        membershipStats.forEach(stat => {
            monthlyRevenue += (membershipPrices[stat._id] || 0) * stat.count;
        });

        // Get today's sessions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todaysSessions = await Session.countDocuments({
            date: { $gte: today, $lt: tomorrow }
        });

        res.status(200).json({
            success: true,
            data: {
                totalMembers,
                monthlyRevenue,
                todaysSessions,
                activeReservations,
                membershipStats: membershipStats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        });
    }
};

// @desc    Get all members for nutrition plan assignment
// @route   GET /api/admin/members-for-nutrition
// @access  Admin only
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

        res.status(200).json({
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
    // User management
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    
    // Session management
    getAllSessions,
    getSession,
    createSession,
    updateSession,
    deleteSession,
    
    // Reservation management
    getAllReservations,
    updateReservationStatus,
    
    // Nutrition plan management
    getAllNutritionPlans,
    getNutritionPlan,
    createNutritionPlan,
    updateNutritionPlan,
    deleteNutritionPlan,
    assignNutritionPlan,
    getMembersForAssignment,
    
    // Analytics
    getDashboardStats
}; 