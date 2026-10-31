-- Ejecutar UNA VEZ en Supabase (SQL Editor > New query > Run), después de los dos archivos anteriores.
-- El código de la lista de difusión pasa a ser permanente: se liga al primer móvil que lo usa
-- y sirve para todos los pedidos de ese cliente (un pedido por móvil en cada producto limitado).

drop policy if exists "admin edita codigos" on public.codigos_quelucha;
create policy "admin edita codigos" on public.codigos_quelucha for update to authenticated using (true);

-- Devuelve: ok | agotado | codigo | otromovil | movil
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
  if r.movil is not null and right(regexp_replace(r.movil,'\D','','g'), 9) <> m then return 'otromovil'; end if;
  if exists (select 1 from pedidos where producto = 'quelucha'
             and right(regexp_replace(coalesce(datos->>'movil',''),'\D','','g'), 9) = m) then
    return 'movil';
  end if;
  return 'ok';
end $$;

create or replace function public.ql_antes_pedido()
returns trigger language plpgsql security definer set search_path = public as $$
declare r text;
begin
  if new.producto = 'quelucha' then
    perform pg_advisory_xact_lock(7001);
    r := public.ql_comprobar(new.datos->>'acceso', new.datos->>'movil');
    if r <> 'ok' then raise exception 'QL_%', r; end if;
    update codigos_quelucha
       set movil = coalesce(movil, new.datos->>'movil'), usado = coalesce(usado, now())
     where codigo = upper(btrim(new.datos->>'acceso'));
  end if;
  return new;
end $$;
