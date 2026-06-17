-- Contador de visitas por evento + bucket de Storage para fotos dos convidados.

create table if not exists public.visitas (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  vid text,
  ua text,
  created_at timestamptz not null default now()
);
create index if not exists visitas_evento_idx on public.visitas(evento_id);
alter table public.visitas enable row level security;

drop policy if exists visitas_insert_public on public.visitas;
create policy visitas_insert_public on public.visitas
  for insert to anon, authenticated with check (true);

drop policy if exists visitas_select_owner on public.visitas;
create policy visitas_select_owner on public.visitas
  for select to authenticated
  using (exists (select 1 from public.eventos e
                 where e.id = visitas.evento_id and e.cerimonial_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

drop policy if exists fotos_insert_public on storage.objects;
create policy fotos_insert_public on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'fotos');

drop policy if exists fotos_select_public on storage.objects;
create policy fotos_select_public on storage.objects
  for select to anon, authenticated using (bucket_id = 'fotos');
