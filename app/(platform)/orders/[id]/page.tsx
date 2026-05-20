import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import { findById } from "@/modules/orders/repositories/order.repository";
import { OrderStatusRefresh } from "@/components/shared/order-status-refresh";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  const { id } = await params;
  const session = await requireRole("buyer");
  await connectDB();

  const order = await findById(id);

  if (!order || order.buyerId.toString() !== session.user.id) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <OrderStatusRefresh orderId={order._id} status={order.status} />

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl">Pedido #{order._id.slice(-6)}</CardTitle>
          <CardDescription>
            {statusLabels[order.status] ?? order.status} • {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Resumo</p>
            <p className="mt-2 text-sm text-slate-700">Total: R$ {(order.totalAmount / 100).toFixed(2).replace(".", ",")}</p>
            <p className="text-sm text-slate-700">Aprovação automática em 1 minuto: {order.status === "paid" ? "Concluída" : "Em andamento"}</p>
          </div>

          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Ingressos</p>
            {order.items.map((item: (typeof order.items)[number]) => (
              <div key={item.ticketTypeId.toString()} className="rounded-xl border border-slate-200 p-4">
                <p className="font-medium text-slate-950">{item.eventName}</p>
                <p className="text-sm text-slate-600">{item.ticketTypeName} • Quantidade: {item.quantity}</p>
                <p className="text-sm text-slate-600">Subtotal: R$ {(item.subtotal / 100).toFixed(2).replace(".", ",")}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Tickets gerados</p>
            {order.tickets?.length ? (
              order.tickets.map((ticket: (typeof order.tickets)[number]) => (
                <div key={ticket._id.toString()} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
                  <p>Codigo: {ticket.code}</p>
                  <p>Status: {ticket.status}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">Os tickets aparecem assim que o pedido for aprovado.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}