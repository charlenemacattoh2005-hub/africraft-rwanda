import { Order }    from '../models/Order.js';
import { Product }  from '../models/Product.js';
import { User }     from '../models/User.js';
import { Category } from '../models/Category.js';
import { Review }   from '../models/Review.js';
import { Discount } from '../models/Discount.js';

function safeId(id) { return String(id).slice(-6).toUpperCase(); }

export async function getSiteStats(req, res, next) {
  try {
    const now = new Date();
    const som = new Date(now.getFullYear(), now.getMonth(), 1);
    const lom = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalOrders, totalUsers, totalProducts,
      salesAgg, monthAgg, lastMonthAgg,
      revenueByCategory, ordersByDay,
      vendorCount, riderCount,
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: som } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: lom, $lt: som } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.category', revenue: { $sum: '$items.lineTotal' }, qty: { $sum: '$items.quantity' } } },
        { $sort: { revenue: -1 } }, { $limit: 8 },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' }, orders: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]),
      User.countDocuments({ role: 'vendor' }),
      User.countDocuments({ role: 'rider' }),
    ]);

    return res.json({
      totalOrders, totalUsers, totalProducts,
      totalRevenue: salesAgg[0]?.total || 0,
      thisMonth:    { revenue: monthAgg[0]?.total    || 0, orders: monthAgg[0]?.count    || 0 },
      lastMonth:    { revenue: lastMonthAgg[0]?.total || 0, orders: lastMonthAgg[0]?.count || 0 },
      revenueByCategory, ordersByDay, vendorCount, riderCount,
    });
  } catch (err) { return next(err); }
}

export async function getNotifications(req, res, next) {
  try {
    const [pendingOrders, lowStockProds, newUsers] = await Promise.all([
      Order.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5).lean(),
      Product.find({ stock: { $lte: 5 }, isActive: true }).select('name stock').limit(5).lean(),
      User.find({ role: 'customer' }).sort({ createdAt: -1 }).limit(3).lean(),
    ]);
    const notifications = [
      ...pendingOrders.map(o => ({
        _id: `order-${o._id}`, type: 'order', title: 'New Pending Order',
        message: `Order #${safeId(o._id)} from ${o.customer?.fullName || 'Customer'}`,
        time: o.createdAt, read: false,
      })),
      ...lowStockProds.map(p => ({
        _id: `stock-${p._id}`, type: 'stock', title: 'Low Stock Alert',
        message: `${p.name} has only ${p.stock} unit${p.stock === 1 ? '' : 's'} left`,
        time: new Date().toISOString(), read: false,
      })),
      ...newUsers.map(u => ({
        _id: `user-${u._id}`, type: 'user', title: 'New Customer',
        message: `${u.fullName} just registered`,
        time: u.createdAt, read: false,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return res.json({ notifications });
  } catch (err) { return next(err); }
}

export async function getActivityLog(req, res, next) {
  try {
    const [recentOrders, recentUsers] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(10).lean(),
      User.find({ role: 'customer' }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    const log = [
      ...recentOrders.map(o => ({
        type: 'order',
        message: `Order #${safeId(o._id)} placed by ${o.customer?.fullName || 'Customer'}`,
        time: o.createdAt, status: o.status,
      })),
      ...recentUsers.map(u => ({
        type: 'user',
        message: `New customer registered: ${u.fullName}`,
        time: u.createdAt, status: 'new',
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return res.json({ log });
  } catch (err) { return next(err); }
}

export async function getAdminCategories(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    return res.json({ categories });
  } catch (err) { return next(err); }
}

export async function createAdminCategory(req, res, next) {
  try {
    const { name, description, imageUrl, isActive } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    if (await Category.findOne({ name: name.trim() }))
      return res.status(409).json({ message: 'Category already exists' });
    const cat = await Category.create({
      name: name.trim(), description: description || '',
      imageUrl: imageUrl || '', isActive: isActive !== false,
    });
    return res.status(201).json({ category: cat });
  } catch (err) { return next(err); }
}

export async function updateAdminCategory(req, res, next) {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    return res.json({ category: cat });
  } catch (err) { return next(err); }
}

export async function deleteAdminCategory(req, res, next) {
  try {
    await Category.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Category deleted' });
  } catch (err) { return next(err); }
}

export async function getAdminReviews(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find()
        .populate('userId',    'fullName email')
        .populate('productId', 'name imageUrl')
        .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Review.countDocuments(),
    ]);
    return res.json({ reviews, total });
  } catch (err) { return next(err); }
}

export async function deleteAdminReview(req, res, next) {
  try {
    await Review.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Review deleted' });
  } catch (err) { return next(err); }
}

/* ── Discounts (MongoDB-backed) ──────────────────────────────── */

export async function getDiscounts(req, res, next) {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 }).lean();
    return res.json({ discounts });
  } catch (err) { return next(err); }
}

export async function createDiscount(req, res, next) {
  try {
    const { code, type, value, minOrder, maxUses, startDate, endDate, isActive, description } = req.body;
    if (!code || !type || value == null)
      return res.status(400).json({ message: 'code, type and value required' });
    if (await Discount.findOne({ code: code.toUpperCase() }))
      return res.status(409).json({ message: 'Coupon code already exists' });
    const discount = await Discount.create({
      code: code.toUpperCase(), type, value: Number(value),
      minOrder:  Number(minOrder  || 0),
      maxUses:   Number(maxUses   || 0),
      startDate: startDate || null,
      endDate:   endDate   || null,
      isActive:  isActive !== false,
      description: description || '',
    });
    return res.status(201).json({ discount });
  } catch (err) { return next(err); }
}

export async function updateDiscount(req, res, next) {
  try {
    const allowed = ['code','type','value','minOrder','maxUses','startDate','endDate','isActive','description'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    if (updates.code) updates.code = updates.code.toUpperCase();
    const discount = await Discount.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!discount) return res.status(404).json({ message: 'Discount not found' });
    return res.json({ discount });
  } catch (err) { return next(err); }
}

export async function deleteDiscount(req, res, next) {
  try {
    await Discount.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Deleted' });
  } catch (err) { return next(err); }
}
