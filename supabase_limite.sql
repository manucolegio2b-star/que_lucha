-- Ejecutar UNA VEZ en Supabase (SQL Editor > New query > Run), después de supabase_codigos.sql.
-- Permite cambiar desde el panel el límite de pedidos de Que Lucha! (vacío = sin límite).

create table if not exists public.ajustes (
  clave text primary key,
  valor int
);
alter table public.ajustes enable row level security;
drop policy if exists "admin lee ajustes" on public.ajustes;
drop policy if exists "admin crea ajustes" on public.ajustes;
drop policy if exists "admin cambia ajustes" on public.ajustes;
create policy "admin lee ajustes"    on public.ajustes for select to authenticated using (true);
create policy "admin crea ajustes"   on public.ajustes for insert to authenticated with check (true);
create policy "admin cambia ajustes" on public.ajustes for update to authenticated using (true);

insert into public.ajustes (clave, valor) values ('limite_quelucha', 30) on conflict (clave) do nothing;

create or replace function public.ql_comprobar(p_codigo text, p_movil text)
returns text language plpgsql security definer set search_path = public as $$
declare
  c text := upper(btrim(coalesce(p_codigo,'')));
  m text := right(regexp_replace(coalesce(p_movil,''),'\D','','g'), 9);
  lim int;
  r record;
begin
  select valor into lim from ajustes where clave = 'limite_quelucha';
  if lim is not null and (select count(*) from pedidos where producto = 'quelucha') >= lim then return 'agotado'; end if;
  select * into r from codigos_quelucha where codigo = c;
  if not found then return 'codigo'; end if;
  if r.usado is not null then return 'usado'; end if;
  if exists (select 1 from pedidos where producto = 'quelucha'
             and right(regexp_replace(coalesce(datos->>'movil',''),'\D','','g'), 9) = m) then
    return 'movil';
  end if;
  return 'ok';
end $$;
