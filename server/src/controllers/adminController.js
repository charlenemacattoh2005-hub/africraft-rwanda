import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

export async function getAdminStats(req, res, next) {
  try {
    const orderCount   = await Order.countDocuments();
    const userCount    = await User.countDocuments({ role: 'customer' });
    const productCount = await Product.countDocuments({ isActive: true });

    const sales = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: '$total' }, totalOrders: { $sum: 1 } } },
    ]);

    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name:    { $first: '$items.name' },
          qty:     { $sum: '$items.quantity' },
          revenue: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { qty: -1 } },
      { $limit: 5 },
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const lowStock = await Product.find({ isActive: true, stock: { $lte: 5 } })
      .select('name stock')
      .sort({ stock: 1 })
      .limit(10)
      .lean();

    const recentCustomers = await User.find({ role: 'customer' })
      .select('fullName email createdAt')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return res.json({
      orderCount,
      userCount,
      productCount,
      totalSales:      sales[0]?.totalSales  || 0,
      totalOrders:     sales[0]?.totalOrders || 0,
      topProducts,
      recentOrders,
      lowStock,
      recentCustomers,
    });
  } catch (err) { return next(err); }
}

export async function getAdminOrders(req, res, next) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ orders });
  } catch (err) { return next(err); }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending','confirmed','paid','shipped','completed','cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json({ order });
  } catch (err) { return next(err); }
}

export async function getAdminCustomers(req, res, next) {
  try {
    const users = await User.find({ role: 'customer' }).select('-passwordHash').sort({ createdAt: -1 }).lean();
    return res.json({ users });
  } catch (err) { return next(err); }
}

export async function getAdminProducts(req, res, next) {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return res.json({ products });
  } catch (err) { return next(err); }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const product = await Product.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json({ product });
  } catch (err) { return next(err); }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    return res.json({ message: 'Product deleted' });
  } catch (err) { return next(err); }
}
