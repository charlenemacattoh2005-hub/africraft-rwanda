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

export async function createProduct(req, res, next) {
  try {
    const { name, description, price, imageUrl, category, stock, isActive, badge, featured } = req.body;
    if (!name || !description || price == null || !category || stock == null) {
      return res.status(400).json({ message: 'name, description, price, category and stock are required' });
    }
    const product = await Product.create({
      name, description,
      price: Number(price),
      imageUrl: imageUrl || '',
      category,
      stock: Number(stock),
      isActive: isActive !== false,
      badge: badge || '',
      featured: featured || false,
    });
    return res.status(201).json({ product });
  } catch (err) { return next(err); }
}

export async function getSiteStats(req, res, next) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [totalOrders, totalUsers, totalProducts, salesAgg, monthAgg, lastMonthAgg,
           revenueByCategory, ordersByDay] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.category', revenue: { $sum: '$items.lineTotal' }, qty: { $sum: '$items.quantity' } } },
        { $sort: { revenue: -1 } }, { $limit: 8 },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return res.json({
      totalOrders, totalUsers, totalProducts,
      totalRevenue: salesAgg[0]?.total || 0,
      thisMonth: { revenue: monthAgg[0]?.total || 0, orders: monthAgg[0]?.count || 0 },
      lastMonth: { revenue: lastMonthAgg[0]?.total || 0, orders: lastMonthAgg[0]?.count || 0 },
      revenueByCategory,
      ordersByDay,
    });
  } catch (err) { return next(err); }
}
