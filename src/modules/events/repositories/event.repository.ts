import Event, { IEvent, EventStatus } from "../models/event.model";
import TicketType from "../models/ticket-type.model";

const E = Event as unknown as {
  create(data: any): Promise<any>;
  findById(id: string): any;
  findOne(filter: Record<string, unknown>): any;
  find(filter: Record<string, unknown>): any;
  exists(filter: Record<string, unknown>): Promise<boolean>;
  findByIdAndUpdate(id: string, data: Partial<IEvent>, options: any): any;
  findByIdAndDelete(id: string): any;
};

const TT = TicketType as unknown as {
  aggregate(pipeline: Array<Record<string, unknown>>): Promise<Array<{ _id: string; totalQuantity: number }>>;
};

export async function create(data: Omit<IEvent, "_id" | "createdAt" | "updatedAt">): Promise<IEvent> {
  return (await E.create(data)) as unknown as IEvent;
}

export async function findById(id: string): Promise<IEvent | null> {
  return (await E.findById(id).lean()) as unknown as (IEvent | null);
}

export async function findBySlug(slug: string): Promise<IEvent | null> {
  return (await E.findOne({ slug }).lean()) as unknown as (IEvent | null);
}

export async function findByOrganizerId(organizerId: string): Promise<IEvent[]> {
  return (await E.find({ organizerId }).sort({ startsAt: -1 }).lean()) as unknown as IEvent[];
}

export async function findAll(): Promise<IEvent[]> {
  return (await E.find({}).sort({ createdAt: -1 }).lean()) as unknown as IEvent[];
}

export async function findPublished(): Promise<IEvent[]> {
  return (await E.find({ status: EventStatus.PUBLISHED }).sort({ startsAt: 1 }).lean()) as unknown as IEvent[];
}

export async function findPublishedFiltered(params: {
  city?: string;
  state?: string;
  search?: string;
}): Promise<IEvent[]> {
  const filter: Record<string, unknown> = { status: EventStatus.PUBLISHED };
  if (params.city) filter["venue.city"] = params.city;
  if (params.state) filter["venue.state"] = params.state;
  if (params.search) filter.title = { $regex: params.search, $options: "i" };
  return (await E.find(filter).sort({ startsAt: 1 }).lean()) as unknown as IEvent[];
}

export type FeaturedEvent = IEvent & {
  totalTickets: number;
};

export async function findFeaturedPublished(limit = 6): Promise<{
  upcoming: FeaturedEvent[];
  largest: FeaturedEvent[];
}> {
  const events = (await E.find({ status: EventStatus.PUBLISHED }).sort({ startsAt: 1 }).lean()) as unknown as IEvent[];
  const ticketTotals = await TT.aggregate([
    { $group: { _id: "$eventId", totalQuantity: { $sum: "$totalQuantity" } } },
  ]);

  const totalsByEvent = new Map(ticketTotals.map((item) => [item._id, item.totalQuantity]));
  const featured = events.map((event) => ({
    ...event,
    totalTickets: totalsByEvent.get(event._id) ?? 0,
  }));

  return {
    upcoming: featured.slice(0, limit),
    largest: [...featured].sort((left, right) => right.totalTickets - left.totalTickets).slice(0, limit),
  };
}

export async function update(id: string, data: Partial<IEvent>): Promise<IEvent | null> {
  return (await E.findByIdAndUpdate(id, data, { new: true }).lean()) as unknown as (IEvent | null);
}

export async function deleteById(id: string): Promise<IEvent | null> {
  return (await E.findByIdAndDelete(id).lean()) as unknown as (IEvent | null);
}

export async function generateSlug(title: string): Promise<string> {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
  let slug = base;
  let count = 1;
  while (await E.exists({ slug })) {
    slug = `${base}-${count}`;
    count += 1;
  }
  return slug;
}
