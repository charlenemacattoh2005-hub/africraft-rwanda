import { Review } from '../models/Review.js';

export async function listReviews(req, res, next) {
  try {
    const reviews = await Review.find()
      .populate('productId', 'name')
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json({ reviews });
  } catch (err) {
    return next(err);
  }
}

export async function deleteReviewByAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    return res.json({ message: 'Review deleted' });
  } catch (err) {
    return next(err);
  }
}
