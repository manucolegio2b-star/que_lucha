-- Ejecutar UNA VEZ en Supabase (SQL Editor > New query > Run), después de supabase_setup.sql.
-- Sustituye al sistema antiguo de códigos de acceso (ya no hace falta ejecutar los otros scripts).
--  * Cualquiera puede pedir. Cada pedido recibe un código único que el cliente te manda por WhatsApp.
--  * "Un pedido por teléfono" se activa o desactiva por producto desde el panel (Ajustes).
--  * El límite de unidades de Que Lucha! se sigue cambiando desde el panel.

-- 1) Quitar el sistema antiguo de códigos de acceso
drop trigger if exists ql_antes_pedido on public.pedidos;
drop function if exists public.ql_antes_pedido();
drop function if exists public.ql_comprobar(text, text);

-- 2) Fecha en que confirmas que te ha llegado el WhatsApp del cliente
alter table public.pedidos add column if not exists wa_ok timestamptz;

-- 3) Ajustes que se cambian desde el panel
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
insert into public.ajustes (clave, valor) values ('unico_quelucha', 1)   on conflict (clave) do nothing;

-- 4) Comprueba si un móvil puede pedir un producto. Devuelve: ok | agotado | movil
create or replace function public.comprobar_pedido(p_producto text, p_movil text)
returns text language plpgsql security definer set search_path = public as $$
declare
  m text := right(regexp_replace(coalesce(p_movil,''),'\D','','g'), 9);
  lim int;
begin
  select valor into lim from ajustes where clave = 'limite_' || p_producto;
  if lim is not null and (select count(*) from pedidos where producto = p_producto) >= lim then
    return 'agotado';
  end if;
  if coalesce((select valor from ajustes where clave = 'unico_' || p_producto), 0) = 1
     and exists (select 1 from pedidos where producto = p_producto
                 and right(regexp_replace(coalesce(datos->>'movil',''),'\D','','g'), 9) = m) then
    return 'movil';
  end if;
  return 'ok';
end $$;
revoke all on function public.comprobar_pedido(text, text) from public;
grant execute on function public.comprobar_pedido(text, text) to anon, authenticated;

-- 5) Al guardar un pedido se vuelve a comprobar (no se puede saltar desde fuera)
create or replace function public.antes_pedido()
returns trigger language plpgsql security definer set search_path = public as $$
declare r text;
begin
  perform pg_advisory_xact_lock(7001);
  r := public.comprobar_pedido(new.producto, new.datos->>'movil');
  if r <> 'ok' then raise exception 'QL_%', r; end if;
  new.wa_ok := null;
  return new;
end $$;
drop trigger if exists antes_pedido on public.pedidos;
create trigger antes_pedido before insert on public.pedidos
  for each row execute function public.antes_pedido();

-- 6) El código de cada pedido no se puede repetir
create unique index if not exists pedidos_codigo_unico on public.pedidos ((datos->>'codigo'));
