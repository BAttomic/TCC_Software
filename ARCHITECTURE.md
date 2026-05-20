# Architecture

## Visao geral
TicketFlow segue abordagem modular por dominio em src/modules e composicao web no App Router.

## Modulos
- identity: usuarios, auth e papeis
- events: eventos, tipos de ingresso e lotes
- orders: pedidos
- tickets: ingressos e check-in
- notifications/payments/checkin: preparados para evolucao em fases seguintes

## Estrutura principal
- app: paginas e route handlers organizados por route groups
- app/(auth): login, register e reset de senha
- app/(platform): areas autenticadas como pedidos e gestao de eventos
- app/(platform)/eventos: listagem, detalhe e checkout dos eventos
- src/lib: infraestrutura (db, env, logger, auth, rate-limit)
- src/modules: modelos, schemas e repositorios por dominio
- src/server/actions: server actions
- tests: testes unitarios/integracao/e2e

## Fluxo de autenticacao
1. Usuario envia credenciais no login.
2. NextAuth Credentials valida no MongoDB.
3. JWT recebe userId e role.
4. Middleware protege rotas sensiveis por role.

## Modelo de dados
Entidades principais:
- User
- Event
- TicketType
- Lot
- Order
- Ticket
- CheckinLog

Indices implementados no dominio:
- users.email unique
- events.slug unique
- tickets.code unique
- orders { buyerId, createdAt:-1 }
- events { status, startsAt:-1 }

## Observabilidade
- Logger estruturado com pino
- Header X-Request-Id no middleware
- Health endpoint para monitorar disponibilidade de DB

## Seguranca
- Hash de senha com bcrypt (cost 12)
- JWT com exp de 1h
- Rate limit de login em memoria (5 tentativas / 15 min por ip+email)
- Headers de seguranca no middleware
- Validacao de entrada com zod
