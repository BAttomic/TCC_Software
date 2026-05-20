import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDB } from "@/lib/db";
import { findBySlug } from "@/modules/events/repositories/event.repository";
import { findByEventId } from "@/modules/events/repositories/ticket-type.repository";
import { findActiveByTicketTypeId } from "@/modules/events/repositories/lot.repository";

export const dynamic = "force-dynamic";

type EventDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { slug } = await params;
  await connectDB();

  const event = await findBySlug(slug);
  if (!event) {
    notFound();
  }

  const ticketTypes = await findByEventId(event._id);
  const options: Array<{ id: string; name: string; price: number; available: number }> = [];
  for (const ticketType of ticketTypes) {
    const lot = (await findActiveByTicketTypeId(ticketType._id))[0];
    if (!lot) {
      continue;
    }

    options.push({
      id: ticketType._id,
      name: ticketType.name,
      price: lot.price ?? ticketType.price,
      available: Math.max(0, Math.min(ticketType.totalQuantity - ticketType.soldQuantity, lot.quantity - lot.soldQuantity)),
    });
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10 sm:px-6">
      <Card className="overflow-hidden border-slate-200">
        <div className="h-52 bg-gradient-to-br from-amber-200 via-rose-200 to-sky-200" />
        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl leading-tight">{event.title}</CardTitle>
          <p className="text-slate-600">{event.description}</p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <p>
            <strong>Local:</strong> {event.venue.name}, {event.venue.address}, {event.venue.city} - {event.venue.state}
          </p>
          <p>
            <strong>Data:</strong> {format(new Date(event.startsAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
          </p>

          <div className="flex flex-wrap gap-3 pt-3">
            <Button asChild>
              <Link href={`/eventos/${event.slug}/checkout`}>Comprar ingressos</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/eventos">Voltar para eventos</Link>
            </Button>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-lg font-semibold text-slate-950">Ingressos e lotes</h2>
            <div className="mt-4 space-y-3">
              {options.map((option) => (
                <div key={option.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{option.name}</p>
                    <p className="text-sm text-slate-600">Disponiveis: {option.available}</p>
                  </div>
                  <p className="font-semibold text-slate-900">R$ {(option.price / 100).toFixed(2).replace(".", ",")}</p>
                </div>
              ))}
              {options.length === 0 ? <p className="text-sm text-slate-600">Ainda nao ha ingressos ativos para compra.</p> : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
