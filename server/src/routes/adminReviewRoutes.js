import { Router } from 'express';
import { param } from 'express-validator';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validateResult } from '../middleware/validate.js';
import { listReviews, deleteReviewByAdmin } from '../controllers/adminReviewController.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, listReviews);
router.delete('/:id', requireAuth, requireAdmin, [param('id').isMongoId(), validateResult], deleteReviewByAdmin);

export default router;
