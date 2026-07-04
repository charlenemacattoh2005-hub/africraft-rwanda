import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';

export async function getWishlist(req, res, next) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const wishlist = await Wishlist.findOne({ userId });
    return res.json({ items: wishlist?.items || [] });
  } catch (err) {
    return next(err);
  }
}

export async function addWishlistItem(req, res, next) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product || product.isActive === false) return res.status(404).json({ message: 'Product not found' });

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: { userId },
        $addToSet: { items: { productId } },
      },
      { new: true, upsert: true }
    );

    return res.json({ wishlist });
  } catch (err) {
    return next(err);
  }
}

export async function removeWishlistItem(req, res, next) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { productId } = req.params;

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    return res.json({ wishlist });
  } catch (err) {
    return next(err);
  }
}
