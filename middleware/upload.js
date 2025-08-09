const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../public/uploads');
const profileDir = path.join(uploadsDir, 'profiles');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
}

// Configure multer for memory storage (we'll process with sharp)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

// Middleware to process and save profile image
const processProfileImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        // Generate unique filename
        const filename = `profile-${req.user.id}-${Date.now()}.jpg`;
        const filepath = path.join(profileDir, filename);

        // Process image with sharp
        await sharp(req.file.buffer)
            .resize(300, 300, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 90 })
            .toFile(filepath);

        // Add processed file info to request
        req.processedFile = {
            filename: filename,
            path: `/uploads/profiles/${filename}`,
            size: req.file.size
        };

        next();
    } catch (error) {
        console.error('Image processing error:', error);
        next(new Error('Error processing image'));
    }
};

// Delete old profile image
const deleteOldProfileImage = (oldImagePath) => {
    if (oldImagePath && oldImagePath !== '') {
        const fullPath = path.join(__dirname, '../public', oldImagePath);
        fs.unlink(fullPath, (err) => {
            if (err) {
                console.error('Error deleting old image:', err);
            }
        });
    }
};

module.exports = {
    upload,
    processProfileImage,
    deleteOldProfileImage
};