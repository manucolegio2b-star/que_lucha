-- Ejecutar UNA VEZ en Supabase (SQL Editor > New query > Run), después de supabase_setup.sql.
-- Se puede volver a ejecutar sin problema.
--  * Lista ¡Qué lucha!: el cliente se apunta en la web, recibe su código personal (atado a su móvil)
--    y te manda un WhatsApp autorizándote a añadirlo a tu lista de difusión.
--  * Los productos "Que lucha" (se marcan en el panel, Ajustes) piden ese código y
--    solo admiten un pedido por móvil.
--  * El límite de unidades de Que Lucha! se sigue cambiando desde el panel.

-- 1) Quitar los sistemas anteriores
drop trigger if exists ql_antes_pedido on public.pedidos;
drop function if exists public.ql_antes_pedido();
drop function if exists public.ql_comprobar(text, text);
drop function if exists public.comprobar_pedido(text, text);

-- 2) Personas apuntadas a la lista
create table if not exists public.apuntados (
  codigo    text primary key,
  creado    timestamptz not null default now(),
  nombre    text not null,
  servicio  text,
  categoria text,
  movil     text not null unique,     -- 9 cifras, sin prefijo
  en_lista  timestamptz               -- cuándo lo añadiste a la lista de difusión
);
alter table public.apuntados enable row level security;
drop policy if exists "admin lee apuntados"   on public.apuntados;
drop policy if exists "admin edita apuntados" on public.apuntados;
drop policy if exists "admin borra apuntados" on public.apuntados;
create policy "admin lee apuntados"   on public.apuntados for select to authenticated using (true);
create policy "admin edita apuntados" on public.apuntados for update to authenticated using (true);
create policy "admin borra apuntados" on public.apuntados for delete to authenticated using (true);

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
delete from public.ajustes where clave like 'unico\_%';
insert into public.ajustes (clave, valor) values ('limite_quelucha', 30) on conflict (clave) do nothing;
insert into public.ajustes (clave, valor) values ('codigo_quelucha', 1)  on conflict (clave) do nothing;

-- 4) Apuntarse. Devuelve el código nuevo, o: datos | existe
create or replace function public.apuntarse(p_nombre text, p_servicio text, p_categoria text, p_movil text)
returns text language plpgsql security definer set search_path = public as $$
declare
  m text := right(regexp_replace(coalesce(p_movil,''),'\D','','g'), 9);
  a text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  c text;
begin
  if length(btrim(coalesce(p_nombre,''))) < 2 or m !~ '^[6-9][0-9]{8}$' then return 'datos'; end if;
  if exists (select 1 from apuntados where movil = m) then return 'existe'; end if;
  loop
    c := '';
    for i in 1..4 loop c := c || substr(a, 1 + floor(random()*32)::int, 1); end loop;
    exit when not exists (select 1 from apuntados where codigo = c);
  end loop;
  insert into apuntados (codigo, nombre, servicio, categoria, movil)
  values (c, left(btrim(p_nombre),40), left(btrim(coalesce(p_servicio,'')),60), left(btrim(coalesce(p_categoria,'')),60), m);
  return c;
exception when unique_violation then return 'existe';
end $$;
revoke all on function public.apuntarse(text, text, text, text) from public;
grant execute on function public.apuntarse(text, text, text, text) to anon, authenticated;

-- 5) Qué productos piden código (lo lee la web de pedidos)
create or replace function public.productos_con_codigo()
returns text[] language sql security definer set search_path = public as $$
  select coalesce(array_agg(substr(clave, 8)), '{}') from ajustes where clave like 'codigo\_%' and valor = 1;
$$;
revoke all on function public.productos_con_codigo() from public;
grant execute on function public.productos_con_codigo() to anon, authenticated;

-- 6) Comprueba si un móvil puede pedir un producto.
--    Devuelve: ok | agotado | codigo | otromovil | movil
create or replace function public.comprobar_pedido(p_producto text, p_movil text, p_codigo text)
returns text language plpgsql security definer set search_path = public as $$
declare
  m text := right(regexp_replace(coalesce(p_movil,''),'\D','','g'), 9);
  c text := upper(btrim(coalesce(p_codigo,'')));
  lim int;
  r record;
begin
  select valor into lim from ajustes where clave = 'limite_' || p_producto;
  if lim is not null and (select count(*) from pedidos where producto = p_producto) >= lim then
    return 'agotado';
  end if;
  if coalesce((select valor from ajustes where clave = 'codigo_' || p_producto), 0) = 1 then
    select * into r from apuntados where codigo = c;
    if not found then return 'codigo'; end if;
    if r.movil <> m then return 'otromovil'; end if;
    if exists (select 1 from pedidos where producto = p_producto
               and right(regexp_replace(coalesce(datos->>'movil',''),'\D','','g'), 9) = m) then
      return 'movil';
    end if;
  end if;
  return 'ok';
end $$;
revoke all on function public.comprobar_pedido(text, text, text) from public;
grant execute on function public.comprobar_pedido(text, text, text) to anon, authenticated;

-- 7) Al guardar un pedido se vuelve a comprobar (no se puede saltar desde fuera)
create or replace function public.antes_pedido()
returns trigger language plpgsql security definer set search_path = public as $$
declare r text;
begin
  perform pg_advisory_xact_lock(7001);
  r := public.comprobar_pedido(new.producto, new.datos->>'movil', new.datos->>'acceso');
  if r <> 'ok' then raise exception 'QL_%', r; end if;
  return new;
end $$;
drop trigger if exists antes_pedido on public.pedidos;
create trigger antes_pedido before insert on public.pedidos
  for each row execute function public.antes_pedido();

-- 8) El código de cada pedido no se puede repetir
create unique index if not exists pedidos_codigo_unico on public.pedidos ((datos->>'codigo'));
