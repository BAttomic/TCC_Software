# TicketFlow

Plataforma web full-stack para venda de ingressos online.

## Stack
- Next.js 16 (App Router)
- TypeScript strict
- MongoDB + Mongoose
- TailwindCSS + shadcn/ui
- NextAuth v5 (Credentials + JWT)
- Vitest + Playwright

## Requisitos
- Node.js 20+
- pnpm
- Docker

## Como rodar
1. Instale dependencias:
   - pnpm install
2. Suba o Mongo local:
   - pnpm db:up
3. Configure variaveis:
   - copie .env.example para .env.local
4. Rode seed:
   - pnpm seed
5. Inicie app:
   - pnpm dev

## Qualidade
- pnpm typecheck
- pnpm lint
- pnpm test
- pnpm build

## Scripts
- pnpm dev
- pnpm build
- pnpm start
- pnpm typecheck
- pnpm lint
- pnpm lint:fix
- pnpm test
- pnpm test:e2e
- pnpm db:up
- pnpm db:down
- pnpm seed
- pnpm db:reset

## Contas de teste (seed)
Senha para todas: Password123!
- admin@ticketflow.com (admin)
- organizer1@ticketflow.com (organizer)
- organizer2@ticketflow.com (organizer)
- buyer1@ticketflow.com (buyer)
- buyer2@ticketflow.com (buyer)
- buyer3@ticketflow.com (buyer)
- operator@ticketflow.com (operator)

## Variaveis de ambiente
Veja .env.example para a lista completa.
Campos obrigatorios:
- MONGODB_URI
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- JWT_SECRET
- TICKET_HMAC_SECRET

Campos opcionais:
- RESEND_API_KEY
- STRIPE_SECRET_KEY

## Decisoes arquiteturais
Resumo em ARCHITECTURE.md.

## Status atual
- Home funcional
- Fluxo de autenticacao funcional (register, login, forgot/reset senha com stub)
- Paginas publicas de eventos funcionais (listagem e detalhes)
- Health endpoint com verificacao de DB
- Middleware com headers de seguranca + protecao de rotas por role
