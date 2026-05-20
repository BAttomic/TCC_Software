import Link from "next/link";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import { findByOwnerId } from "@/modules/tickets/repositories/ticket.repository";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, QrCode } from "lucide-react";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  valid: "Válido",
  used: "Utilizado",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  valid: "border-emerald-200 bg-emerald-50 text-emerald-800",
  used: "border-slate-200 bg-slate-50 text-slate-600",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

export default async function TicketsPage() {
  const session = await requireRole("buyer");
  await connectDB();

  const tickets = await findByOwnerId(session.user.id);

  const ticketsWithEvents = await Promise.all(
    tickets.map(async (ticket: any) => {
      const event = await findEvent(ticket.eventId);
      return { ...ticket, event };
    }),
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6">
        <div className="flex items-center gap-3">
          <Ticket className="h-8 w-8 text-amber-500" />
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Minha carteira</p>
            <h1 className="text-3xl font-bold text-slate-950">Meus ingressos</h1>
          </div>
        </div>
        <p className="mt-2 text-slate-600">Apresente o QR Code na entrada do evento. Ele se renova a cada 30 segundos.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ticketsWithEvents.map((ticket: any) => (
          <Card key={ticket._id} className={`border ${ticket.status === "valid" ? "border-emerald-200" : "border-slate-200"}`}>
            <CardHeader className="pb-3">
              <CardTitle className="line-clamp-1 text-lg">{ticket.event?.title ?? "Evento"}</CardTitle>
              <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[ticket.status] ?? ""}`}>
                {statusLabels[ticket.status] ?? ticket.status}
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-500 font-mono break-all">{ticket.code}</p>
              {ticket.status === "valid" ? (
                <Button asChild className="w-full gap-2">
                  <Link href={`/tickets/${ticket.code}`}>
                    <QrCode className="h-4 w-4" />
                    Abrir QR Code
                  </Link>
                </Button>
              ) : (
                <p className="text-sm text-slate-500">
                  {ticket.status === "used" && ticket.usedAt
                    ? `Utilizado em ${new Date(ticket.usedAt).toLocaleString("pt-BR")}`
                    : "Ingresso não disponível"}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {ticketsWithEvents.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Ticket className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-lg font-medium text-slate-700">Nenhum ingresso ainda</p>
          <p className="mt-1 text-sm text-slate-500">Compre ingressos para um evento e eles aparecerão aqui.</p>
          <Button asChild className="mt-6">
            <Link href="/eventos">Ver eventos</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
