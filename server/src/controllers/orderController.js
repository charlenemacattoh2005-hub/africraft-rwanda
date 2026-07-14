import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

export async function checkout(req, res, next) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { customer, items, deliveryFee, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required' });
    }

    // Validate stock and calculate totals
    const productIds = items.map((x) => x.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    const byId = new Map(products.map((p) => [p._id.toString(), p]));

    let subtotal = 0;
    const orderItems = [];

    for (const line of items) {
      const pid = line.productId;
      const qty = Number(line.quantity);
      const product = byId.get(pid);

      if (!product) return res.status(400).json({ message: `Invalid product: ${pid}` });
      if (!Number.isFinite(qty) || qty < 1) return res.status(400).json({ message: 'Invalid quantity' });
      if (product.stock < qty) return res.status(409).json({ message: `Insufficient stock for ${product.name}` });

      const unitPrice = product.price;
      const lineTotal = unitPrice * qty;

      subtotal += lineTotal;
      orderItems.push({
        productId: product._id,
        name:      product.name,
        imageUrl:  product.imageUrl || '',
        unitPrice,
        quantity:  qty,
        lineTotal,
      });
    }

    const delivery = Number(deliveryFee || 0);
    const total = subtotal + (Number.isFinite(delivery) && delivery > 0 ? delivery : 0);

    const status = paymentMethod ? 'paid' : 'confirmed';
    const order = await Order.create({
      userId,
      customer,
      items: orderItems,
      subtotal,
      deliveryFee: delivery,
      total,
      paymentMethod: paymentMethod || '',
      status,
    });

    // Reduce stock (best-effort, no transaction to keep simple)
    await Promise.all(
      orderItems.map((oi) =>
        Product.updateOne({ _id: oi.productId }, { $inc: { stock: -oi.quantity } })
      )
    );

    return res.status(201).json({ message: 'Order created', order: { id: order._id, orderNumber: order.orderNumber || order._id, total: order.total, status: order.status, paymentMethod: order.paymentMethod } });
  } catch (err) {
    return next(err);
  }
}

// Merges live product imageUrl into order items (covers orders placed before imageUrl was saved)
async function hydrateImages(orders) {
  const allIds = [...new Set(orders.flatMap(o => o.items.map(i => i.productId?.toString()).filter(Boolean)))];
  if (!allIds.length) return orders;
  const products = await Product.find({ _id: { $in: allIds } }, { _id: 1, imageUrl: 1 }).lean();
  const imgMap = new Map(products.map(p => [p._id.toString(), p.imageUrl || '']));
  return orders.map(o => ({
    ...o,
    items: o.items.map(i => ({
      ...i,
      imageUrl: i.imageUrl || imgMap.get(i.productId?.toString()) || '',
    })),
  }));
}

export async function myOrders(req, res, next) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const raw = await Order.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
    const orders = await hydrateImages(raw);
    return res.json({ orders });
  } catch (err) {
    return next(err);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const raw = await Order.findById(id).lean();
    if (!raw) return res.status(404).json({ message: 'Order not found' });

    if (raw.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const [order] = await hydrateImages([raw]);
    return res.json({ order });
  } catch (err) {
    return next(err);
  }
}

export async function listAllOrders(req, res, next) {
  try {
    const raw = await Order.find().sort({ createdAt: -1 }).limit(200).lean();
    const orders = await hydrateImages(raw);
    return res.json({ orders });
  } catch (err) {
    return next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    return res.json({ order });
  } catch (err) {
    return next(err);
  }
}

