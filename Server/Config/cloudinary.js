const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (for PDFs and images)
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedImageTypes = /jpeg|jpg|png|webp/;
    const allowedPdfTypes = /pdf/;
    const extname = file.originalname.toLowerCase().split('.').pop();
    const isImage = allowedImageTypes.test(extname) && allowedImageTypes.test(file.mimetype);
    const isPdf = allowedPdfTypes.test(extname) && file.mimetype === 'application/pdf';

    if (isImage || isPdf) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, webp) and PDF files are allowed'));
    }
  },
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = 'sri-lankan-nutrition', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      resource_type: options.resourceType || 'auto',
    };

    // Only apply image transformations for images (not for PDFs/raw files)
    if (options.resourceType !== 'raw' && (!options.resourceType || options.resourceType === 'image' || options.resourceType === 'auto')) {
      uploadOptions.transformation = [{ width: 800, height: 600, crop: 'limit' }];
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
    stream.on('error', (error) => reject(error));
  });
};

// Helper function to delete from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { cloudinary, upload, uploadToCloudinary, deleteFromCloudinary };

