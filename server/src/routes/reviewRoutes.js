import { Router } from 'express';
import { body, param } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validateResult } from '../middleware/validate.js';
import { listProductReviews, createOrUpdateReview, deleteReview } from '../controllers/reviewController.js';

const router = Router();

router.get('/:productId', listProductReviews);

router.post(
  '/:productId',
  requireAuth,
  [param('productId').isMongoId(), body('rating').isInt({ min: 1, max: 5 }), body('comment').optional().isString().trim().isLength({ max: 1000 }), validateResult],
  createOrUpdateReview
);

router.delete('/:productId', requireAuth, [param('productId').isMongoId(), validateResult], deleteReview);

export default router;
