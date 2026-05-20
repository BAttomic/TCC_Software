import mongoose, { Schema, model } from "mongoose";

export enum EventStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  CANCELLED = "cancelled",
  FINISHED = "finished",
}

interface IVenue {
  name: string;
  address: string;
  city: string;
  state: string;
}

export interface IEvent {
  _id: string;
  organizerId: string;
  title: string;
  slug: string;
  description: string;
  venue: IVenue;
  startsAt: Date;
  endsAt: Date;
  coverImageUrl?: string;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

const VenueSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true, length: 2 },
});

const EventSchema = new Schema<IEvent>(
  {
    organizerId: { type: String, required: true },
    title: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    venue: { type: VenueSchema, required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    coverImageUrl: { type: String },
    status: { type: String, enum: Object.values(EventStatus), default: EventStatus.DRAFT },
  },
  { timestamps: true },
);

// Indexes
EventSchema.index({ slug: 1 });
EventSchema.index({ status: 1, startsAt: -1 });
EventSchema.index({ "venue.city": 1 });

export default mongoose.models.Event || model<IEvent>("Event", EventSchema);
