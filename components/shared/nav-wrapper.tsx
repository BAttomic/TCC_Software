import { auth } from "@/lib/auth";
import { Nav } from "./nav";

export async function NavWrapper() {
  const session = await auth();
  if (!session?.user) return null;

  return <Nav role={session.user.role as "buyer" | "organizer" | "operator" | "admin"} name={session.user.name ?? session.user.email ?? ""} />;
}
