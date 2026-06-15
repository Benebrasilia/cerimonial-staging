-- Cerimonial — schema inicial (multi-tenant por cerimonialista).
-- Aplicado em staging e produção. Fonte de verdade versionada do banco.

-- ============ Tabela: eventos ============
create table if not exists public.eventos (
  id            uuid primary key default gen_random_uuid(),
  cerimonial_id uuid not null default auth.uid()
                  references auth.users(id) on delete cascade,
  nome          text not null,
  slug          text not null unique,
  data          date,
  horario       text not null default '',
  local         text,
  ultimo_passo  boolean not null default true,
  config        jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

alter table public.eventos enable row level security;

drop policy if exists eventos_select_own on public.eventos;
create policy eventos_select_own on public.eventos
  for select to authenticated using (auth.uid() = cerimonial_id);

drop policy if exists eventos_insert_own on public.eventos;
create policy eventos_insert_own on public.eventos
  for insert to authenticated with check (auth.uid() = cerimonial_id);

drop policy if exists eventos_update_own on public.eventos;
create policy eventos_update_own on public.eventos
  for update to authenticated
  using (auth.uid() = cerimonial_id) with check (auth.uid() = cerimonial_id);

drop policy if exists eventos_delete_own on public.eventos;
create policy eventos_delete_own on public.eventos
  for delete to authenticated using (auth.uid() = cerimonial_id);

-- ============ Tabela: confirmacoes (RSVP público) ============
create table if not exists public.confirmacoes (
  id           uuid primary key default gen_random_uuid(),
  evento_id    uuid not null references public.eventos(id) on delete cascade,
  nome         text,
  presenca     text,
  num_adultos  integer,
  adultos      text,
  num_criancas integer,
  criancas     text,
  mensagem     text,
  foto_url     text,
  prev_nome    text,
  created_at   timestamptz not null default now()
);

create index if not exists confirmacoes_evento_id_idx on public.confirmacoes(evento_id);

alter table public.confirmacoes enable row level security;

-- Dono (cerimonialista) lê/apaga as confirmações dos próprios eventos.
drop policy if exists confirm_select_owner on public.confirmacoes;
create policy confirm_select_owner on public.confirmacoes
  for select to authenticated using (
    exists (select 1 from public.eventos e
            where e.id = confirmacoes.evento_id and e.cerimonial_id = auth.uid())
  );

drop policy if exists confirm_delete_owner on public.confirmacoes;
create policy confirm_delete_owner on public.confirmacoes
  for delete to authenticated using (
    exists (select 1 from public.eventos e
            where e.id = confirmacoes.evento_id and e.cerimonial_id = auth.uid())
  );

-- Convidado (anônimo) pode inserir confirmação, desde que o evento exista.
drop policy if exists confirm_insert_public on public.confirmacoes;
create policy confirm_insert_public on public.confirmacoes
  for insert to anon, authenticated with check (
    exists (select 1 from public.eventos e where e.id = confirmacoes.evento_id)
  );

-- ============ Função pública: dados do evento por slug ============
-- SECURITY DEFINER: expõe APENAS campos públicos do evento ao formulário
-- de RSVP, sem dar acesso de leitura à tabela eventos para anônimos.
create or replace function public.evento_publico(p_slug text)
returns table(id uuid, nome text, data date, horario text, local text, ultimo_passo boolean, config jsonb)
language sql
security definer
set search_path to 'public'
as $$
  select id, nome, data, horario, local, ultimo_passo, config
  from public.eventos where slug = p_slug;
$$;

grant execute on function public.evento_publico(text) to anon, authenticated;
