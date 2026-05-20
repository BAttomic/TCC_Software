"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Ticket, ShoppingBag, CalendarDays, Users, QrCode, User, LogOut } from "lucide-react";

type NavProps = {
  role: "buyer" | "organizer" | "operator" | "admin";
  name: string;
};

const buyerLinks = [
  { href: "/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/tickets", label: "Meus ingressos", icon: Ticket },
  { href: "/orders", label: "Pedidos", icon: ShoppingBag },
  { href: "/perfil", label: "Meu perfil", icon: User },
];

const organizerLinks = [
  { href: "/organizer/eventos", label: "Meus eventos", icon: CalendarDays },
  { href: "/eventos", label: "Explorar", icon: ShoppingBag },
];

const operatorLinks = [
  { href: "/checkin", label: "Check-in", icon: QrCode },
];

const adminLinks = [
  { href: "/organizer/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/checkin", label: "Check-in", icon: QrCode },
];

function getLinks(role: NavProps["role"]) {
  if (role === "admin") return adminLinks;
  if (role === "organizer") return organizerLinks;
  if (role === "operator") return operatorLinks;
  return buyerLinks;
}

export function Nav({ role, name }: NavProps) {
  const pathname = usePathname();
  const links = getLinks(role);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[96rem] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-black tracking-tight text-slate-950">
            <Ticket className="h-5 w-5 text-amber-500" />
            TicketFlow
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname.startsWith(href)
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-500 sm:block">
            {name} • <span className="font-medium capitalize">{role}</span>
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
