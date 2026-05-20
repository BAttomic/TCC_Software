import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TicketFlow",
  description: "Plataforma de venda de ingressos online",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        className="min-h-screen bg-background font-sans antialiased"
        style={{
          "--background": "0 0% 100%",
          "--foreground": "222.2 84% 4.9%",
          "--card": "0 0% 100%",
          "--card-foreground": "222.2 84% 4.9%",
          "--popover": "0 0% 100%",
          "--popover-foreground": "222.2 84% 4.9%",
          "--primary": "221.2 83.2% 53.3%",
          "--primary-foreground": "210 40% 98%",
          "--secondary": "210 40% 96.1%",
          "--secondary-foreground": "222.2 47.4% 11.2%",
          "--muted": "210 40% 96.1%",
          "--muted-foreground": "215.4 16.3% 46.9%",
          "--accent": "210 40% 96.1%",
          "--accent-foreground": "222.2 47.4% 11.2%",
          "--destructive": "0 84.2% 60.2%",
          "--destructive-foreground": "210 40% 98%",
          "--border": "214.3 31.8% 91.4%",
          "--input": "214.3 31.8% 91.4%",
          "--ring": "221.2 83.2% 53.3%",
          "--radius": "0.5rem",
        } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
