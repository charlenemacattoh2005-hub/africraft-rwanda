import { Product }  from '../models/Product.js';
import { Order }    from '../models/Order.js';

export async function getAdminProducts(req, res, next) {
  try {
    const { category, status, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (status   && status   !== 'all') filter.status   = status;
    if (search) filter.$or = [
      { name:     { $regex: search, $options: 'i' } },
      { sku:      { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Product.countDocuments(filter),
    ]);
    return res.json({ products, total });
  } catch (err) { return next(err); }
}

export async function createProduct(req, res, next) {
  try {
    const {
      name, description, price, discountPrice, imageUrl, images,
      category, stock, stockTracking, sku, barcode,
      status, isActive, badge, featured, variants,
      vendorId,  // optional: admin can assign product to a specific vendor
    } = req.body;
    if (!name || !description || price == null || !category || stock == null)
      return res.status(400).json({ message: 'name, description, price, category and stock are required' });

    // If admin supplies vendorId, verify the user exists and has vendor role
    let resolvedVendor = null;
    if (vendorId) {
      const { User } = await import('../models/User.js');
      const vendor = await User.findOne({ _id: vendorId, role: 'vendor' });
      if (!vendor) return res.status(400).json({ message: 'Vendor not found or user is not a vendor' });
      resolvedVendor = vendor._id;
    }

    const product = await Product.create({
      name, description,
      price:         Number(price),
      discountPrice: discountPrice != null ? Number(discountPrice) : null,
      imageUrl:      imageUrl || '',
      images:        Array.isArray(images) ? images.filter(Boolean) : [],
      category,
      stock:         Number(stock),
      stockTracking: stockTracking !== false,
      sku:           sku || '',
      barcode:       barcode || '',
      status:        status || 'active',
      isActive:      isActive !== false,
      badge:         badge || '',
      featured:      !!featured,
      variants:      Array.isArray(variants) ? variants : [],
      vendor:        resolvedVendor,
    });
    return res.status(201).json({ product });
  } catch (err) { return next(err); }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json({ product });
  } catch (err) { return next(err); }
}

export async function deleteProduct(req, res, next) {
  try {
    await Product.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Product deleted' });
  } catch (err) { return next(err); }
}

export async function bulkProductAction(req, res, next) {
  try {
    const { ids, action } = req.body;
    if (!Array.isArray(ids) || !ids.length)
      return res.status(400).json({ message: 'ids required' });
    const map = {
      delete:   () => Product.deleteMany({ _id: { $in: ids } }),
      activate: () => Product.updateMany({ _id: { $in: ids } }, { $set: { status: 'active',   isActive: true  } }),
      draft:    () => Product.updateMany({ _id: { $in: ids } }, { $set: { status: 'draft',    isActive: false } }),
      archive:  () => Product.updateMany({ _id: { $in: ids } }, { $set: { status: 'archived', isActive: false } }),
    };
    if (!map[action]) return res.status(400).json({ message: 'Invalid action' });
    await map[action]();
    return res.json({ message: `${ids.length} products updated` });
  } catch (err) { return next(err); }
}

export async function getInventory(req, res, next) {
  try {
    const { filter: f = 'all' } = req.query;
    const mongoFilter =
      f === 'out' ? { stock: 0 } :
      f === 'low' ? { stock: { $gt: 0, $lte: 10 } } :
      f === 'ok'  ? { stock: { $gt: 10 } } : {};
    const products   = await Product.find(mongoFilter).sort({ stock: 1 }).lean();
    const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
    return res.json({
      products,
      totalProducts: products.length,
      outOfStock:    products.filter(p => p.stock === 0).length,
      lowStock:      products.filter(p => p.stock > 0 && p.stock <= 10).length,
      totalValue,
    });
  } catch (err) { return next(err); }
}

export async function adjustStock(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.stock = Math.max(0, product.stock + Number(req.body.adjustment));
    await product.save();
    return res.json({ product, newStock: product.stock });
  } catch (err) { return next(err); }
}

/* ── Vendor product management ───────────────────────────────── */
export async function getVendorStats(req, res, next) {
  try {
    const productIds = (await Product.find({ vendor: req.user.userId }).select('_id').lean()).map(p => p._id);
    const orders     = await Order.find({ 'items.productId': { $in: productIds } }).lean();
    return res.json({
      totalRevenue:  orders.reduce((s, o) => s + Number(o.total || 0), 0),
      orderCount:    orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      productCount:  productIds.length,
    });
  } catch (err) { return next(err); }
}

export async function getVendorProducts(req, res, next) {
  try {
    const products = await Product.find({ vendor: req.user.userId }).sort({ createdAt: -1 }).lean();
    return res.json({ products });
  } catch (err) { return next(err); }
}

export async function createVendorProduct(req, res, next) {
  try {
    const { name, description, price, discountPrice, imageUrl, images, category, stock, sku, badge, featured } = req.body;
    if (!name || !description || price == null || !category || stock == null)
      return res.status(400).json({ message: 'name, description, price, category and stock are required' });
    const product = await Product.create({
      name, description,
      price:         Number(price),
      discountPrice: discountPrice != null ? Number(discountPrice) : null,
      imageUrl:      imageUrl || '',
      images:        Array.isArray(images) ? images.filter(Boolean) : [],
      category,
      stock:         Number(stock),
      sku:           sku || '',
      badge:         badge || '',
      featured:      !!featured,
      status:        'draft',
      isActive:      false,
      vendor:        req.user.userId,
    });
    return res.status(201).json({ product });
  } catch (err) { return next(err); }
}

export async function updateVendorProduct(req, res, next) {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendor: req.user.userId });
    if (!product) return res.status(404).json({ message: 'Product not found or not yours' });
    const allowed = ['name','description','price','discountPrice','imageUrl','images','category','stock','sku','badge','featured'];
    allowed.forEach(k => { if (req.body[k] !== undefined) product[k] = req.body[k]; });
    await product.save();
    return res.json({ product });
  } catch (err) { return next(err); }
}

export async function deleteVendorProduct(req, res, next) {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendor: req.user.userId });
    if (!product) return res.status(404).json({ message: 'Product not found or not yours' });
    await product.deleteOne();
    return res.json({ message: 'Product deleted' });
  } catch (err) { return next(err); }
}

export async function getVendorOrders(req, res, next) {
  try {
    const productIds = (await Product.find({ vendor: req.user.userId }).select('_id').lean()).map(p => p._id);
    const raw = await Order.find({ 'items.productId': { $in: productIds } })
      .sort({ createdAt: -1 }).limit(100).lean();
    // Hydrate images
    const imgMap = new Map((await Product.find({ _id: { $in: productIds } }, { _id: 1, imageUrl: 1 }).lean()).map(p => [p._id.toString(), p.imageUrl || '']));
    const orders = raw.map(o => ({ ...o, items: (o.items || []).map(i => ({ ...i, imageUrl: i.imageUrl || imgMap.get(i.productId?.toString()) || '' })) }));
    return res.json({ orders });
  } catch (err) { return next(err); }
}
