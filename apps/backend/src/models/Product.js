import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: '' },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    stock: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
    badge: { type: String, default: '' },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);

