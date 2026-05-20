import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import { findById } from "@/modules/orders/repositories/order.repository";
import { findByOwnerId } from "@/modules/tickets/repositories/ticket.repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusRefresh } from "@/components/shared/order-status-refresh";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  failed: "Falhou",
  cancelled: "Cancelado",
  expired: "Expirado",
};

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await requireRole("buyer");
  const { id } = await params;
  await connectDB();

  const order = await findById(id);
  if (!order || order.buyerId !== session.user.id) {
    notFound();
  }

  const tickets = await findByOwnerId(session.user.id);
  const orderTickets = tickets.filter((ticket) => ticket.orderId === order._id);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10 sm:px-6">
      <Card className="border-slate-200">
        <OrderStatusRefresh status={order.status} />
        <CardHeader>
          <CardTitle className="text-3xl">Pedido #{order._id.slice(-6)}</CardTitle>
          <CardDescription>
            {statusLabels[order.status] ?? order.status} • {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            <p>Total: R$ {(order.totalAmount / 100).toFixed(2).replace(".", ",")}</p>
            <p>Expira em: {format(new Date(order.expiresAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
            <p>Pagamento simulado: {order.paymentIntentId ?? "-"}</p>
            <p>Pago em: {order.paidAt ? format(new Date(order.paidAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "aguardando"}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-950">Itens</h2>
            <div className="mt-3 space-y-3">
              {order.items.map((item: { ticketTypeId: string; lotId: string; quantity: number; unitPrice: number }, index: number) => (
                <div key={`${item.ticketTypeId}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p>Ticket type: {item.ticketTypeId}</p>
                  <p>Lote: {item.lotId}</p>
                  <p>Quantidade: {item.quantity}</p>
                  <p>Unitario: R$ {(item.unitPrice / 100).toFixed(2).replace(".", ",")}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-950">Ingressos gerados</h2>
            <div className="mt-3 space-y-3">
              {order.status === "paid" ? (
                orderTickets.map((ticket) => (
                  <div key={ticket._id} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <p>Código: {ticket.code}</p>
                    <p>Status: {ticket.status}</p>
                    <p>Secret: {ticket.secret}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                  Os ingressos aparecem aqui depois da aprovação automatica.
                </div>
              )}
            </div>
          </div>

          <Button asChild variant="outline">
            <Link href="/orders">Voltar para pedidos</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}