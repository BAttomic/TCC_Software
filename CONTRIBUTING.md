# Contributing

## Fluxo recomendado
1. Crie uma branch por feature ou fix.
2. Faça mudancas pequenas e testaveis.
3. Rode qualidade local antes de abrir PR:
   - pnpm typecheck
   - pnpm lint
   - pnpm test
4. Abra PR com descricao objetiva e checklist.

## Padroes
- TypeScript strict
- Evitar any sem justificativa
- UI em portugues (Brasil)
- Codigo e comentarios em ingles
- Commits em Conventional Commits

## Estrutura
- Coloque logica de dominio em src/modules
- Use src/lib para infraestrutura compartilhada
- Use server actions para mutacoes simples
- Use route handlers para webhooks/APIs externas
