-- Correção: a política de INSERT público em confirmacoes checava a existência
-- do evento via subconsulta em public.eventos, mas o papel anon não tem
-- permissão de SELECT em eventos (RLS), fazendo a checagem falhar sempre.
-- A integridade do evento já é garantida pela CHAVE ESTRANGEIRA
-- (confirmacoes.evento_id -> eventos.id), então simplificamos a política.
drop policy if exists confirm_insert_public on public.confirmacoes;
create policy confirm_insert_public on public.confirmacoes
  for insert to anon, authenticated with check (true);
