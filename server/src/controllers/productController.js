import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';

export function buildPriceFilter(minPrice, maxPrice) {
  const parsedMin = typeof minPrice === 'string' ? Number(minPrice) : minPrice;
  const parsedMax = typeof maxPrice === 'string' ? Number(maxPrice) : maxPrice;

  const hasValidMin = Number.isFinite(parsedMin) && parsedMin >= 0;
  const hasValidMax = Number.isFinite(parsedMax) && parsedMax >= 0;

  if (!hasValidMin && !hasValidMax) return undefined;

  const priceFilter = {};
  if (hasValidMin) priceFilter.$gte = parsedMin;
  if (hasValidMax) priceFilter.$lte = parsedMax;

  return priceFilter;
}

const fallbackProducts = [
  {
    _id: 'demo-kigali-basket',
    name: 'Kigali Basket',
    description: 'Handwoven artisan basket from Rwanda with a modern finish.',
    category: 'Baskets',
    price: 45000,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-imigongo-art',
    name: 'Imigongo Wall Art',
    description: 'Bold geometric wall art inspired by Rwandan heritage and modern interiors.',
    category: 'Paintings',
    price: 68000,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-beaded-necklace',
    name: 'Beaded Necklace',
    description: 'A vibrant handcrafted necklace made with locally sourced beads and careful detail.',
    category: 'Jewelry',
    price: 32000,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-clay-mug',
    name: 'Clay Mug Set',
    description: 'A set of hand-thrown ceramic mugs featuring earthy tones and artisan texture.',
    category: 'Pottery',
    price: 24000,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-weaved-tote',
    name: 'Weaved Tote Bag',
    description: 'A practical tote bag woven by skilled artisans with durable cotton fibers.',
    category: 'Bags & Accessories',
    price: 28000,
    stock: 11,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function listProducts(req, res, next) {
  try {
    const { q, category, minPrice, maxPrice, sort, featured, badge } = req.query;

    const filter = { isActive: true };

    if (category && typeof category === 'string' && category.trim()) {
      filter.category = category.trim();
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (badge && typeof badge === 'string' && badge.trim()) {
      filter.badge = { $regex: badge.trim(), $options: 'i' };
    }

    if (q && typeof q === 'string' && q.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
      ];
    }

    const priceFilter = buildPriceFilter(minPrice, maxPrice);
    if (priceFilter) filter.price = priceFilter;

    const sortObj = {};
    if (sort === 'lowest_price') sortObj.price = 1;
    if (sort === 'highest_price') sortObj.price = -1;
    if (sort === 'new_arrivals' || sort === 'newest') sortObj.createdAt = -1;

    let items = [];
    let itemsWithStats = [];

    try {
      items = await Product.find(filter)
        .sort(Object.keys(sortObj).length ? sortObj : { createdAt: -1 })
        .limit(200)
        .lean();

      const reviewStats = await Review.aggregate([
        { $match: { productId: { $in: items.map((item) => item._id) } } },
        { $group: { _id: '$productId', reviewCount: { $sum: 1 }, averageRating: { $avg: '$rating' } } },
      ]);

      const statsMap = new Map(reviewStats.map((stat) => [stat._id.toString(), stat]));
      itemsWithStats = items.map((item) => {
        const stat = statsMap.get(item._id.toString());
        return {
          ...item,
          reviewCount: stat?.reviewCount || 0,
          averageRating: stat?.averageRating ? Number(stat.averageRating.toFixed(1)) : 0,
        };
      });
    } catch (dbErr) {
      console.warn('[products] Falling back to demo products:', dbErr.message);
      itemsWithStats = [];
    }

    const fallbackItems = fallbackProducts.filter((item) => {
      if (q && typeof q === 'string' && q.trim()) {
        const needle = q.trim().toLowerCase();
        const matchesQuery = item.name.toLowerCase().includes(needle) || item.description.toLowerCase().includes(needle);
        if (!matchesQuery) return false;
      }

      if (priceFilter) {
        const price = Number(item.price);
        if (priceFilter.$gte !== undefined && price < priceFilter.$gte) return false;
        if (priceFilter.$lte !== undefined && price > priceFilter.$lte) return false;
      }

      return true;
    });

    if (itemsWithStats.length === 0) {
      return res.json({ items: fallbackItems.map((item) => ({ ...item, reviewCount: 0, averageRating: 0 })) });
    }

    return res.json({ items: itemsWithStats });
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

    const reviewStats = await Review.aggregate([
      { $match: { productId: item._id } },
      { $group: { _id: null, reviewCount: { $sum: 1 }, averageRating: { $avg: '$rating' } } },
    ]);

    const stats = reviewStats[0] || { reviewCount: 0, averageRating: 0 };
    return res.json({
      item: {
        ...item.toObject(),
        reviewCount: stats.reviewCount,
        averageRating: stats.averageRating ? Number(stats.averageRating.toFixed(1)) : 0,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { name, description, category, price, stock, imageUrl } = req.body;
    const product = await Product.create({ name, description, category, price, stock, imageUrl });
    return res.status(201).json({ product });
  } catch (err) {
    return next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json({ product });
  } catch (err) {
    return next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json({ message: 'Product removed' });
  } catch (err) {
    return next(err);
  }
}

