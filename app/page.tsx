import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Ticket, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDB } from "@/lib/db";
import { findFeaturedPublished } from "@/modules/events/repositories/event.repository";

export const dynamic = "force-dynamic";

function currencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

export default async function HomePage() {
  let highlights = {
    upcoming: [] as Awaited<ReturnType<typeof findFeaturedPublished>>["upcoming"],
    largest: [] as Awaited<ReturnType<typeof findFeaturedPublished>>["largest"],
  };
  let dbUnavailable = false;

  try {
    await connectDB();
    highlights = await findFeaturedPublished(4, "Viçosa");
  } catch {
    dbUnavailable = true;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_10%,_rgba(251,191,36,0.22)_0,_transparent_28%),radial-gradient(circle_at_88%_15%,_rgba(96,165,250,0.18)_0,_transparent_28%),linear-gradient(to_bottom,_#ffffff,_#f8fafc_50%,_#eef2ff)]">
      <section className="mx-auto grid w-full max-w-[96rem] gap-8 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-start lg:pt-16">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-slate-300 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 shadow-sm">
            TicketFlow
          </div>

          <div className="max-w-3xl space-y-5">
            <h1 className="text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Os eventos mais grandes e mais perto de voce, em um so lugar.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-600">
              Uma homepage com cara de marketplace de ingressos: destaque para o que esta bombando, o que vem primeiro e
              um acesso rapido para entrar na sua conta.
            </p>
          </div>

          <form action="/eventos" className="grid gap-3 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-200/70 backdrop-blur sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500" htmlFor="busca">
                Buscar evento
              </label>
              <input id="busca" name="busca" placeholder="Shows, festas, teatro..." className="h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-500" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500" htmlFor="cidade">
                Cidade
              </label>
              <input id="cidade" name="cidade" placeholder="São Paulo, Rio, BH..." className="h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-500" />
            </div>
            <Button className="h-12 self-end rounded-2xl px-6" type="submit">
              Encontrar eventos
            </Button>
          </form>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-amber-200/70 bg-white/85 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays className="h-5 w-5 text-amber-600" />
                  Proximos eventos
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-slate-600">
                Veja o que vem primeiro no calendario e garanta ingresso antes que esgote.
              </CardContent>
            </Card>
            <Card className="border-sky-200/70 bg-white/85 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Ticket className="h-5 w-5 text-sky-600" />
                  Destaques grandes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-slate-600">
                Promoção dos eventos com maior capacidade e maior potencial de publico.
              </CardContent>
            </Card>
            <Card className="border-emerald-200/70 bg-white/85 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Acesso rapido
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-slate-600">
                Entre na sua conta, acompanhe pedidos e veja seus ingressos em segundos.
              </CardContent>
            </Card>
          </div>

          {dbUnavailable ? (
            <Card className="border-amber-200/70 bg-amber-50/90 shadow-sm">
              <CardContent className="p-4 text-sm leading-relaxed text-amber-900">
                Os destaques ainda não estão disponíveis porque a base de dados local não respondeu. A página continua
                funcionando e os eventos reaparecem assim que o MongoDB ficar acessível.
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <section>
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">Mais proximos</h2>
                  <p className="text-sm text-slate-600">Eventos publicados que acontecem primeiro.</p>
                </div>
                <Button asChild variant="ghost" className="text-slate-700">
                  <Link href="/eventos">Ver todos</Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {highlights.upcoming.map((event) => (
                  <Card key={event._id} className="overflow-hidden border-slate-200 bg-white/90 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <div className="h-40 bg-[linear-gradient(135deg,_#1e293b,_#475569_55%,_#cbd5e1)]" />
                    <CardHeader className="space-y-2">
                      <CardTitle className="line-clamp-2 text-xl leading-tight">{event.title}</CardTitle>
                      <p className="text-sm text-slate-500">
                        {event.venue.city} • {format(new Date(event.startsAt), "dd MMM, HH:mm", { locale: ptBR })}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="line-clamp-2 text-sm text-slate-600">{event.description}</p>
                      <Button asChild className="w-full rounded-xl">
                        <Link href={`/eventos/${event.slug}`}>Ver evento</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h2 className="text-2xl font-bold text-slate-950">Maiores eventos</h2>
                <p className="text-sm text-slate-600">Promoções dinamicas com maior volume de ingressos.</p>
              </div>
              <div className="space-y-3">
                {highlights.largest.map((event, index) => (
                  <Card key={event._id} className="border-slate-200 bg-white/90 shadow-sm">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-base font-semibold text-slate-950">{event.title}</p>
                        <p className="text-sm text-slate-600">
                          {event.venue.city} • {event.totalTickets.toLocaleString("pt-BR")} ingressos
                        </p>
                        <p className="text-sm font-medium text-amber-700">A partir de {currencyBRL(0)}</p>
                      </div>
                      <Button asChild variant="outline" className="rounded-xl">
                        <Link href={`/eventos/${event.slug}`}>Abrir</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </div>

        <aside className="lg:sticky lg:top-6">
          <Card className="overflow-hidden border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-300/60">
            <div className="bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22)_0,_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,1),_rgba(30,41,59,1))] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Minha conta</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">Entrar ou criar conta</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Acesse seus pedidos, ingressos e eventos favoritos. Se for novo por aqui, o cadastro leva menos de um minuto.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Button asChild size="lg" className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-2xl border-slate-500 bg-transparent text-white hover:bg-white/10">
                  <Link href="/register">Criar conta</Link>
                </Button>
              </div>
            </div>
            <CardContent className="space-y-4 bg-white p-6 text-slate-700">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">O que voce encontra</p>
                <ul className="mt-3 space-y-3 text-sm leading-relaxed">
                  <li>• Eventos em destaque com selecao por data e volume.</li>
                  <li>• Acesso rapido para login e cadastro.</li>
                  <li>• Direcionamento para compra em poucos cliques.</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-sm font-semibold text-slate-900">Popular agora</p>
                <p className="mt-1 text-sm text-slate-600">Dois blocos dinamicos mostram o que vem primeiro e o que tem maior escala.</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
      <div className="border-t border-slate-200/70 py-6 text-center text-sm text-slate-500">
        TicketFlow 2026 • Plataforma de ingressos online
      </div>
    </main>
  );
}
