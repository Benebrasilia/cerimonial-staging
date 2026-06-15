# Cerimonial

Plataforma SaaS para cerimonialistas gerenciarem múltiplos eventos e as
confirmações de presença (RSVP) de cada um. Cada cerimonialista enxerga
apenas os próprios eventos (multi-tenant via Row Level Security no Supabase).

## Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (Postgres + Auth + RLS)
- **Netlify** (build + deploy automático a cada push)

## Estrutura
```
app/                 # rotas e páginas (App Router)
  page.tsx           # gestor: login + lista/edição de eventos
lib/supabase.ts      # cliente Supabase (browser), via env vars
supabase/migrations/ # schema versionado do banco (fonte de verdade)
netlify.toml         # configuração de build
```

## Ambientes
| Ambiente  | Site Netlify                      | Banco Supabase |
|-----------|-----------------------------------|----------------|
| staging   | cerimonial-staging.netlify.app    | projeto staging |
| produção  | (a definir)                       | projeto prod    |

A seleção do banco é feita por **variáveis de ambiente por site** no Netlify:
`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Rodar localmente
```bash
cp .env.example .env.local   # preencha com as credenciais do projeto staging
npm install
npm run dev
```

## Banco de dados
O schema fica versionado em `supabase/migrations/`. Para um banco novo,
aplique os arquivos em ordem. Nunca edite o schema só pelo painel: registre
a mudança como um novo arquivo de migração.
