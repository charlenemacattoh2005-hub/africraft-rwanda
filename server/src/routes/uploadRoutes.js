import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { uploadMiddleware, uploadToCloudinary } from '../lib/cloudinary.js';

const router = Router();

/**
 * POST /api/upload
 * Accepts: multipart/form-data  field name = "image"
 * Returns: { url: "https://res.cloudinary.com/..." }
 *
 * Auth required — any logged-in user (admin, vendor, rider, customer).
 */
router.post(
  '/',
  requireAuth,
  uploadMiddleware.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const url = await uploadToCloudinary(req.file.buffer, 'africraft/products');
      return res.status(201).json({ url });
    } catch (err) {
      // Cloudinary errors have a http_code property
      if (err.http_code) {
        return res.status(err.http_code).json({ message: err.message || 'Upload failed' });
      }
      return next(err);
    }
  }
);

export default router;
