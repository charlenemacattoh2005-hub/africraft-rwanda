import { Order } from '../models/Order.js';
import { getSiteContent } from '../models/SiteContent.js';

export async function getRiderStats(req, res, next) {
  try {
    const siteContent     = await getSiteContent();
    const ratePerDelivery = siteContent.riderEarningsPerDelivery || 2000;
    const riderId = req.user.userId;

    const [total, delivered, pending] = await Promise.all([
      Order.countDocuments({ riderId }),
      Order.countDocuments({ riderId, status: { $in: ['delivered', 'completed'] } }),
      Order.countDocuments({ riderId, status: { $in: ['shipped', 'out_for_delivery'] } }),
    ]);

    return res.json({ total, delivered, pending, ratePerDelivery, earnings: delivered * ratePerDelivery });
  } catch (err) { return next(err); }
}

export async function getRiderDeliveries(req, res, next) {
  try {
    const { status = 'all' } = req.query;
    const filter = { riderId: req.user.userId };
    if (status !== 'all') {
      // support comma-separated status values e.g. "shipped,out_for_delivery"
      const statuses = status.split(',').map(s => s.trim()).filter(Boolean);
      filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ orders });
  } catch (err) { return next(err); }
}

export async function updateDeliveryStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['shipped', 'out_for_delivery', 'delivered'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Invalid status for rider' });
    const order = await Order.findOne({ _id: req.params.id, riderId: req.user.userId });
    if (!order) return res.status(404).json({ message: 'Delivery not found or not assigned to you' });
    order.status = status;
    if (!order.timeline) order.timeline = [];
    order.timeline.push({ status, note: '', by: req.user.email || 'rider', at: new Date() });
    await order.save();
    return res.json({ order });
  } catch (err) { return next(err); }
}
