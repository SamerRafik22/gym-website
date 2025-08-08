const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
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
            username,
            email, 
            password, 
            phone, 
            age, 
            gender, 
            fitnessGoals, 
            medicalConditions, 
            membershipType,
            address,
            city,
            zipCode,
            emergencyName,
            emergencyPhone,
            emergencyRelation,
            billingType
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email ? 
                    'User with this email already exists' : 
                    'Username already taken'
            });
        }

        // Initialize membership benefits based on tier
        let guestPassesRemaining = 0;
        let personalTrainingSessionsRemaining = 0;
        
        if (membershipType === 'premium') {
            guestPassesRemaining = 2; // 2 guest passes per month
        } else if (membershipType === 'elite') {
            guestPassesRemaining = 999; // Unlimited guest passes
            personalTrainingSessionsRemaining = 4; // 4 personal training sessions per month
        }
        
        // Create user
        const user = await User.create({
            name,
            username,
            email,
            password,
            phone,
            age,
            gender,
            membershipType: membershipType || 'standard',
            guestPassesRemaining,
            personalTrainingSessionsRemaining,
            fitnessGoals: fitnessGoals || [],
            medicalConditions: medicalConditions || [],
            address: address || '',
            city: city || '',
            zipCode: zipCode || '',
            emergencyContact: {
                name: emergencyName || '',
                phone: emergencyPhone || '',
                relation: emergencyRelation || ''
            },
            billingType: billingType || 'monthly'
        });

        // Generate token
        const token = generateToken(user._id);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    membershipType: user.membershipType,
                    membershipStatus: user.membershipStatus,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
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

        const { email, password } = req.body;

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    membershipType: user.membershipType,
                    membershipStatus: user.membershipStatus,
                    membershipDaysRemaining: user.getMembershipDaysRemaining(),
                    isMembershipActive: user.isMembershipActive(),
                    role: user.role,
                    lastLogin: user.lastLogin
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
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
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    age: user.age,
                    gender: user.gender,
                    membershipType: user.membershipType,
                    membershipStatus: user.membershipStatus,
                    membershipDaysRemaining: user.getMembershipDaysRemaining(),
                    isMembershipActive: user.isMembershipActive(),
                    joinDate: user.joinDate,
                    membershipExpiry: user.membershipExpiry,
                    fitnessGoals: user.fitnessGoals,
                    medicalConditions: user.medicalConditions,
                    emergencyContact: user.emergencyContact,
                    role: user.role,
                    lastLogin: user.lastLogin
                }
            }
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name, phone, age, gender, fitnessGoals, medicalConditions, emergencyContact } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (age) user.age = age;
        if (gender) user.gender = gender;
        if (fitnessGoals) user.fitnessGoals = fitnessGoals;
        if (medicalConditions) user.medicalConditions = medicalConditions;
        if (emergencyContact) user.emergencyContact = emergencyContact;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    age: user.age,
                    gender: user.gender,
                    fitnessGoals: user.fitnessGoals,
                    medicalConditions: user.medicalConditions,
                    emergencyContact: user.emergencyContact
                }
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    try {
        // In a real application, you might want to blacklist the token
        // For now, we'll just return a success message
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// REMOVED: Insecure make-admin endpoint

// @desc    Check if username is available
// @route   GET /api/auth/check-username/:username
// @access  Public
const checkUsername = async (req, res) => {
    try {
        const { username } = req.params;
        
        if (!username || username.trim().length < 3) {
            return res.status(400).json({
                success: false,
                available: false,
                message: 'Username must be at least 3 characters long'
            });
        }

        const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${username.trim()}$`, 'i') } });
        
        if (existingUser) {
            return res.status(200).json({
                success: true,
                available: false,
                message: 'Username is already taken. Please choose another username.'
            });
        }

        res.status(200).json({
            success: true,
            available: true,
            message: 'Username is available'
        });

    } catch (error) {
        console.error('Check username error:', error);
        res.status(500).json({
            success: false,
            available: false,
            message: 'Error checking username availability'
        });
    }
};

// @desc    Check if email is available
// @route   GET /api/auth/check-email/:email
// @access  Public
const checkEmail = async (req, res) => {
    try {
        const { email } = req.params;
        
        if (!email || !email.includes('@')) {
            return res.status(400).json({
                success: false,
                available: false,
                message: 'Please enter a valid email address'
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        
        if (existingUser) {
            return res.status(200).json({
                success: true,
                available: false,
                message: 'Email is already in use. Please use another email address.'
            });
        }

        res.status(200).json({
            success: true,
            available: true,
            message: 'Email is available'
        });

    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({
            success: false,
            available: false,
            message: 'Error checking email availability'
        });
    }
};

// @desc    Check if phone number is available
// @route   GET /api/auth/check-phone/:phone
// @access  Public
const checkPhone = async (req, res) => {
    try {
        const { phone } = req.params;
        
        if (!phone || phone.trim().length < 10) {
            return res.status(400).json({
                success: false,
                available: false,
                message: 'Please enter a valid phone number'
            });
        }

        const existingUser = await User.findOne({ phone: phone.trim() });
        
        if (existingUser) {
            return res.status(200).json({
                success: true,
                available: false,
                message: 'Phone number is already in use. Please use another phone number.'
            });
        }

        res.status(200).json({
            success: true,
            available: true,
            message: 'Phone number is available'
        });

    } catch (error) {
        console.error('Check phone error:', error);
        res.status(500).json({
            success: false,
            available: false,
            message: 'Error checking phone number availability'
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    logout,
    checkUsername,
    checkEmail,
    checkPhone
}; 