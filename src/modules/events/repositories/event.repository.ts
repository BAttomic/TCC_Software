import Event, { IEvent, EventStatus } from "../models/event.model";

const E = Event as unknown as {
  create(data: any): Promise<any>;
  findById(id: string): any;
  findOne(filter: Record<string, unknown>): any;
  find(filter: Record<string, unknown>): any;
  exists(filter: Record<string, unknown>): Promise<boolean>;
  findByIdAndUpdate(id: string, data: Partial<IEvent>, options: any): any;
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

export async function update(id: string, data: Partial<IEvent>): Promise<IEvent | null> {
  return (await E.findByIdAndUpdate(id, data, { new: true }).lean()) as unknown as (IEvent | null);
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
