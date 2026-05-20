import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import { deleteEventAction } from "@/server/actions/events.actions";
import { findAll, findByOrganizerId } from "@/modules/events/repositories/event.repository";

export const dynamic = "force-dynamic";

export default async function OrganizerEventsPage() {
  const session = await requireRole(["organizer", "admin"]);
  await connectDB();

  const events = session.user.role === "admin" ? await findAll() : await findByOrganizerId(session.user.id);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Area de gestao</p>
          <h1 className="mt-2 text-3xl font-bold">Eventos</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Crie, edite e remova eventos. Administradores veem tudo; organizadores veem apenas os proprios.</p>
        </div>
        <Button asChild className="bg-amber-400 text-slate-950 hover:bg-amber-300">
          <Link href="/organizer/eventos/novo">Novo evento</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {events.map((event) => (
          <Card key={event._id} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl">{event.title}</CardTitle>
              <CardDescription>
                {event.venue.city} - {event.venue.state} • {event.status}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="line-clamp-2 text-sm text-slate-600">{event.description}</p>
              <p className="text-sm text-slate-700">{format(new Date(event.startsAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href={`/organizer/eventos/${event._id}/editar`}>Editar</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/organizer/eventos/${event._id}/ingressos`}>Ingressos & Lotes</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/organizer/eventos/${event._id}/vendas`}>Analytics</Link>
                </Button>
                <form action={deleteEventAction.bind(null, event._id)}>
                  <Button variant="destructive" type="submit">
                    Excluir
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
          Nenhum evento cadastrado ainda.
        </div>
      ) : null}
    </main>
  );
}