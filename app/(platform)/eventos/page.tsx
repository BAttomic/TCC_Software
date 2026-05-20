import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDB } from "@/lib/db";
import { findPublishedFiltered } from "@/modules/events/repositories/event.repository";

export const dynamic = "force-dynamic";

type EventosPageProps = {
  searchParams: Promise<{
    busca?: string;
    cidade?: string;
  }>;
};

export default async function EventosPage({ searchParams }: EventosPageProps) {
  const params = await searchParams;
  await connectDB();

  const events = await findPublishedFiltered({
    search: params.busca,
    city: params.cidade,
    preferredCity: "Viçosa",
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Eventos</h1>
        <p className="mt-2 text-slate-600">Descubra experiencias ao vivo e garanta seu ingresso.</p>
      </div>

      <form className="mb-8 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <input
          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          name="busca"
          placeholder="Buscar por titulo"
          defaultValue={params.busca ?? ""}
        />
        <input
          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          name="cidade"
          placeholder="Filtrar por cidade"
          defaultValue={params.cidade ?? ""}
        />
        <Button type="submit">Aplicar filtros</Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event._id} className="border-slate-200">
            <CardHeader>
              <CardTitle className="line-clamp-2 text-xl">{event.title}</CardTitle>
              <CardDescription>
                {event.venue.city} - {event.venue.state}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="line-clamp-2 text-sm text-slate-600">{event.description}</p>
              <p className="text-sm font-medium text-slate-800">
                {format(new Date(event.startsAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
              </p>
              <Button asChild className="w-full">
                <Link href={`/eventos/${event.slug}`}>Ver detalhes</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
          Nenhum evento encontrado para os filtros informados.
        </div>
      ) : null}
    </main>
  );
}