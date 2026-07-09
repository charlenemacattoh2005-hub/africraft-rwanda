import { getSiteContent, SiteContent } from '../models/SiteContent.js';
import { Order }   from '../models/Order.js';
import { Product } from '../models/Product.js';

/* ── Public: get site content (homepage CMS) ─────────────────── */
export async function getPublicSiteContent(req, res, next) {
  try {
    const doc = await getSiteContent();
    return res.json({ content: doc });
  } catch (err) { return next(err); }
}

/* ── Admin: update site content ──────────────────────────────── */
export async function updateSiteContent(req, res, next) {
  try {
    const allowed = [
      'heroTitle', 'heroSubtitle', 'heroImageUrl', 'heroBanners',
      'featuredTitle', 'featuredSubtitle', 'newArrivalsTitle', 'bestSellersTitle',
      'deliveryFeeThreshold', 'platformFeePercent', 'riderEarningsPerDelivery',
      'announcementBar', 'announcementActive',
      'contactEmail', 'contactPhone', 'contactAddress',
      'facebookUrl', 'instagramUrl', 'twitterUrl',
    ];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const doc = await SiteContent.findOneAndUpdate(
      { key: 'main' },
      { $set: updates },
      { new: true, upsert: true }
    );
    return res.json({ content: doc });
  } catch (err) { return next(err); }
}

/* ── Admin: add/remove hero banner ──────────────────────────── */
export async function addHeroBanner(req, res, next) {
  try {
    const { title, subtitle, imageUrl, linkUrl, linkLabel, isActive, order } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'imageUrl is required' });
    const doc = await SiteContent.findOneAndUpdate(
      { key: 'main' },
      { $push: { heroBanners: { title: title || '', subtitle: subtitle || '', imageUrl, linkUrl: linkUrl || '', linkLabel: linkLabel || '', isActive: isActive !== false, order: order || 0 } } },
      { new: true, upsert: true }
    );
    return res.json({ content: doc });
  } catch (err) { return next(err); }
}

export async function removeHeroBanner(req, res, next) {
  try {
    const doc = await SiteContent.findOneAndUpdate(
      { key: 'main' },
      { $pull: { heroBanners: { _id: req.params.bannerId } } },
      { new: true }
    );
    return res.json({ content: doc });
  } catch (err) { return next(err); }
}

/* ── Vendor: payout summary ──────────────────────────────────── */
export async function getVendorPayout(req, res, next) {
  try {
    const siteContent = await getSiteContent();
    const feePercent  = siteContent.platformFeePercent || 15;

    const productIds = (await Product.find({ vendor: req.user.userId }).select('_id').lean()).map(p => p._id);
    const orders     = await Order.find({
      'items.productId': { $in: productIds },
      status: { $nin: ['cancelled', 'refunded'] },
    }).lean();

    const grossRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
    const platformFee  = Math.round(grossRevenue * (feePercent / 100));
    const netEarnings  = grossRevenue - platformFee;

    const pendingOrders   = orders.filter(o => ['pending','confirmed','processing','packed'].includes(o.status)).length;
    const completedOrders = orders.filter(o => ['delivered','completed'].includes(o.status)).length;

    return res.json({
      grossRevenue,
      platformFeePercent: feePercent,
      platformFee,
      netEarnings,
      orderCount: orders.length,
      pendingOrders,
      completedOrders,
    });
  } catch (err) { return next(err); }
}

/* ── Rider: earnings summary ─────────────────────────────────── */
export async function getRiderEarningsSummary(req, res, next) {
  try {
    const siteContent = await getSiteContent();
    const ratePerDelivery = siteContent.riderEarningsPerDelivery || 2000;

    const riderId   = req.user.userId;
    const [total, delivered, inProgress] = await Promise.all([
      Order.countDocuments({ riderId }),
      Order.countDocuments({ riderId, status: { $in: ['delivered', 'completed'] } }),
      Order.countDocuments({ riderId, status: { $in: ['shipped', 'out_for_delivery'] } }),
    ]);

    return res.json({
      total,
      delivered,
      pending: inProgress,
      ratePerDelivery,
      earnings: delivered * ratePerDelivery,
    });
  } catch (err) { return next(err); }
}
