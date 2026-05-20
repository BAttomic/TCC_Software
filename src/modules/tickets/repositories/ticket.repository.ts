import Ticket from "../models/ticket.model";
import { customAlphabet } from "nanoid";
import crypto from "crypto";
import { env } from "@/lib/env";

const nanoid = customAlphabet("1234567890abcdef", 32);

const T = Ticket as unknown as {
  create(data: any): Promise<any>;
  findById(id: string): any;
  findOne(filter: Record<string, unknown>): any;
  find(filter: Record<string, unknown>): any;
  findByIdAndUpdate(id: string, data: any, options: any): any;
  findOneAndUpdate(filter: any, update: any, options: any): any;
};

export function generateCode(): string {
  return nanoid();
}

export function generateSecret(ticketId: string, ownerId: string): string {
  const windowSeconds = 30;
  const window = Math.floor(Date.now() / (windowSeconds * 1000));
  return crypto.createHmac("sha256", env.TICKET_HMAC_SECRET).update(`${ticketId}:${ownerId}:${window}`).digest("hex");
}

export async function create(data: any) {
  return (await T.create(data)) as unknown as any;
}

export async function findById(id: string) {
  return (await T.findById(id).lean()) as unknown as any;
}

export async function findByCode(code: string) {
  return (await T.findOne({ code }).lean()) as unknown as any;
}

export async function findByOwnerId(ownerId: string) {
  return (await T.find({ ownerId }).sort({ createdAt: -1 }).lean()) as unknown as any[];
}

export async function findByEventId(eventId: string) {
  return (await T.find({ eventId }).lean()) as unknown as any[];
}

export async function markUsed(ticketId: string, operatorId: string) {
  return (
    await T.findOneAndUpdate(
      { _id: ticketId, status: "valid" },
      { status: "used", usedAt: new Date(), usedBy: operatorId },
      { new: true },
    )
  ) as unknown as any;
}

export async function cancel(ticketId: string) {
  return (await T.findByIdAndUpdate(ticketId, { status: "cancelled" }, { new: true }).lean()) as unknown as any;
}
