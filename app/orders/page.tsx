import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import { findByBuyerId } from "@/modules/orders/repositories/order.repository";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  failed: "Falhou",
  cancelled: "Cancelado",
  expired: "Expirado",
};

export default async function OrdersPage() {
  const session = await requireRole("buyer");
  await connectDB();

  const orders = await findByBuyerId(session.user.id);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Pedidos</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Acompanhe suas compras simuladas</h1>
        <p className="mt-2 text-slate-600">Cada pedido entra como pendente e aprova automaticamente apos 1 minuto.</p>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order._id} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl">Pedido #{order._id.slice(-6)}</CardTitle>
              <CardDescription>
                {statusLabels[order.status] ?? order.status} • {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-600">Total: R$ {(order.totalAmount / 100).toFixed(2).replace(".", ",")}</p>
                <p className="text-sm text-slate-600">Aprovação automática: {order.status === "paid" ? "Concluída" : "Aguardando"}</p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/orders/${order._id}`}>Ver detalhes</Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
            Nenhum pedido ainda. Faça uma compra simulada em um evento.
          </div>
        ) : null}
      </div>
    </main>
  );
}