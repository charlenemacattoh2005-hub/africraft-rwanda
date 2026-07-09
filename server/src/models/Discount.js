import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema(
  {
    code:        { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 50 },
    type:        { type: String, enum: ['percentage', 'fixed'], required: true },
    value:       { type: Number, required: true, min: 0 },
    minOrder:    { type: Number, default: 0, min: 0 },
    maxUses:     { type: Number, default: 0, min: 0 },   // 0 = unlimited
    uses:        { type: Number, default: 0, min: 0 },
    startDate:   { type: Date, default: null },
    endDate:     { type: Date, default: null },
    isActive:    { type: Boolean, default: true },
    description: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

discountSchema.index({ code: 1 });
discountSchema.index({ isActive: 1, endDate: 1 });

export const Discount = mongoose.model('Discount', discountSchema);
