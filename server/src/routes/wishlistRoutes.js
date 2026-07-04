import { Router } from 'express';
import { param } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validateResult } from '../middleware/validate.js';
import { getWishlist, addWishlistItem, removeWishlistItem } from '../controllers/wishlistController.js';

const router = Router();

router.get('/', requireAuth, getWishlist);
router.post('/:productId', requireAuth, [param('productId').isMongoId(), validateResult], addWishlistItem);
router.delete('/:productId', requireAuth, [param('productId').isMongoId(), validateResult], removeWishlistItem);

export default router;
