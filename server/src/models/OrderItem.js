import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:      { type: String, required: true, maxlength: 120 },
    imageUrl:  { type: String, default: '' },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity:  { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

export const OrderItemSchema = orderItemSchema;

