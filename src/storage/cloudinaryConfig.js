// storage/cloudinaryConfig.js

import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary with your credentials
const cloudinaryV2 = cloudinary.v2;

cloudinaryV2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinaryV2,
    params: {
        folder: 'autohall/marques', // Folder name in Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Optional: auto-resize
    }
});

// Create Multer upload middleware
const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
});

// Export both cloudinary instance and upload middleware
export { cloudinaryV2 as cloudinary, upload };
