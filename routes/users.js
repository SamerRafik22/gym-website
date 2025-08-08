const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        
        // Search by name or email
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Filter by membership status
        if (req.query.membershipStatus) {
            filter.membershipStatus = req.query.membershipStatus;
        }

        // Filter by membership type
        if (req.query.membershipType) {
            filter.membershipType = req.query.membershipType;
        }

        // Filter by role
        if (req.query.role) {
            filter.role = req.query.role;
        }

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
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
            data: {
                user: {
                    ...user.toObject(),
                    membershipDaysRemaining: user.getMembershipDaysRemaining(),
                    isMembershipActive: user.isMembershipActive()
                }
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const { membershipType, membershipStatus, membershipExpiry, isActive, role } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (membershipType) user.membershipType = membershipType;
        if (membershipStatus) user.membershipStatus = membershipStatus;
        if (membershipExpiry) user.membershipExpiry = membershipExpiry;
        if (typeof isActive === 'boolean') user.isActive = isActive;
        if (role) user.role = role;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    membershipType: user.membershipType,
                    membershipStatus: user.membershipStatus,
                    membershipExpiry: user.membershipExpiry,
                    isActive: user.isActive,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Soft delete - just deactivate the user
        user.isActive = false;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User deactivated successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const activeMemberships = await User.countDocuments({ 
            membershipStatus: 'active',
            membershipExpiry: { $gt: new Date() }
        });
        const pendingMemberships = await User.countDocuments({ membershipStatus: 'pending' });
        const expiredMemberships = await User.countDocuments({ 
            membershipStatus: 'active',
            membershipExpiry: { $lt: new Date() }
        });

        // Membership type breakdown
        const membershipTypeStats = await User.aggregate([
            {
                $group: {
                    _id: '$membershipType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Gender breakdown
        const genderStats = await User.aggregate([
            {
                $group: {
                    _id: '$gender',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Recent registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRegistrations = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                activeMemberships,
                pendingMemberships,
                expiredMemberships,
                recentRegistrations,
                membershipTypeStats,
                genderStats
            }
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Routes
router.get('/', protect, authorize('admin'), getUsers);
router.get('/stats', protect, authorize('admin'), getUserStats);
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router; 