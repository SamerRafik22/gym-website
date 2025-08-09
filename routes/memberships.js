const express = require('express');
const { protect, authorize } = require('../utils/auth');
const Membership = require('../models/Membership');
const User = require('../models/User');

const router = express.Router();

// @desc    Get all memberships
// @route   GET /api/memberships
// @access  Public
const getMemberships = async (req, res) => {
    try {
        const memberships = await Membership.find({ isActive: true })
            .sort({ price: 1 });

        res.status(200).json({
            success: true,
            data: {
                memberships: memberships.map(membership => ({
                    ...membership.toObject(),
                    discountedPrice: membership.discountedPrice,
                    isAvailable: membership.isAvailable
                }))
            }
        });

    } catch (error) {
        console.error('Get memberships error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get memberships',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get single membership
// @route   GET /api/memberships/:id
// @access  Public
const getMembership = async (req, res) => {
    try {
        const membership = await Membership.findById(req.params.id);
        
        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Membership not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                membership: {
                    ...membership.toObject(),
                    discountedPrice: membership.discountedPrice,
                    isAvailable: membership.isAvailable
                }
            }
        });

    } catch (error) {
        console.error('Get membership error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get membership',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Create membership (Admin only)
// @route   POST /api/memberships
// @access  Private/Admin
const createMembership = async (req, res) => {
    try {
        const {
            name,
            type,
            description,
            price,
            duration,
            durationUnit,
            features,
            isPopular,
            maxMembers,
            discountPercentage,
            validUntil,
            terms,
            restrictions
        } = req.body;

        const membership = await Membership.create({
            name,
            type,
            description,
            price,
            duration,
            durationUnit,
            features,
            isPopular,
            maxMembers,
            discountPercentage,
            validUntil,
            terms,
            restrictions
        });

        res.status(201).json({
            success: true,
            message: 'Membership created successfully',
            data: {
                membership: {
                    ...membership.toObject(),
                    discountedPrice: membership.discountedPrice,
                    isAvailable: membership.isAvailable
                }
            }
        });

    } catch (error) {
        console.error('Create membership error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create membership',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Update membership (Admin only)
// @route   PUT /api/memberships/:id
// @access  Private/Admin
const updateMembership = async (req, res) => {
    try {
        const membership = await Membership.findById(req.params.id);
        
        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Membership not found'
            });
        }

        const updateFields = req.body;
        Object.keys(updateFields).forEach(key => {
            membership[key] = updateFields[key];
        });

        await membership.save();

        res.status(200).json({
            success: true,
            message: 'Membership updated successfully',
            data: {
                membership: {
                    ...membership.toObject(),
                    discountedPrice: membership.discountedPrice,
                    isAvailable: membership.isAvailable
                }
            }
        });

    } catch (error) {
        console.error('Update membership error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update membership',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Delete membership (Admin only)
// @route   DELETE /api/memberships/:id
// @access  Private/Admin
const deleteMembership = async (req, res) => {
    try {
        const membership = await Membership.findById(req.params.id);
        
        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Membership not found'
            });
        }

        // Check if there are active users with this membership
        const activeUsers = await User.countDocuments({
            membershipType: membership.type,
            membershipStatus: 'active'
        });

        if (activeUsers > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete membership. ${activeUsers} users are currently subscribed to this plan.`
            });
        }

        // Soft delete - deactivate the membership
        membership.isActive = false;
        await membership.save();

        res.status(200).json({
            success: true,
            message: 'Membership deactivated successfully'
        });

    } catch (error) {
        console.error('Delete membership error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete membership',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Subscribe user to membership
// @route   POST /api/memberships/:id/subscribe
// @access  Private
const subscribeToMembership = async (req, res) => {
    try {
        const membership = await Membership.findById(req.params.id);
        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Membership not found'
            });
        }

        if (!membership.isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'This membership is not available for subscription'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Calculate membership expiry date
        const expiryDate = new Date();
        switch (membership.durationUnit) {
            case 'days':
                expiryDate.setDate(expiryDate.getDate() + membership.duration);
                break;
            case 'weeks':
                expiryDate.setDate(expiryDate.getDate() + (membership.duration * 7));
                break;
            case 'months':
                expiryDate.setMonth(expiryDate.getMonth() + membership.duration);
                break;
            case 'years':
                expiryDate.setFullYear(expiryDate.getFullYear() + membership.duration);
                break;
        }

        // Update user membership
        user.membershipType = membership.type;
        user.membershipStatus = 'active';
        user.membershipExpiry = expiryDate;
        await user.save();

        // Increment membership count
        await membership.addMember();

        res.status(200).json({
            success: true,
            message: 'Successfully subscribed to membership',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    membershipType: user.membershipType,
                    membershipStatus: user.membershipStatus,
                    membershipExpiry: user.membershipExpiry,
                    membershipDaysRemaining: user.getMembershipDaysRemaining(),
                    isMembershipActive: user.isMembershipActive()
                },
                membership: {
                    name: membership.name,
                    type: membership.type,
                    price: membership.discountedPrice
                }
            }
        });

    } catch (error) {
        console.error('Subscribe to membership error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe to membership',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get membership statistics (Admin only)
// @route   GET /api/memberships/stats
// @access  Private/Admin
const getMembershipStats = async (req, res) => {
    try {
        const totalMemberships = await Membership.countDocuments();
        const activeMemberships = await Membership.countDocuments({ isActive: true });
        const popularMemberships = await Membership.countDocuments({ isPopular: true });

        // Membership type breakdown
        const typeStats = await Membership.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    totalPrice: { $sum: '$price' },
                    avgPrice: { $avg: '$price' }
                }
            }
        ]);

        // User subscription breakdown
        const userStats = await User.aggregate([
            {
                $group: {
                    _id: '$membershipType',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalMemberships,
                activeMemberships,
                popularMemberships,
                typeStats,
                userStats
            }
        });

    } catch (error) {
        console.error('Get membership stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get membership statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Routes
router.get('/', getMemberships);
router.get('/stats', protect, authorize('admin'), getMembershipStats);
router.get('/:id', getMembership);
router.post('/', protect, authorize('admin'), createMembership);
router.put('/:id', protect, authorize('admin'), updateMembership);
router.delete('/:id', protect, authorize('admin'), deleteMembership);
router.post('/:id/subscribe', protect, subscribeToMembership);

module.exports = router; 