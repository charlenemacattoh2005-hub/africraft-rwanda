import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

export async function getAdminStats(req, res, next) {
  try {
    const orderCount = await Order.countDocuments();
    const userCount = await User.countDocuments({ role: 'customer' });
    const productCount = await Product.countDocuments({ isActive: true });
    const sales = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: '$total' }, totalOrders: { $sum: 1 } } },
    ]);
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', name: { $first: '$items.name' }, qty: { $sum: '$items.quantity' }, revenue: { $sum: '$items.lineTotal' } } },
      { $sort: { qty: -1 } },
      { $limit: 5 },
    ]);

    return res.json({
      orderCount,
      userCount,
      productCount,
      totalSales: sales[0]?.totalSales || 0,
      totalOrders: sales[0]?.totalOrders || 0,
      topProducts,
    });
  } catch (err) {
    return next(err);
  }
}
