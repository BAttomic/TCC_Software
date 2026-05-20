"use client";

import { useState, useCallback } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { CheckCircle, XCircle, Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

type ScanResult = {
  ok: boolean;
  message: string;
  usedAt?: string;
};

type ScannerState = "idle" | "scanning" | "processing" | "success" | "error";

export function CheckinScanner() {
  const [state, setState] = useState<ScannerState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [lastCode, setLastCode] = useState<string | null>(null);

  const handleScan = useCallback(
    async (detectedCodes: { rawValue: string }[]) => {
      if (state !== "scanning") return;
      const raw = detectedCodes[0]?.rawValue;
      if (!raw || raw === lastCode) return;

      let parsed: { code?: string; secret?: string };
      try {
        parsed = JSON.parse(raw);
      } catch {
        setResult({ ok: false, message: "QR Code inválido — não é um ingresso TicketFlow." });
        setState("error");
        return;
      }

      if (!parsed.code || !parsed.secret) {
        setResult({ ok: false, message: "QR Code inválido — campos ausentes." });
        setState("error");
        return;
      }

      setLastCode(raw);
      setState("processing");

      try {
        const response = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: parsed.code, secret: parsed.secret, deviceId: "web-scanner" }),
        });

        const data = (await response.json()) as ScanResult;
        setResult(data);
        setState(data.ok ? "success" : "error");
      } catch {
        setResult({ ok: false, message: "Erro de rede. Verifique sua conexão." });
        setState("error");
      }
    },
    [state, lastCode],
  );

  function reset() {
    setState("scanning");
    setResult(null);
    setLastCode(null);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {state === "idle" && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-48 w-48 items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50">
            <QrCode className="h-16 w-16 text-slate-300" />
          </div>
          <Button size="lg" className="gap-2" onClick={() => setState("scanning")}>
            <QrCode className="h-5 w-5" />
            Iniciar scanner
          </Button>
        </div>
      )}

      {state === "scanning" && (
        <div className="w-full max-w-sm">
          <div className="overflow-hidden rounded-2xl border-2 border-emerald-400 shadow-lg">
            <Scanner
              onScan={handleScan}
              onError={() => {
                setResult({ ok: false, message: "Erro ao acessar câmera. Verifique as permissões." });
                setState("error");
              }}
              styles={{ container: { height: 320 } }}
            />
          </div>
          <p className="mt-3 text-center text-sm text-slate-500">Aponte a câmera para o QR Code do ingresso</p>
          <Button variant="outline" className="mt-3 w-full" onClick={() => setState("idle")}>
            Cancelar
          </Button>
        </div>
      )}

      {state === "processing" && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
          <p className="font-medium text-slate-700">Validando ingresso...</p>
        </div>
      )}

      {(state === "success" || state === "error") && result && (
        <div
          className={`flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border p-8 ${
            result.ok
              ? "border-emerald-200 bg-emerald-50"
              : "border-rose-200 bg-rose-50"
          }`}
        >
          {result.ok ? (
            <CheckCircle className="h-16 w-16 text-emerald-600" />
          ) : (
            <XCircle className="h-16 w-16 text-rose-600" />
          )}
          <p className={`text-center text-lg font-bold ${result.ok ? "text-emerald-800" : "text-rose-800"}`}>
            {result.message}
          </p>
          {result.usedAt && (
            <p className="text-center text-sm text-rose-600">
              Utilizado em: {new Date(result.usedAt).toLocaleString("pt-BR")}
            </p>
          )}
          <Button onClick={reset} className={`mt-2 w-full ${result.ok ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"} text-white`}>
            Escanear próximo
          </Button>
        </div>
      )}
    </div>
  );
}
