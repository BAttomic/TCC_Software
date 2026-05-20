/**
 * Seeds the database with fake data.
 * Run:
 *   npx tsx scripts/seed.ts vicosa
 *   npx tsx scripts/seed.ts brasil
 */
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
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

for (const envFile of [".env.local", ".env", ".env.example"]) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

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
      { organizerIndex: 1, title: "Carnaval do Rio de Janeiro", slug: "carnaval-rio-de-janeiro", description: "O maior desfile de escolas de samba do planeta na Sapucaí.", venue: { name: "Sambódromo Marquês de Sapucaí", address: "R. Marquês de Sapucaí, s/n", city: "Rio de Janeiro", state: "RJ" }, startsInDays: 8, durationHours: 8, status: "published" },
      { organizerIndex: 2, title: "Réveillon de Copacabana", slug: "reveillon-copacabana", description: "Uma das maiores queimas de fogos do mundo na orla carioca.", venue: { name: "Praia de Copacabana", address: "Av. Atlântica, s/n", city: "Rio de Janeiro", state: "RJ" }, startsInDays: 16, durationHours: 6, status: "published" },
      { organizerIndex: 1, title: "Rock in Rio", slug: "rock-in-rio", description: "Um dos maiores festivais de música do cenário global.", venue: { name: "Parque Olímpico", address: "Av. Embaixador Abelardo Bueno, s/n", city: "Rio de Janeiro", state: "RJ" }, startsInDays: 24, durationHours: 10, status: "published" },
      { organizerIndex: 2, title: "Lollapalooza Brasil", slug: "lollapalooza-brasil", description: "Festival gigante de música alternativa e pop no Autódromo de Interlagos.", venue: { name: "Autódromo de Interlagos", address: "Av. Sen. Teotônio Vilela, 261", city: "São Paulo", state: "SP" }, startsInDays: 32, durationHours: 10, status: "published" },
      { organizerIndex: 1, title: "Parada do Orgulho LGBT+ de São Paulo", slug: "parada-orgulho-lgbt-sao-paulo", description: "Uma das maiores manifestações do gênero no mundo.", venue: { name: "Avenida Paulista", address: "Av. Paulista, s/n", city: "São Paulo", state: "SP" }, startsInDays: 40, durationHours: 7, status: "published" },
      { organizerIndex: 2, title: "GP de Fórmula 1 de São Paulo", slug: "gp-formula-1-sao-paulo", description: "O principal evento automobilístico da América Latina.", venue: { name: "Autódromo de Interlagos", address: "Av. Sen. Teotônio Vilela, 261", city: "São Paulo", state: "SP" }, startsInDays: 48, durationHours: 8, status: "published" },
      { organizerIndex: 1, title: "Festa do Peão de Barretos", slug: "festa-peao-barretos", description: "O maior rodeio da América Latina, atraindo milhões de fãs da cultura sertaneja.", venue: { name: "Parque do Peão", address: "Rod. Brigadeiro Faria Lima, km 428", city: "Barretos", state: "SP" }, startsInDays: 56, durationHours: 9, status: "published" },
      { organizerIndex: 2, title: "Carnaval Universitário de Ouro Preto", slug: "carnaval-universitario-ouro-preto", description: "Famoso pelas festas organizadas pelas tradicionais repúblicas estudantis.", venue: { name: "Centro Histórico", address: "Centro", city: "Ouro Preto", state: "MG" }, startsInDays: 64, durationHours: 8, status: "published" },
      { organizerIndex: 1, title: "Festival de Inverno de Ouro Preto", slug: "festival-inverno-ouro-preto", description: "Evento cultural marcante com artes cênicas, artes visuais e muita música.", venue: { name: "Praça Tiradentes", address: "Praça Tiradentes, s/n", city: "Ouro Preto", state: "MG" }, startsInDays: 72, durationHours: 8, status: "draft" },
      { organizerIndex: 2, title: "Festival Internacional de Inverno de Campos do Jordão", slug: "festival-internacional-inverno-campos-do-jordao", description: "O maior e mais importante festival de música clássica da América Latina.", venue: { name: "Parque Capivari", address: "Av. Emílio Ribas, 500", city: "Campos do Jordão", state: "SP" }, startsInDays: 80, durationHours: 9, status: "published" },
      { organizerIndex: 1, title: "FLIP - Festa Literária Internacional de Paraty", slug: "flip-paraty", description: "Principal evento literário do país, reunindo autores do mundo todo.", venue: { name: "Centro Histórico de Paraty", address: "Centro Histórico", city: "Paraty", state: "RJ" }, startsInDays: 88, durationHours: 6, status: "published" },
      { organizerIndex: 2, title: "Festival da Cachaça de Paraty", slug: "festival-cachaca-paraty", description: "Celebração tradicional da produção artesanal local.", venue: { name: "Casa da Cultura de Paraty", address: "R. Dona Geralda, 194", city: "Paraty", state: "RJ" }, startsInDays: 96, durationHours: 5, status: "draft" },
      { organizerIndex: 1, title: "Tomorrowland Brasil", slug: "tomorrowland-brasil", description: "A edição brasileira do festival de música eletrônica mais famoso do mundo.", venue: { name: "Parque Ecológico Indaiatuba", address: "Av. Eng. Fábio Roberto Barnabé, s/n", city: "Indaiatuba", state: "SP" }, startsInDays: 104, durationHours: 10, status: "published" },
      { organizerIndex: 2, title: "HackTown Santa Rita do Sapucaí", slug: "hacktown-santa-rita-do-sapucai", description: "Festival de inovação, tecnologia e música que transforma a cidade no Vale do Silício brasileiro.", venue: { name: "Centro de Santa Rita do Sapucaí", address: "Centro", city: "Santa Rita do Sapucaí", state: "MG" }, startsInDays: 112, durationHours: 8, status: "published" },
      { organizerIndex: 1, title: "Bauernfest de Petrópolis", slug: "bauernfest-petropolis", description: "A segunda maior festa alemã do Brasil, celebrando as tradições dos colonos de Petrópolis.", venue: { name: "Palácio de Cristal", address: "Rua Alfredo Pachá, s/n", city: "Petrópolis", state: "RJ" }, startsInDays: 120, durationHours: 7, status: "published" },
      { organizerIndex: 2, title: "CarnaVotu - Oba Festival", slug: "carnavotu-oba-festival", description: "Um dos maiores carnavais de blocos fechados e micaretas do interior do país.", venue: { name: "Centro de Eventos", address: "Avenida Emílio Arroyo Hernandes, s/n", city: "Votuporanga", state: "SP" }, startsInDays: 128, durationHours: 7, status: "published" },
    ];
  }

  return [
    { organizerIndex: 1, title: "Festival Universitário de Viçosa", slug: "festival-universitario-vicosa", description: "Evento estudantil com música, praça de alimentação e atrações regionais.", venue: { name: "Campus UFV", address: "Avenida Peter Henry Rolfs, s/n", city: "Viçosa", state: "MG" }, startsInDays: 7, durationHours: 6, status: "published" },
    { organizerIndex: 2, title: "Circuito Cultural UFV", slug: "circuito-cultural-ufv", description: "Programação ligada à UFV com palestras, arte e música.", venue: { name: "Campus UFV", address: "Avenida Peter Henry Rolfs, s/n", city: "Viçosa", state: "MG" }, startsInDays: 14, durationHours: 6, status: "published" },
    { organizerIndex: 1, title: "Festival de Sabores de Viçosa", slug: "festival-sabores-vicosa", description: "Gastronomia mineira e experiências locais na sede do polo universitário.", venue: { name: "Praça Silviano Brandão", address: "Centro", city: "Viçosa", state: "MG" }, startsInDays: 21, durationHours: 5, status: "published" },
    { organizerIndex: 2, title: "Feira Tecnológica da Zona da Mata", slug: "feira-tecnologica-zona-da-mata", description: "Inovação, software e empreendedorismo no ecossistema de Viçosa.", venue: { name: "Espaço Acadêmico UFV", address: "Avenida Peter Henry Rolfs, s/n", city: "Viçosa", state: "MG" }, startsInDays: 28, durationHours: 8, status: "published" },
    { organizerIndex: 1, title: "Mostra Cultural de Araponga", slug: "mostra-cultural-araponga", description: "Evento regional com música e artes para a cidade próxima a Viçosa.", venue: { name: "Centro Cultural de Araponga", address: "Centro", city: "Araponga", state: "MG" }, startsInDays: 35, durationHours: 4, status: "published" },
    { organizerIndex: 2, title: "Festival de Cajuri em Festa", slug: "festival-cajuri-em-festa", description: "Programação comunitária para a vizinha limítrofe de Viçosa.", venue: { name: "Praça Central de Cajuri", address: "Centro", city: "Cajuri", state: "MG" }, startsInDays: 42, durationHours: 4, status: "published" },
    { organizerIndex: 1, title: "Canaã em Movimento", slug: "canaa-em-movimento", description: "Evento regional com culinária e atrações culturais de Canaã.", venue: { name: "Centro de Eventos de Canaã", address: "Centro", city: "Canaã", state: "MG" }, startsInDays: 49, durationHours: 4, status: "published" },
    { organizerIndex: 2, title: "Conexão Coimbra", slug: "conexao-coimbra", description: "Encontro com forte ligação rodoviária e integração regional em Coimbra.", venue: { name: "Praça Central de Coimbra", address: "Centro", city: "Coimbra", state: "MG" }, startsInDays: 56, durationHours: 5, status: "published" },
    { organizerIndex: 1, title: "Ervália Festival Local", slug: "ervalia-festival-local", description: "Evento vizinho com programação cultural e gastronômica de Ervália.", venue: { name: "Praça Principal de Ervália", address: "Centro", city: "Ervália", state: "MG" }, startsInDays: 63, durationHours: 4, status: "published" },
    { organizerIndex: 2, title: "Paula Cândido Cultural", slug: "paula-candido-cultural", description: "Encontro com atrações regionais e identidade local de Paula Cândido.", venue: { name: "Centro Cultural de Paula Cândido", address: "Centro", city: "Paula Cândido", state: "MG" }, startsInDays: 70, durationHours: 4, status: "published" },
    { organizerIndex: 1, title: "Pedra do Anta CISMIV Day", slug: "pedra-do-anta-cismiv-day", description: "Evento institucional e regional voltado à cidade parte do CISMIV.", venue: { name: "Ginásio Municipal", address: "Centro", city: "Pedra do Anta", state: "MG" }, startsInDays: 77, durationHours: 4, status: "published" },
    { organizerIndex: 2, title: "Porto Firme em Festa", slug: "porto-firme-em-festa", description: "Programação para a vizinha limítrofe Porto Firme.", venue: { name: "Praça Central de Porto Firme", address: "Centro", city: "Porto Firme", state: "MG" }, startsInDays: 84, durationHours: 4, status: "published" },
    { organizerIndex: 1, title: "São Miguel do Anta Serras Experience", slug: "sao-miguel-do-anta-serras-experience", description: "Evento ligado ao circuito turístico Serras em São Miguel do Anta.", venue: { name: "Centro de São Miguel do Anta", address: "Centro", city: "São Miguel do Anta", state: "MG" }, startsInDays: 91, durationHours: 4, status: "published" },
    { organizerIndex: 2, title: "Teixeiras Conecta", slug: "teixeiras-conecta", description: "Programação para a vizinha limítrofe Teixeiras, com foco em cultura local.", venue: { name: "Praça de Teixeiras", address: "Centro", city: "Teixeiras", state: "MG" }, startsInDays: 98, durationHours: 4, status: "published" },
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
