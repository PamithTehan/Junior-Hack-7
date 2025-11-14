const express = require('express');
const router = express.Router();
const { uploadImage } = require('../Controllers/uploadController');
const { protect } = require('../Middlewares/auth');
const { upload } = require('../Config/cloudinary');

router.post('/', protect, upload.single('image'), uploadImage);

module.exports = router;

