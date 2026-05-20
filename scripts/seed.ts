/**
 * Seeds the database with fake data.
 * Run:
 *   npx tsx scripts/seed.ts vicosa
 *   npx tsx scripts/seed.ts brasil
 */
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Event from "@/modules/events/models/event.model";
import Lot from "@/modules/events/models/lot.model";
import TicketType from "@/modules/events/models/ticket-type.model";
import User from "@/modules/identity/models/user.model";

type SeedScenario = "vicosa" | "brasil";
type Role = "admin" | "organizer" | "buyer" | "operator";

type SeedUser = {
  email: string;
  name: string;
  role: Role;
};

type SeedVenue = {
  name: string;
  address: string;
  city: string;
  state: string;
};

type SeedEvent = {
  organizerIndex: number;
  title: string;
  slug: string;
  description: string;
  venue: SeedVenue;
  startsInDays: number;
  durationHours: number;
  status: "published" | "draft";
};

const scenario = normalizeScenario(process.argv[2]);
const SALT = 12;

const U = User as unknown as { insertMany(d: Array<SeedUser & { passwordHash: string }>): Promise<Array<{ _id: { toString(): string } }>>; deleteMany(f: any): Promise<void>; countDocuments(): Promise<number> };
const Ev = Event as unknown as { create(d: Array<unknown>): Promise<void>; deleteMany(f: any): Promise<void>; find(f: any): Promise<Array<{ _id: { toString(): string } }>>; countDocuments(): Promise<number> };
const TT = TicketType as unknown as { create(d: Array<unknown>): Promise<void>; deleteMany(f: any): Promise<void>; find(f: any): Promise<Array<{ _id: { toString(): string }; price: number; totalQuantity: number }>>; countDocuments(): Promise<number> };
const L = Lot as unknown as { create(d: Array<unknown> | Record<string, unknown>): Promise<void>; deleteMany(f: any): Promise<void>; countDocuments(): Promise<number> };

function normalizeScenario(value: string | undefined): SeedScenario {
  return value === "brasil" ? "brasil" : "vicosa";
}

function baseUsers(): SeedUser[] {
  return [
    { email: "admin@ticketflow.com", name: "Admin", role: "admin" },
    { email: "organizer1@ticketflow.com", name: "Organizer One", role: "organizer" },
    { email: "organizer2@ticketflow.com", name: "Organizer Two", role: "organizer" },
    { email: "buyer1@ticketflow.com", name: "Buyer One", role: "buyer" },
    { email: "buyer2@ticketflow.com", name: "Buyer Two", role: "buyer" },
    { email: "buyer3@ticketflow.com", name: "Buyer Three", role: "buyer" },
    { email: "operator@ticketflow.com", name: "Operator One", role: "operator" },
  ];
}

function scenarioEvents(currentScenario: SeedScenario): SeedEvent[] {
  if (currentScenario === "brasil") {
    return [
      { organizerIndex: 1, title: "Festival de Verão Recife", slug: "festival-verao-recife", description: "Shows e atividades culturais na orla pernambucana.", venue: { name: "Parque Dona Lindu", address: "Av. Boa Viagem, 220", city: "Recife", state: "PE" }, startsInDays: 8, durationHours: 6, status: "published" },
      { organizerIndex: 1, title: "Circuito Pop Salvador", slug: "circuito-pop-salvador", description: "Um dia de música pop e atrações ao ar livre.", venue: { name: "Arena Fonte Nova", address: "Ladeira da Fonte das Pedras, 1", city: "Salvador", state: "BA" }, startsInDays: 16, durationHours: 5, status: "draft" },
      { organizerIndex: 2, title: "Expo Tech São Paulo", slug: "expo-tech-sao-paulo", description: "Tecnologia, startups e networking no maior centro financeiro do país.", venue: { name: "Distrito Anhembi", address: "Av. Olavo Fontoura, 1209", city: "São Paulo", state: "SP" }, startsInDays: 24, durationHours: 8, status: "published" },
      { organizerIndex: 2, title: "Feira Criativa Curitiba", slug: "feira-criativa-curitiba", description: "Design, gastronomia e economia criativa no sul.", venue: { name: "Jockey Plaza", address: "Rua Konrad Adenauer, 370", city: "Curitiba", state: "PR" }, startsInDays: 32, durationHours: 7, status: "draft" },
      { organizerIndex: 1, title: "Congresso Inovação Belo Horizonte", slug: "congresso-inovacao-belo-horizonte", description: "Palestras e workshops sobre inovação aplicada.", venue: { name: "Expominas", address: "Av. Amazonas, 6200", city: "Belo Horizonte", state: "MG" }, startsInDays: 40, durationHours: 9, status: "published" },
      { organizerIndex: 2, title: "Noite Cultural Rio de Janeiro", slug: "noite-cultural-rio-de-janeiro", description: "Arte, música e experiência urbana na capital fluminense.", venue: { name: "Vivo Rio", address: "Av. Infante Dom Henrique, 85", city: "Rio de Janeiro", state: "RJ" }, startsInDays: 12, durationHours: 4, status: "draft" },
    ];
  }

  return [
    { organizerIndex: 1, title: "Festival Universitário de Viçosa", slug: "festival-universitario-vicosa", description: "Evento estudantil com música, praça de alimentação e atrações regionais.", venue: { name: "Campus UFV", address: "Avenida Peter Henry Rolfs, s/n", city: "Viçosa", state: "MG" }, startsInDays: 7, durationHours: 6, status: "published" },
    { organizerIndex: 1, title: "Feira Gastronômica da Praça", slug: "feira-gastronomica-da-praca", description: "Comida mineira, cerveja artesanal e programação local.", venue: { name: "Praça Silviano Brandão", address: "Centro", city: "Viçosa", state: "MG" }, startsInDays: 14, durationHours: 5, status: "draft" },
    { organizerIndex: 2, title: "Conferência de Tecnologia de Viçosa", slug: "conferencia-tecnologia-vicosa", description: "Palestras sobre software, IA e empreendedorismo no interior de Minas.", venue: { name: "Espaço Acadêmico UFV", address: "Avenida Peter Henry Rolfs, s/n", city: "Viçosa", state: "MG" }, startsInDays: 21, durationHours: 8, status: "published" },
    { organizerIndex: 2, title: "Corrida Rústica da Serra", slug: "corrida-rustica-da-serra", description: "Prova de rua com percurso pelas áreas verdes da cidade.", venue: { name: "Parque Municipal", address: "Avenida Maria de Paula Santana, s/n", city: "Viçosa", state: "MG" }, startsInDays: 30, durationHours: 4, status: "draft" },
    { organizerIndex: 1, title: "Mostra Cultural Mineira", slug: "mostra-cultural-mineira", description: "Música, teatro e dança com foco em talentos da Zona da Mata.", venue: { name: "Teatro de Viçosa", address: "Rua Virgílio Val, 25", city: "Viçosa", state: "MG" }, startsInDays: 38, durationHours: 4, status: "published" },
    { organizerIndex: 2, title: "Encontro de Startups da Zona da Mata", slug: "encontro-startups-zona-da-mata", description: "Networking entre startups, universidades e investidores locais.", venue: { name: "Centro de Inovação UFV", address: "Avenida Peter Henry Rolfs, s/n", city: "Viçosa", state: "MG" }, startsInDays: 45, durationHours: 5, status: "draft" },
  ];
}

function scenarioLabel(currentScenario: SeedScenario): string {
  return currentScenario === "brasil" ? "Brasil" : "Viçosa";
}

async function seed() {
  await connectDB();
  console.log(`Seeding ${scenarioLabel(scenario)} data...`);

  await U.deleteMany({});
  await Ev.deleteMany({});
  await TT.deleteMany({});
  await L.deleteMany({});

  const passwordHash = await bcrypt.hash("Password123!", SALT);
  const users = await U.insertMany(baseUsers().map((user) => ({ ...user, passwordHash })));

  const now = new Date();
  const eventsToCreate = scenarioEvents(scenario).map((event) => {
    const startsAt = new Date(now);
    startsAt.setDate(startsAt.getDate() + event.startsInDays);
    const organizer = users[event.organizerIndex];

    if (!organizer) {
      throw new Error(`Invalid organizer index for seed event: ${event.title}`);
    }

    return {
      organizerId: organizer._id.toString(),
      title: event.title,
      slug: event.slug,
      description: event.description,
      venue: event.venue,
      startsAt,
      endsAt: new Date(startsAt.getTime() + event.durationHours * 60 * 60 * 1000),
      status: event.status,
    };
  });

  await Ev.create(eventsToCreate);

  const events = await Ev.find({});
  for (const event of events) {
    const eventId = event._id.toString();

    await TT.create([
      { eventId, name: "Inteira", description: "Ingresso inteiro.", price: 5000, totalQuantity: 250, soldQuantity: 0, maxPerOrder: 6 },
      { eventId, name: "Meia-entrada", description: "Ingresso com desconto.", price: 2500, totalQuantity: 120, soldQuantity: 0, maxPerOrder: 5 },
      { eventId, name: "VIP", description: "Área premium com benefícios extras.", price: 15000, totalQuantity: 60, soldQuantity: 0, maxPerOrder: 3 },
    ]);

    const ticketTypes = await TT.find({ eventId });
    for (const ticketType of ticketTypes) {
      await L.create({
        ticketTypeId: ticketType._id.toString(),
        name: scenario === "brasil" ? "Lote Nacional" : "Lote Local",
        price: ticketType.price,
        quantity: ticketType.totalQuantity,
        soldQuantity: 0,
        active: true,
      });
    }
  }

  console.log("Seeded:", await U.countDocuments(), "users", await Ev.countDocuments(), "events", await TT.countDocuments(), "types", await L.countDocuments(), "lots");
  console.log(`Scenario: ${scenarioLabel(scenario)}`);
  console.log("Done.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
