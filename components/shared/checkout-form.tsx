"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/server/actions/events.actions";
import { Button } from "@/components/ui/button";

type TicketOption = {
  id: string;
  name: string;
  description?: string;
  price: number;
  maxPerOrder: number;
  quantityLeft: number;
  lotName?: string;
};

type CheckoutFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  options: TicketOption[];
};

const initialState: ActionState = { ok: false, message: "" };

export function CheckoutForm({ action, options }: CheckoutFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      router.refresh();
    }
  }, [router, state.ok, state.redirectTo]);

  if (options.length === 0) {
    return <p className="text-sm text-slate-600">Nao ha ingressos ativos para este evento.</p>;
  }

  return (
    <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" action={formAction}>
      {state.message ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}
        >
          {state.message}
          {state.orderId ? <div className="mt-1 text-xs">Pedido: {state.orderId}</div> : null}
        </div>
      ) : null}

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="ticketTypeId">
          Tipo de ingresso
        </label>
        <select id="ticketTypeId" name="ticketTypeId" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name} - R$ {(option.price / 100).toFixed(2).replace(".", ",")}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="quantity">
            Quantidade
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            max="20"
            defaultValue={1}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="flex items-center rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-700">
          O pedido sera aprovado automaticamente em 1 minuto.
        </div>
      </div>

      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Processando..." : "Gerar pedido prototipo"}
      </Button>
    </form>
  );
}