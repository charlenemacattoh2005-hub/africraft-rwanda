import { Category } from '../models/Category.js';

const fallbackCategories = [
  { _id: 'cat-baskets', name: 'Baskets', description: 'Handwoven baskets and storage pieces rooted in Rwandan craft traditions.', imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80' },
  { _id: 'cat-jewelry', name: 'Jewelry', description: 'Beaded and crafted jewelry made with care and color.', imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80' },
  { _id: 'cat-wood-carvings', name: 'Wood Carvings', description: 'Hand-carved wooden decor and figurines inspired by local motifs.', imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80' },
  { _id: 'cat-pottery', name: 'Pottery', description: 'Ceramic mugs, plates, and vessels made by skilled artisans.', imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80' },
  { _id: 'cat-traditional-clothing', name: 'Traditional Clothing', description: 'Clothing and textiles that celebrate heritage through pattern and craft.', imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80' },
  { _id: 'cat-paintings', name: 'Paintings', description: 'Artworks and wall pieces inspired by Rwandan culture and story.', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=80' },
  { _id: 'cat-home-decor', name: 'Home Decor', description: 'Decorative pieces that add warmth and identity to everyday spaces.', imageUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80' },
  { _id: 'cat-bags-accessories', name: 'Bags & Accessories', description: 'Practical accessories designed with artisan detail and function.', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80' },
];

export async function listCategories(req, res, next) {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    if (categories.length > 0) {
      return res.json({ categories });
    }

    return res.json({ categories: fallbackCategories });
  } catch (err) {
    console.warn('[categories] Falling back to demo categories:', err.message);
    return res.json({ categories: fallbackCategories });
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    return res.status(201).json({ category });
  } catch (err) {
    return next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const category = await Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    return res.json({ category });
  } catch (err) {
    return next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    return res.json({ message: 'Category removed' });
  } catch (err) {
    return next(err);
  }
}
