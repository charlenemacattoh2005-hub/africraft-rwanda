import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    imageUrl: { type: String, trim: true, maxlength: 1000, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
