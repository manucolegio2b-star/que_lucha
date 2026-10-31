-- Ejecutar UNA VEZ en Supabase (SQL Editor > New query > Run).
-- Códigos de acceso para el Calendario Que Lucha! (máximo 30 pedidos, 1 por móvil, 1 por código).

create table if not exists public.codigos_quelucha (
  codigo    text primary key,
  creado    timestamptz not null default now(),
  movil     text,
  usado     timestamptz,
  pedido_id uuid
);
alter table public.codigos_quelucha enable row level security;

drop policy if exists "admin lee codigos" on public.codigos_quelucha;
drop policy if exists "admin crea codigos" on public.codigos_quelucha;
drop policy if exists "admin borra codigos" on public.codigos_quelucha;
create policy "admin lee codigos"   on public.codigos_quelucha for select to authenticated using (true);
create policy "admin crea codigos"  on public.codigos_quelucha for insert to authenticated with check (usado is null);
create policy "admin borra codigos" on public.codigos_quelucha for delete to authenticated using (usado is null);

-- Comprueba un código y un móvil. Devuelve: ok | agotado | codigo | usado | movil
create or replace function public.ql_comprobar(p_codigo text, p_movil text)
returns text language plpgsql security definer set search_path = public as $$
declare
  c text := upper(btrim(coalesce(p_codigo,'')));
  m text := right(regexp_replace(coalesce(p_movil,''),'\D','','g'), 9);
  r record;
begin
  if (select count(*) from pedidos where producto = 'quelucha') >= 30 then return 'agotado'; end if;
  select * into r from codigos_quelucha where codigo = c;
  if not found then return 'codigo'; end if;
  if r.usado is not null then return 'usado'; end if;
  if exists (select 1 from pedidos where producto = 'quelucha'
             and right(regexp_replace(coalesce(datos->>'movil',''),'\D','','g'), 9) = m) then
    return 'movil';
  end if;
  return 'ok';
end $$;
revoke all on function public.ql_comprobar(text, text) from public;
grant execute on function public.ql_comprobar(text, text) to anon, authenticated;

-- Al guardar un pedido de Que Lucha!, vuelve a comprobarlo y gasta el código.
create or replace function public.ql_antes_pedido()
returns trigger language plpgsql security definer set search_path = public as $$
declare r text;
begin
  if new.producto = 'quelucha' then
    perform pg_advisory_xact_lock(7001);
    r := public.ql_comprobar(new.datos->>'acceso', new.datos->>'movil');
    if r <> 'ok' then raise exception 'QL_%', r; end if;
    update codigos_quelucha
       set usado = now(), movil = new.datos->>'movil', pedido_id = new.id
     where codigo = upper(btrim(new.datos->>'acceso'));
  end if;
  return new;
end $$;

drop trigger if exists ql_antes_pedido on public.pedidos;
create trigger ql_antes_pedido before insert on public.pedidos
  for each row execute function public.ql_antes_pedido();
