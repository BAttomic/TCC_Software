import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDB } from "@/lib/db";
import { findBySlug } from "@/modules/events/repositories/event.repository";

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
              <Link href="/login">Entrar para comprar</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/eventos">Voltar para eventos</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
