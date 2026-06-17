-- Estatística de visitas por evento (únicos + total), só para o dono do evento.
create or replace function public.painel_visitas(p_evento uuid)
returns table(total bigint, unicos bigint)
language sql
security definer
set search_path = public
as $$
  select count(*)::bigint as total,
         count(distinct vid)::bigint as unicos
  from public.visitas v
  where v.evento_id = p_evento
    and exists (
      select 1 from public.eventos e
      where e.id = p_evento and e.cerimonial_id = auth.uid()
    );
$$;
revoke all on function public.painel_visitas(uuid) from public, anon;
grant execute on function public.painel_visitas(uuid) to authenticated;
