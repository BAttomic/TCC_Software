"use server";

import crypto from "crypto";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ConflictError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { redirect } from "next/navigation";
import { EventStatus } from "@/modules/events/models/event.model";
import TicketType from "@/modules/events/models/ticket-type.model";
import Lot from "@/modules/events/models/lot.model";
import { create as createEvent, deleteById as deleteEventById, findById, findBySlug, update as updateEvent, generateSlug } from "@/modules/events/repositories/event.repository";
import Order from "@/modules/orders/models/order.model";
import Ticket from "@/modules/tickets/models/ticket.model";
import CheckinLog from "@/modules/tickets/models/checkin-log.model";
import { create as createTicket, generateCode, generateSecret } from "@/modules/tickets/repositories/ticket.repository";
import { z } from "zod";

export type ActionState = {
  ok: boolean;
  message: string;
  redirectTo?: string;
  orderId?: string;
};

const EventFormSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(1).max(200).optional().or(z.literal("")),
  description: z.string().min(10),
  venueName: z.string().min(2),
  venueAddress: z.string().min(5),
  venueCity: z.string().min(2),
  venueState: z.string().length(2),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  coverImageUrl: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "cancelled", "finished"]),
});

const PurchaseFormSchema = z.object({
  ticketTypeId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});

const pendingApprovals = new Map<string, NodeJS.Timeout>();

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function serializeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Nao foi possivel concluir a operacao.";
}

async function getAuthorizedEvent(eventId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError("Voce precisa estar autenticado.");
  }

  const event = await findById(eventId);
  if (!event) {
    throw new NotFoundError("Event", eventId);
  }

  if (session.user.role !== "admin" && event.organizerId !== session.user.id) {
    throw new UnauthorizedError("Voce nao tem permissao para este evento.");
  }

  return { session, event };
}

async function removeEventCascade(eventId: string) {
  const ticketTypeModel = TicketType as unknown as {
    find(filter: Record<string, unknown>): any;
    deleteMany(filter: Record<string, unknown>): Promise<unknown>;
  };
  const lotModel = Lot as unknown as {
    deleteMany(filter: Record<string, unknown>): Promise<unknown>;
  };
  const ticketTypes = (await ticketTypeModel.find({ eventId }).lean()) as Array<{ _id: string }>;
  const ticketTypeIds = ticketTypes.map((ticketType) => ticketType._id.toString());

  await Promise.all([
    ticketTypeModel.deleteMany({ eventId }),
    lotModel.deleteMany({ ticketTypeId: { $in: ticketTypeIds } }),
    Order.deleteMany({ eventId }),
    Ticket.deleteMany({ eventId }),
    CheckinLog.deleteMany({ eventId }),
  ]);

  await deleteEventById(eventId);
}

async function fulfillPaidOrder(orderId: string) {
  await connectDB();

  const orderModel = Order as unknown as {
    findById(id: string): any;
    findByIdAndUpdate(id: string, data: Record<string, unknown>, options: Record<string, unknown>): any;
  };

  const order = await orderModel.findById(orderId).lean();
  if (!order || order.status !== "pending") {
    return;
  }

  const orderItems = order.items as Array<{ ticketTypeId: string; lotId: string; quantity: number; unitPrice: number }>;
  const ticketTypeModel = TicketType as unknown as {
    findById(id: string): any;
    findOneAndUpdate(filter: Record<string, unknown>, update: Record<string, unknown>, options: Record<string, unknown>): any;
  };
  const lotModel = Lot as unknown as {
    findById(id: string): any;
    findOneAndUpdate(filter: Record<string, unknown>, update: Record<string, unknown>, options: Record<string, unknown>): any;
  };

  for (const item of orderItems) {
    const ticketType = await ticketTypeModel.findById(item.ticketTypeId).lean();
    const lot = await lotModel.findById(item.lotId).lean();
    if (!ticketType || !lot) {
      continue;
    }

    const nextTicketSold = Number(ticketType.soldQuantity ?? 0) + item.quantity;
    const nextLotSold = Number(lot.soldQuantity ?? 0) + item.quantity;

    await Promise.all([
      ticketTypeModel.findOneAndUpdate(
        { _id: item.ticketTypeId },
        { $set: { soldQuantity: nextTicketSold } },
        { new: true },
      ),
      lotModel.findOneAndUpdate(
        { _id: item.lotId },
        { $set: { soldQuantity: nextLotSold } },
        { new: true },
      ),
    ]);
  }

  const [freshOrder] = (await Promise.all([
    orderModel.findById(orderId).lean(),
    orderModel.findByIdAndUpdate(orderId, { status: "paid", paidAt: new Date() }, { new: true }).lean(),
  ])) as Array<any>;

  const paidOrder = freshOrder?.status === "paid" ? freshOrder : await orderModel.findById(orderId).lean();
  if (!paidOrder) {
    return;
  }

  const paidItems = paidOrder.items as Array<{ ticketTypeId: string; lotId: string; quantity: number; unitPrice: number }>;
  for (const item of paidItems) {
    for (let index = 0; index < item.quantity; index += 1) {
      const code = generateCode();
      await createTicket({
        orderId: paidOrder._id,
        eventId: paidOrder.eventId,
        ticketTypeId: item.ticketTypeId,
        ownerId: paidOrder.buyerId,
        code,
        secret: generateSecret(code, paidOrder.buyerId),
        status: "valid",
      });
    }
  }
}

function scheduleAutoApproval(orderId: string) {
  const existing = pendingApprovals.get(orderId);
  if (existing) {
    clearTimeout(existing);
  }

  const timeout = setTimeout(() => {
    void fulfillPaidOrder(orderId).finally(() => {
      pendingApprovals.delete(orderId);
    });
  }, 60_000);

  pendingApprovals.set(orderId, timeout);
}

export async function createEventAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await auth();
    if (!session?.user || !["organizer", "admin"].includes(session.user.role)) {
      throw new UnauthorizedError("Apenas organizadores e administradores podem criar eventos.");
    }

    const parsed = EventFormSchema.safeParse({
      title: getString(formData, "title"),
      slug: getString(formData, "slug"),
      description: getString(formData, "description"),
      venueName: getString(formData, "venueName"),
      venueAddress: getString(formData, "venueAddress"),
      venueCity: getString(formData, "venueCity"),
      venueState: getString(formData, "venueState").toUpperCase(),
      startsAt: getString(formData, "startsAt"),
      endsAt: getString(formData, "endsAt"),
      coverImageUrl: getString(formData, "coverImageUrl"),
      status: getString(formData, "status"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados invalidos para o evento.");
    }

    const startsAt = new Date(parsed.data.startsAt);
    const endsAt = new Date(parsed.data.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new Error("Informe datas validas para inicio e termino.");
    }

    if (endsAt <= startsAt) {
      throw new Error("A data de termino precisa ser posterior ao inicio.");
    }

    await connectDB();

    const title = parsed.data.title.trim();
    const slug = parsed.data.slug ? parsed.data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-") : await generateSlug(title);

    const existing = await findBySlug(slug);
    if (existing) {
      throw new ConflictError("Ja existe um evento com esse slug.");
    }

    const event = await createEvent({
      organizerId: session.user.id,
      title,
      slug,
      description: parsed.data.description.trim(),
      venue: {
        name: parsed.data.venueName.trim(),
        address: parsed.data.venueAddress.trim(),
        city: parsed.data.venueCity.trim(),
        state: parsed.data.venueState,
      },
      startsAt,
      endsAt,
      coverImageUrl: parsed.data.coverImageUrl?.trim() || undefined,
      status: parsed.data.status as EventStatus,
    });

    return { ok: true, message: "Evento criado com sucesso.", redirectTo: "/organizer/eventos", orderId: event._id };
  } catch (error) {
    return { ok: false, message: serializeError(error) };
  }
}

export async function updateEventAction(eventId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { event } = await getAuthorizedEvent(eventId);

    const parsed = EventFormSchema.safeParse({
      title: getString(formData, "title"),
      slug: getString(formData, "slug"),
      description: getString(formData, "description"),
      venueName: getString(formData, "venueName"),
      venueAddress: getString(formData, "venueAddress"),
      venueCity: getString(formData, "venueCity"),
      venueState: getString(formData, "venueState").toUpperCase(),
      startsAt: getString(formData, "startsAt"),
      endsAt: getString(formData, "endsAt"),
      coverImageUrl: getString(formData, "coverImageUrl"),
      status: getString(formData, "status"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados invalidos para o evento.");
    }

    const startsAt = new Date(parsed.data.startsAt);
    const endsAt = new Date(parsed.data.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new Error("Informe datas validas para inicio e termino.");
    }

    if (endsAt <= startsAt) {
      throw new Error("A data de termino precisa ser posterior ao inicio.");
    }

    await connectDB();

    const title = parsed.data.title.trim();
    const nextSlug = parsed.data.slug ? parsed.data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-") : event.slug;

    if (nextSlug !== event.slug) {
      const duplicate = await findBySlug(nextSlug);
      if (duplicate && duplicate._id !== event._id) {
        throw new ConflictError("Ja existe um evento com esse slug.");
      }
    }

    await updateEvent(eventId, {
      title,
      slug: nextSlug,
      description: parsed.data.description.trim(),
      venue: {
        name: parsed.data.venueName.trim(),
        address: parsed.data.venueAddress.trim(),
        city: parsed.data.venueCity.trim(),
        state: parsed.data.venueState,
      },
      startsAt,
      endsAt,
      coverImageUrl: parsed.data.coverImageUrl?.trim() || undefined,
      status: parsed.data.status as EventStatus,
    });

    return { ok: true, message: "Evento atualizado com sucesso.", redirectTo: "/organizer/eventos" };
  } catch (error) {
    return { ok: false, message: serializeError(error) };
  }
}

export async function deleteEventAction(eventId: string): Promise<void> {
  await getAuthorizedEvent(eventId);
  await connectDB();
  await removeEventCascade(eventId);
  redirect("/organizer/eventos");
}

export async function createCheckoutAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new UnauthorizedError("Entre para testar o pagamento prototipo.");
    }

    await connectDB();

    const ticketTypeModel = TicketType as unknown as {
      findById(id: string): any;
      findOne(filter: Record<string, unknown>): any;
    };
    const lotModel = Lot as unknown as {
      findOne(filter: Record<string, unknown>): any;
    };

    const parsed = PurchaseFormSchema.safeParse({
      ticketTypeId: getString(formData, "ticketTypeId"),
      quantity: getString(formData, "quantity"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados invalidos para a compra.");
    }

    const ticketType = await ticketTypeModel.findById(parsed.data.ticketTypeId).lean();
    if (!ticketType) {
      throw new NotFoundError("TicketType", parsed.data.ticketTypeId);
    }

    const event = await findById(ticketType.eventId);
    if (!event) {
      throw new NotFoundError("Event", ticketType.eventId);
    }

    const lot = await lotModel.findOne({ ticketTypeId: ticketType._id, active: true }).sort({ createdAt: -1 }).lean();
    if (!lot) {
      throw new Error("Nao existe lote ativo para este ingresso.");
    }

    const totalSold = Number(ticketType.soldQuantity ?? 0) + Number(parsed.data.quantity);
    if (totalSold > Number(ticketType.totalQuantity)) {
      throw new Error("Quantidade indisponivel para este ingresso.");
    }

    if (parsed.data.quantity > Number(ticketType.maxPerOrder ?? 5)) {
      throw new Error("Quantidade acima do limite por pedido.");
    }

    const unitPrice = Number(lot.price ?? ticketType.price);
    const totalAmount = unitPrice * parsed.data.quantity;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const order = await Order.create({
      buyerId: session.user.id,
      eventId: event._id,
      items: [
        {
          ticketTypeId: ticketType._id,
          lotId: lot._id,
          quantity: parsed.data.quantity,
          unitPrice,
        },
      ],
      totalAmount,
      status: "pending",
      paymentIntentId: `proto_${crypto.randomUUID()}`,
      expiresAt,
    });

    scheduleAutoApproval(order._id.toString());

    return {
      ok: true,
      message: "Compra simulada criada. O pedido sera aprovado automaticamente em 1 minuto.",
      orderId: order._id.toString(),
      redirectTo: `/eventos/${event.slug}/checkout`,
    };
  } catch (error) {
    return { ok: false, message: serializeError(error) };
  }
}