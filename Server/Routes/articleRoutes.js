const express = require('express');
const router = express.Router();
const {
  getArticles,
  getAllArticles,
  getArticle,
  createArticle,
  updateArticle,
  requestEditPermission,
  approveArticle,
  approveEditRequest,
  adminEditArticle,
  deleteArticle,
} = require('../Controllers/articleController');
const { protect } = require('../Middlewares/auth');
const { protect: protectAdmin } = require('../Middlewares/adminAuth');
const { upload } = require('../Config/cloudinary');
const multer = require('multer');

// Configure multer for multiple file uploads
const storage = multer.memoryStorage();
const multiUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      const allowedImageTypes = /jpeg|jpg|png|webp/;
      const extname = allowedImageTypes.test(file.originalname.toLowerCase().split('.').pop());
      const mimetype = allowedImageTypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      } else {
        cb(new Error('Photo must be an image file (jpg, jpeg, png, webp)'));
      }
    } else if (file.fieldname === 'video') {
      const allowedVideoTypes = /mp4|mov|avi|wmv|flv|webm/;
      const extname = allowedVideoTypes.test(file.originalname.toLowerCase().split('.').pop());
      const mimetype = /video/.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      } else {
        cb(new Error('Video must be a video file (mp4, mov, avi, wmv, flv, webm)'));
      }
    } else {
      cb(new Error('Invalid file field'));
    }
  },
});

// Public routes
router.get('/', getArticles);

// Admin routes (must come before /:id routes)
router.get('/admin/all', protectAdmin, getAllArticles);

// Public route (must come after admin routes)
router.get('/:id', getArticle);

// Protected routes (authenticated users)
router.post('/', protect, multiUpload.fields([{ name: 'photo', maxCount: 1 }, { name: 'video', maxCount: 1 }]), createArticle);
router.put('/:id', protect, multiUpload.fields([{ name: 'photo', maxCount: 1 }, { name: 'video', maxCount: 1 }]), updateArticle);
router.post('/:id/request-edit', protect, requestEditPermission);

// Admin routes
router.put('/:id/approve', protectAdmin, approveArticle);
router.put('/:id/approve-edit/:requestId', protectAdmin, approveEditRequest);
router.put('/:id/admin-edit', protectAdmin, multiUpload.fields([{ name: 'photo', maxCount: 1 }, { name: 'video', maxCount: 1 }]), adminEditArticle);
router.delete('/:id', protectAdmin, deleteArticle);

module.exports = router;

