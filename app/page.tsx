import Link from "next/link";
import { CalendarDays, Ticket, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_10%,_#fde68a_0,_transparent_35%),radial-gradient(circle_at_85%_20%,_#bfdbfe_0,_transparent_40%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-10 pt-16 sm:px-6 lg:pt-24">
        <div className="max-w-3xl space-y-5">
          <span className="inline-flex rounded-full border border-slate-300 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            TicketFlow
          </span>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            Venda e compre ingressos com velocidade e seguranca.
          </h1>
          <p className="text-lg leading-relaxed text-slate-600">
            Uma plataforma completa para organizadores e compradores, com checkout fluido e validacao por QR dinamico.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/eventos">Explorar eventos</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Entrar na conta</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-amber-200/70 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-5 w-5 text-amber-600" />
                Eventos vivos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Descubra eventos por cidade, data e tema com busca instantanea.
            </CardContent>
          </Card>
          <Card className="border-sky-200/70 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Ticket className="h-5 w-5 text-sky-600" />
                Checkout simplificado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Compre em poucos cliques e receba seus ingressos digitais imediatamente.
            </CardContent>
          </Card>
          <Card className="border-emerald-200/70 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Validacao segura
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              QR dinamico com rotacao para reduzir fraude e acelerar check-in.
            </CardContent>
          </Card>
        </div>
      </section>
      <div className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        TicketFlow 2026 • Plataforma de ingressos online
      </div>
    </main>
  );
}
