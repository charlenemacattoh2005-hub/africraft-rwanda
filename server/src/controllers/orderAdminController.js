import { Order }   from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User }    from '../models/User.js';

// Backfills live product imageUrl for any items missing it (covers old orders)
async function hydrateImages(orders) {
  const allIds = [...new Set(
    orders.flatMap(o => (o.items || []).map(i => i.productId?.toString()).filter(Boolean))
  )];
  if (!allIds.length) return orders;
  const products = await Product.find({ _id: { $in: allIds } }, { _id: 1, imageUrl: 1 }).lean();
  const imgMap = new Map(products.map(p => [p._id.toString(), p.imageUrl || '']));
  return orders.map(o => ({
    ...o,
    items: (o.items || []).map(i => ({
      ...i,
      imageUrl: i.imageUrl || imgMap.get(i.productId?.toString()) || '',
    })),
  }));
}

const VALID_STATUSES = [
  'pending','confirmed','paid','processing','packed',
  'shipped','out_for_delivery','delivered','completed',
  'cancelled','returned','refunded',
];

export async function getAdminOrders(req, res, next) {
  try {
    const { status, page = 1, limit = 50, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) filter.$or = [
      { 'customer.fullName': { $regex: search, $options: 'i' } },
      { 'customer.email':    { $regex: search, $options: 'i' } },
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [raw, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Order.countDocuments(filter),
    ]);
    const orders = await hydrateImages(raw);
    return res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { return next(err); }
}

export async function getAdminOrderById(req, res, next) {
  try {
    const raw = await Order.findById(req.params.id).lean();
    if (!raw) return res.status(404).json({ message: 'Order not found' });
    const [order] = await hydrateImages([raw]);
    return res.json({ order });
  } catch (err) { return next(err); }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status, note } = req.body;
    if (!VALID_STATUSES.includes(status))
      return res.status(400).json({ message: 'Invalid status' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    if (!order.timeline) order.timeline = [];
    order.timeline.push({ status, note: note || '', by: req.user?.email || 'admin', at: new Date() });
    if (status === 'refunded') { order.refundedAt = new Date(); order.refundAmount = order.total; }
    await order.save();
    const [hydrated] = await hydrateImages([order.toObject()]);
    return res.json({ order: hydrated });
  } catch (err) { return next(err); }
}

export async function addOrderNote(req, res, next) {
  try {
    const raw = await Order.findByIdAndUpdate(
      req.params.id, { adminNote: req.body.note }, { new: true }
    ).lean();
    if (!raw) return res.status(404).json({ message: 'Order not found' });
    const [order] = await hydrateImages([raw]);
    return res.json({ order });
  } catch (err) { return next(err); }
}

export async function assignRider(req, res, next) {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { riderId: req.body.riderId, status: 'shipped' },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json({ order });
  } catch (err) { return next(err); }
}
