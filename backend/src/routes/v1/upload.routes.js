import express from 'express';

import cloudinary from '../../config/cloudinaryConfig.js';
import { upload } from '../../config/multerConfig.js';
import { isAuthenticated } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post(
  '/image',
  isAuthenticated,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
      }

      const base64String = req.file.buffer.toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${base64String}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'products',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' },
        ],
      });

      res.json({
        success: true,
        data: {
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: error.message,
      });
    }
  }
);

router.post(
  '/images',
  isAuthenticated,
  upload.array('images', 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No image files provided',
        });
      }

      const uploadPromises = req.files.map(async (file) => {
        const base64String = file.buffer.toString('base64');
        const dataURI = `data:${file.mimetype};base64,${base64String}`;

        return cloudinary.uploader.upload(dataURI, {
          folder: 'products',
          resource_type: 'image',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' },
          ],
        });
      });

      const results = await Promise.all(uploadPromises);

      const uploadedImages = results.map((result) => ({
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
      }));

      res.json({
        success: true,
        data: uploadedImages,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images',
        error: error.message,
      });
    }
  }
);

export default router;
