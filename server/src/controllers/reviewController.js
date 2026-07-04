import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';

export async function listProductReviews(req, res, next) {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    return res.json({ reviews });
  } catch (err) {
    return next(err);
  }
}

export async function createOrUpdateReview(req, res, next) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product || product.isActive === false) return res.status(404).json({ message: 'Product not found' });

    const review = await Review.findOneAndUpdate(
      { productId, userId },
      { rating, comment },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(review.createdAt === review.updatedAt ? 201 : 200).json({ review });
  } catch (err) {
    return next(err);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { productId } = req.params;

    const result = await Review.findOneAndDelete({ productId, userId });
    if (!result) return res.status(404).json({ message: 'Review not found' });
    return res.json({ message: 'Review removed' });
  } catch (err) {
    return next(err);
  }
}
