import { Order }    from '../models/Order.js';
import { Product }  from '../models/Product.js';
import { User }     from '../models/User.js';
import { Category } from '../models/Category.js';
import { Review }   from '../models/Review.js';
import bcrypt from 'bcrypt';

function safeId(id) { return String(id).slice(-6).toUpperCase(); }

/* ── Admin stats ─────────────────────────────────────────────── */
export async function getAdminStats(req, res, next) {
  try {
    const [orderCount, userCount, productCount, sales, topProducts,
           recentOrders, lowStock, recentCustomers] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([{ $group: { _id: null, totalSales: { $sum: '$total' }, totalOrders: { $sum: 1 } } }]),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.productId', name: { $first: '$items.name' },
            qty: { $sum: '$items.quantity' }, revenue: { $sum: '$items.lineTotal' } } },
        { $sort: { qty: -1 } }, { $limit: 5 },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(10).lean(),
      Product.find({ isActive: true, stock: { $lte: 5 } }).select('name stock').sort({ stock: 1 }).limit(10).lean(),
      User.find({ role: 'customer' }).select('fullName email createdAt').sort({ createdAt: -1 }).limit(6).lean(),
    ]);
    return res.json({ orderCount, userCount, productCount,
      totalSales: sales[0]?.totalSales || 0, totalOrders: sales[0]?.totalOrders || 0,
      topProducts, recentOrders, lowStock, recentCustomers });
  } catch (err) { return next(err); }
}
