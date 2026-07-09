import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },   // e.g. "Color", "Size"
  options: [{ type: String, trim: true }],                 // e.g. ["Red","Blue"]
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true, maxlength: 120 },
    description:   { type: String, required: true, trim: true, maxlength: 2000 },
    price:         { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null },
    imageUrl:      { type: String, default: '' },
    images:        [{ type: String }],                     // gallery URLs
    category:      { type: String, required: true, trim: true, maxlength: 80 },
    stock:         { type: Number, required: true, min: 0 },
    stockTracking: { type: Boolean, default: true },
    sku:           { type: String, default: '', trim: true, maxlength: 80 },
    barcode:       { type: String, default: '', trim: true, maxlength: 80 },
    status:        { type: String, enum: ['active','draft','archived'], default: 'active' },
    isActive:      { type: Boolean, default: true },
    badge:         { type: String, default: '' },
    featured:      { type: Boolean, default: false },
    variants:      [variantSchema],
    vendor:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);
