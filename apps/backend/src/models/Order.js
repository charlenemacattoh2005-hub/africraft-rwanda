import mongoose from 'mongoose';
import { OrderItemSchema } from './OrderItem.js';

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    customer: {
      fullName: { type: String, required: true, trim: true, maxlength: 120 },
      phone: { type: String, required: true, trim: true, maxlength: 30 },
      email: { type: String, required: true, trim: true, maxlength: 200, lowercase: true },
      address: { type: String, required: true, trim: true, maxlength: 500 },
      city: { type: String, required: true, trim: true, maxlength: 120 },
    },

    status: { type: String, enum: ['pending', 'confirmed', 'paid', 'shipped', 'completed', 'cancelled'], default: 'pending' },

    items: { type: [OrderItemSchema], required: true, validate: [(arr) => arr.length > 0, 'Order must have items'] },

    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);

