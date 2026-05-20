import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">TicketFlow</h1>
      <p className="text-lg text-muted-foreground">
        Plataforma de venda de ingressos
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <a href="/login">Entrar</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/eventos">Ver eventos</a>
        </Button>
      </div>
    </main>
  );
}
