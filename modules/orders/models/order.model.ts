import mongoose, { Schema, model } from "mongoose";
import { tccCollectionName } from "@/lib/mongo-collections";

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export interface IOrderItem {
  ticketTypeId: string;
  lotId: string;
  quantity: number;
  unitPrice: number; // cents
}

export interface IOrder {
  _id: string;
  buyerId: string;
  eventId: string;
  items: IOrderItem[];
  totalAmount: number; // cents
  status: OrderStatus;
  paymentIntentId?: string;
  expiresAt: Date;
  paidAt?: Date;
  createdAt: Date;
}

const OrderItemSchema = new Schema({
  ticketTypeId: { type: String, required: true },
  lotId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
});

const OrderSchema = new Schema<IOrder>(
  {
    buyerId: { type: String, required: true },
    eventId: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    paymentIntentId: { type: String },
    expiresAt: { type: Date, required: true },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

// Indexes
OrderSchema.index({ buyerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, expiresAt: 1 });

export default mongoose.models.Order || model<IOrder>("Order", OrderSchema, tccCollectionName("orders"));
