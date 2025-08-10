const express = require('express');
const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const { protect, authorize } = require('../utils/auth');
const Contact = require('../models/Contact');

const router = express.Router();

// Validation middleware
const contactValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email address'),
    body('phone')
        .matches(/^(\+201|01)[0-9]{9}$/)
        .withMessage('Please enter a valid Egyptian phone number'),
    body('subject')
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Subject must be between 5 and 100 characters'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters'),
    body('inquiryType')
        .optional()
        .isIn(['general', 'membership', 'training', 'classes', 'equipment', 'other'])
        .withMessage('Invalid inquiry type'),
    body('preferredContact')
        .optional()
        .isIn(['email', 'phone', 'whatsapp'])
        .withMessage('Invalid preferred contact method')
];

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            name,
            email,
            phone,
            subject,
            message,
            inquiryType,
            preferredContact
        } = req.body;

        // Create contact submission
        const contact = await Contact.create({
            name,
            email,
            phone,
            subject,
            message,
            inquiryType: inquiryType || 'general',
            preferredContact: preferredContact || 'email',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully. We will get back to you soon!',
            data: {
                contact: {
                    id: contact._id,
                    name: contact.name,
                    email: contact.email,
                    subject: contact.subject,
                    inquiryType: contact.inquiryType,
                    status: contact.status
                }
            }
        });

    } catch (error) {
        console.error('Submit contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit contact form',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get all contact submissions (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
const getContacts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        
        // Search by name, email, or subject
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
                { subject: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Filter by status
        if (req.query.status) {
            filter.status = req.query.status;
        }

        // Filter by inquiry type
        if (req.query.inquiryType) {
            filter.inquiryType = req.query.inquiryType;
        }

        // Filter by priority
        if (req.query.priority) {
            filter.priority = req.query.priority;
        }

        const contacts = await Contact.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('assignedTo', 'name email')
            .populate('respondedBy', 'name email');

        const total = await Contact.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                contacts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contacts',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get single contact (Admin only)
// @route   GET /api/contact/:id
// @access  Private/Admin
const getContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id)
            .populate('assignedTo', 'name email')
            .populate('respondedBy', 'name email');
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                contact: {
                    ...contact.toObject(),
                    responseTimeHours: contact.responseTimeHours
                }
            }
        });

    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contact',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Update contact status (Admin only)
// @route   PUT /api/contact/:id
// @access  Private/Admin
const updateContact = async (req, res) => {
    try {
        const { status, priority, assignedTo, responseMessage } = req.body;

        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        // Update fields
        if (status) contact.status = status;
        if (priority) contact.priority = priority;
        if (assignedTo) contact.assignedTo = assignedTo;
        if (responseMessage) {
            contact.responseMessage = responseMessage;
            contact.respondedAt = new Date();
            contact.respondedBy = req.user.id;
        }

        await contact.save();

        res.status(200).json({
            success: true,
            message: 'Contact updated successfully',
            data: {
                contact: {
                    id: contact._id,
                    status: contact.status,
                    priority: contact.priority,
                    assignedTo: contact.assignedTo,
                    responseMessage: contact.responseMessage,
                    respondedAt: contact.respondedAt
                }
            }
        });

    } catch (error) {
        console.error('Update contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update contact',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Delete contact (Admin only)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        await Contact.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Contact deleted successfully'
        });

    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete contact',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get contact statistics (Admin only)
// @route   GET /api/contact/stats
// @access  Private/Admin
const getContactStats = async (req, res) => {
    try {
        const stats = await Contact.getStats();
        const avgResponseTime = await Contact.getAverageResponseTime();

        // Recent contacts (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentContacts = await Contact.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Inquiry type breakdown
        const inquiryTypeStats = await Contact.aggregate([
            {
                $group: {
                    _id: '$inquiryType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Priority breakdown
        const priorityStats = await Contact.aggregate([
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                ...stats,
                avgResponseTime,
                recentContacts,
                inquiryTypeStats,
                priorityStats
            }
        });

    } catch (error) {
        console.error('Get contact stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contact statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Routes
router.get('/', (req, res) => {
    res.render('contact');
});
router.post('/', contactValidation, submitContact);
router.get('/admin', protect, authorize('admin'), getContacts);
router.get('/stats', protect, authorize('admin'), getContactStats);
router.get('/:id', protect, authorize('admin'), getContact);
router.put('/:id', protect, authorize('admin'), updateContact);
router.delete('/:id', protect, authorize('admin'), deleteContact);

module.exports = router; 