import mongoose from 'mongoose';
import { OrderItemSchema } from './OrderItem.js';

const timelineEventSchema = new mongoose.Schema({
  status:  { type: String, required: true },
  note:    { type: String, trim: true, maxlength: 500, default: '' },
  by:      { type: String, trim: true, maxlength: 120, default: 'system' },
  at:      { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    customer: {
      fullName:      { type: String, required: true, trim: true, maxlength: 120 },
      phone:         { type: String, required: true, trim: true, maxlength: 30 },
      email:         { type: String, required: true, trim: true, maxlength: 200, lowercase: true },
      address:       { type: String, required: true, trim: true, maxlength: 500 },
      district:      { type: String, trim: true, maxlength: 120, default: '' },
      sector:        { type: String, trim: true, maxlength: 120, default: '' },
      city:          { type: String, trim: true, maxlength: 120, default: '' },
      deliveryNotes: { type: String, trim: true, maxlength: 500, default: '' },
      paymentMethod: { type: String, trim: true, maxlength: 80,  default: '' },
    },

    status: {
      type: String,
      enum: [
        'pending', 'confirmed', 'paid', 'processing',
        'packed', 'shipped', 'out_for_delivery',
        'delivered', 'completed', 'cancelled', 'returned', 'refunded',
      ],
      default: 'pending',
    },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(arr) => arr.length > 0, 'Order must have items'],
    },

    subtotal:      { type: Number, required: true, min: 0 },
    deliveryFee:   { type: Number, required: true, min: 0, default: 0 },
    total:         { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, trim: true, maxlength: 80, default: '' },

    // Fulfillment
    riderId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    trackingNumber:  { type: String, trim: true, maxlength: 120, default: '' },
    estimatedDelivery: { type: Date, default: null },

    // Notes & timeline
    adminNote:  { type: String, trim: true, maxlength: 1000, default: '' },
    timeline:   { type: [timelineEventSchema], default: [] },

    // Return / refund
    returnReason:  { type: String, trim: true, maxlength: 500, default: '' },
    refundAmount:  { type: Number, default: null },
    refundedAt:    { type: Date, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ riderId: 1, status: 1 });

export const Order = mongoose.model('Order', orderSchema);
