import { Product } from '../models/Product.js';

export async function listProducts(req, res, next) {
  try {
    const { q, category, minPrice, maxPrice, sort } = req.query;

    const filter = { isActive: true };

    if (category && typeof category === 'string' && category.trim()) {
      filter.category = category.trim();
    }

    if (q && typeof q === 'string' && q.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
      ];
    }

    if (minPrice) filter.price = { ...(filter.price || {}), $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...(filter.price || {}), $lte: Number(maxPrice) };

    const sortObj = {};
    if (sort === 'price_asc') sortObj.price = 1;
    if (sort === 'price_desc') sortObj.price = -1;
    if (sort === 'newest') sortObj.createdAt = -1;

    const items = await Product.find(filter)
      .sort(Object.keys(sortObj).length ? sortObj : { createdAt: -1 })
      .limit(200);

    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const item = await Product.findById(id);
    if (!item || item.isActive === false) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json({ item });
  } catch (err) {
    return next(err);
  }
}

