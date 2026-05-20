import Lot from "../models/lot.model";

const L = Lot as unknown as {
  create(data: any): Promise<any>;
  find(filter: Record<string, unknown>): any;
  findById(id: string): any;
  findByIdAndUpdate(id: string, data: any, options: any): any;
};

export async function create(data: any) {
  return (await L.create(data)) as unknown as any;
}

export async function findByTicketTypeId(ticketTypeId: string) {
  return (await L.find({ ticketTypeId }).lean()) as unknown as any[];
}

export async function findById(id: string) {
  return (await L.findById(id).lean()) as unknown as any;
}

export async function findActiveByTicketTypeId(ticketTypeId: string) {
  const now = new Date();
  return (
    await L.find({
      ticketTypeId,
      active: true,
      startsAt: { $lte: now },
      endsAt: { $gte: now },
    }).lean()
  ) as unknown as any[];
}

export async function update(id: string, data: any) {
  return (await L.findByIdAndUpdate(id, data, { new: true }).lean()) as unknown as any;
}
