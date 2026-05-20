import Order from "../models/order.model";

const O = Order as unknown as {
  create(data: any): Promise<any>;
  findById(id: string): any;
  find(filter: Record<string, unknown>): any;
  findByIdAndUpdate(id: string, data: any, options: any): any;
  findOneAndUpdate(filter: any, update: any, options: any): any;
};

export async function create(data: any) {
  return (await O.create(data)) as unknown as any;
}

export async function findById(id: string) {
  return (await O.findById(id).lean()) as unknown as any;
}

export async function findByBuyerId(buyerId: string) {
  return (await O.find({ buyerId }).sort({ createdAt: -1 }).lean()) as unknown as any[];
}

export async function updateStatus(id: string, status: string, data?: { paidAt?: Date }) {
  return (await O.findByIdAndUpdate(id, { status, ...data }, { new: true }).lean()) as unknown as any;
}

export async function findExpired() {
  return (await O.find({ status: "pending", expiresAt: { $lte: new Date() } }).lean()) as unknown as any[];
}

export async function expire(id: string) {
  return (await O.findOneAndUpdate({ _id: id, status: "pending" }, { status: "expired" }, { new: true })) as unknown as any;
}
