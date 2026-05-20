import mongoose, { Schema, model } from "mongoose";
import { tccCollectionName } from "@/lib/mongo-collections";

export enum UserRole {
  BUYER = "buyer",
  ORGANIZER = "organizer",
  OPERATOR = "operator",
  ADMIN = "admin",
}

export interface IUser {
  _id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  cpf?: string;
  phone?: string;
  createdAt: Date;
  emailVerifiedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true, default: UserRole.BUYER },
    cpf: { type: String, trim: true, select: false },
    phone: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
    emailVerifiedAt: { type: Date },
  },
  { timestamps: true },
);

// Index
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Prevent overwriting the model on hot reload (Next.js dev)
export default mongoose.models.User || model<IUser>("User", UserSchema, tccCollectionName("users"));
