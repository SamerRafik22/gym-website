const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Ensure upload directories exist
 */
const createUploadDirectories = () => {
    const uploadsDir = path.join(__dirname, '../public/uploads');
    const profileDir = path.join(uploadsDir, 'profiles');
    const documentsDir = path.join(uploadsDir, 'documents');

    [uploadsDir, profileDir, documentsDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

// Initialize directories
createUploadDirectories();

/**
 * Multer configuration for different file types
 */
const createMulterConfig = (options = {}) => {
    const {
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
        maxSize = 5 * 1024 * 1024, // 5MB
        storage = multer.memoryStorage()
    } = options;

    return multer({
        storage,
        fileFilter: (req, file, cb) => {
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
            }
        },
        limits: {
            fileSize: maxSize
        }
    });
};

/**
 * Default image upload configuration
 */
const imageUpload = createMulterConfig({
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024 // 5MB
});

/**
 * Document upload configuration
 */
const documentUpload = createMulterConfig({
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 10 * 1024 * 1024 // 10MB
});

/**
 * Process and save profile image
 */
const processProfileImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        // Generate unique filename
        const filename = `profile-${req.user.id}-${Date.now()}.jpg`;
        const profileDir = path.join(__dirname, '../public/uploads/profiles');
        const filepath = path.join(profileDir, filename);

        // Process image with sharp
        await sharp(req.file.buffer)
            .resize(300, 300, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ 
                quality: 90,
                progressive: true
            })
            .toFile(filepath);

        // Add processed file info to request
        req.processedFile = {
            filename: filename,
            path: `/uploads/profiles/${filename}`,
            size: req.file.size,
            originalName: req.file.originalname,
            mimetype: 'image/jpeg'
        };

        next();
    } catch (error) {
        console.error('Image processing error:', error);
        next(new Error('Error processing image. Please try again with a different image.'));
    }
};

/**
 * Process document upload
 */
const processDocument = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        // Generate unique filename with original extension
        const ext = path.extname(req.file.originalname);
        const filename = `document-${req.user.id}-${Date.now()}${ext}`;
        const documentsDir = path.join(__dirname, '../public/uploads/documents');
        const filepath = path.join(documentsDir, filename);

        // Save file directly (no processing needed for documents)
        fs.writeFileSync(filepath, req.file.buffer);

        // Add file info to request
        req.processedFile = {
            filename: filename,
            path: `/uploads/documents/${filename}`,
            size: req.file.size,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype
        };

        next();
    } catch (error) {
        console.error('Document processing error:', error);
        next(new Error('Error processing document. Please try again.'));
    }
};

/**
 * Delete file from filesystem
 */
const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        if (!filePath || filePath === '') {
            return resolve();
        }

        const fullPath = path.join(__dirname, '../public', filePath);
        
        fs.unlink(fullPath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                // Don't reject - file might already be deleted
                resolve();
            } else {
                console.log('File deleted successfully:', fullPath);
                resolve();
            }
        });
    });
};

/**
 * Delete old profile image (backward compatibility)
 */
const deleteOldProfileImage = (oldImagePath) => {
    return deleteFile(oldImagePath);
};

/**
 * Clean up temporary files middleware
 */
const cleanupTempFiles = (req, res, next) => {
    // Clean up function to be called after response
    const cleanup = () => {
        if (req.file && req.file.buffer) {
            // Clear buffer from memory
            req.file.buffer = null;
        }
    };

    // Attach cleanup to response finish event
    res.on('finish', cleanup);
    res.on('close', cleanup);

    next();
};

/**
 * Error handling middleware for multer errors
 */
const handleUploadErrors = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Please choose a smaller file.'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Too many files. Please upload one file at a time.'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Unexpected file field. Please check your form.'
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: 'File upload error: ' + error.message
                });
        }
    }

    if (error.message.includes('File type not allowed')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    next(error);
};

module.exports = {
    // Upload configurations
    imageUpload,
    documentUpload,
    createMulterConfig,
    
    // Processing middleware
    processProfileImage,
    processDocument,
    
    // Utility functions
    deleteFile,
    deleteOldProfileImage, // For backward compatibility
    cleanupTempFiles,
    handleUploadErrors,
    createUploadDirectories,

    // Legacy exports for backward compatibility
    upload: imageUpload
};
