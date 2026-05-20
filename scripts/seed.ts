/**
 * Seeds the database with demo users and events.
 * Run: npx tsx scripts/seed.ts
 */
import { connectDB } from "@/lib/db";
import User from "@/modules/identity/models/user.model";
import Event from "@/modules/events/models/event.model";
import TicketType from "@/modules/events/models/ticket-type.model";
import Lot from "@/modules/events/models/lot.model";
import bcrypt from "bcryptjs";

const U = User as unknown as { insertMany(d: any[]): Promise<any[]>; deleteMany(f: any): Promise<void>; countDocuments(): Promise<number> };
const Ev = Event as unknown as { create(d: any[]): Promise<void>; deleteMany(f: any): Promise<void>; find(f: any): any; countDocuments(): Promise<number> };
const TT = TicketType as unknown as { create(d: any[]): Promise<void>; deleteMany(f: any): Promise<void>; countDocuments(): Promise<number>; find(f: any): any };
const L = Lot as unknown as { create(d: any): Promise<void>; deleteMany(f: any): Promise<void>; countDocuments(): Promise<number> };

const SALT = 12;

async function seed() {
  await connectDB();
  console.log("Seeding...");
  await U.deleteMany({});
  await Ev.deleteMany({});
  await TT.deleteMany({});
  await L.deleteMany({});

  const pw = await bcrypt.hash("Password123!", SALT);
  const users = await U.insertMany([
    { email: "admin@ticketflow.com", passwordHash: pw, name: "Admin", role: "admin" },
    { email: "organizer1@ticketflow.com", passwordHash: pw, name: "Organizer One", role: "organizer" },
    { email: "organizer2@ticketflow.com", passwordHash: pw, name: "Organizer Two", role: "organizer" },
    { email: "buyer1@ticketflow.com", passwordHash: pw, name: "Buyer One", role: "buyer" },
    { email: "buyer2@ticketflow.com", passwordHash: pw, name: "Buyer Two", role: "buyer" },
    { email: "buyer3@ticketflow.com", passwordHash: pw, name: "Buyer Three", role: "buyer" },
    { email: "operator@ticketflow.com", passwordHash: pw, name: "Operator One", role: "operator" },
  ]);

  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now); nextWeek.setDate(nextWeek.getDate() + 7);
  const nextMonth = new Date(now); nextMonth.setDate(nextMonth.getDate() + 30);
  const twoMonths = new Date(now); twoMonths.setDate(twoMonths.getDate() + 60);

  await Ev.create([
    { organizerId: users[1]._id.toString(), title: "Show de Rock Nacional", slug: "show-rock-nacional", description: "Os melhores bandas de rock nacional.", venue: { name: "Arena JK", address: "Av. Pedro Leopoldo, 1000", city: "Belo Horizonte", state: "MG" }, startsAt: nextWeek, endsAt: new Date(nextWeek.getTime() + 5 * 3600000), status: "published" },
    { organizerId: users[1]._id.toString(), title: "Festival de Música Eletrônica", slug: "festival-musica-eletronica", description: "3 dias de música eletrônica.", venue: { name: "Parque Municipal", address: "Rua da Bahia, 500", city: "Rio de Janeiro", state: "RJ" }, startsAt: nextMonth, endsAt: new Date(nextMonth.getTime() + 3 * 86400000), status: "published" },
    { organizerId: users[2]._id.toString(), title: "Workshop de Tecnologia 2025", slug: "workshop-tecnologia-2025", description: "Workshop sobre IA, blockchain e web3.", venue: { name: "Centro de Convenções", address: "Av. Paulista, 1000", city: "São Paulo", state: "SP" }, startsAt: twoMonths, endsAt: new Date(twoMonths.getTime() + 2 * 86400000), status: "published" },
    { organizerId: users[2]._id.toString(), title: "Teatro Comédia Online", slug: "teatro-comedia-online", description: "Peça de teatro com humor inteligente.", venue: { name: "Teatro Municipal", address: "Rua Augusta, 200", city: "Curitiba", state: "PR" }, startsAt: tomorrow, endsAt: new Date(tomorrow.getTime() + 3 * 3600000), status: "published" },
  ]);

  const allEv = await Ev.find({});
  for (const ev of allEv) {
    const eid = ev._id.toString();
    await TT.create([
      { eventId: eid, name: "Inteira", description: "Ingresso de inteira.", price: 5000, totalQuantity: 200, soldQuantity: 0, maxPerOrder: 5 },
      { eventId: eid, name: "Meia-entrada", description: "Estudantes.", price: 2500, totalQuantity: 100, soldQuantity: 0, maxPerOrder: 5 },
      { eventId: eid, name: "VIP", description: "Área premium.", price: 15000, totalQuantity: 50, soldQuantity: 0, maxPerOrder: 3 },
    ]);
    const tts = await TT.find({ eventId: eid });
    for (const tt of tts) {
      await L.create({ ticketTypeId: tt._id.toString(), name: "Pré-venda", price: tt.price, quantity: tt.totalQuantity, soldQuantity: 0, active: true });
    }
  }

  console.log("Seeded:", await U.countDocuments(), "users", await Ev.countDocuments(), "events", await TT.countDocuments(), "types", await L.countDocuments(), "lots");
  console.log("Done.");
}

seed().catch((e) => { console.error(e); process.exit(1); });
