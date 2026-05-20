import { requireRole } from "@/lib/require-role";
import { connectDB } from "@/lib/db";
import { CheckinScanner } from "@/components/shared/checkin-scanner";
import CheckinLog from "@/modules/tickets/models/checkin-log.model";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { QrCode, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const session = await requireRole(["operator", "organizer", "admin"]);
  await connectDB();

  const CL = CheckinLog as unknown as {
    find(filter: Record<string, unknown>): any;
  };

  const recentLogs = await CL.find({ operatorId: session.user.id })
    .sort({ occurredAt: -1 })
    .limit(10)
    .lean();

  const logsWithEvents = await Promise.all(
    (recentLogs as any[]).map(async (log: any) => {
      const event = await findEvent(log.eventId);
      return { ...log, eventTitle: event?.title ?? "Evento desconhecido" };
    }),
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
        <div className="flex items-center gap-3">
          <QrCode className="h-8 w-8 text-amber-400" />
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Operação</p>
            <h1 className="text-3xl font-bold">Check-in de ingressos</h1>
          </div>
        </div>
        <p className="mt-2 text-slate-300">
          Escaneie o QR Code do ingresso do participante para validar a entrada.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-950">Scanner</h2>
          <CheckinScanner />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-bold text-slate-950">Check-ins recentes</h2>
          </div>

          {logsWithEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Nenhum check-in realizado ainda nesta sessão.
            </div>
          ) : (
            <div className="space-y-3">
              {logsWithEvents.map((log: any) => (
                <div key={log._id} className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-emerald-900">{log.eventTitle}</p>
                    <p className="font-mono text-xs text-emerald-700">{String(log.ticketId).slice(-12)}</p>
                  </div>
                  <span className="text-xs text-emerald-600">
                    {format(new Date(log.occurredAt), "HH:mm:ss", { locale: ptBR })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
