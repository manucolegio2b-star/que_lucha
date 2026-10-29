-- Ejecutar una vez en Supabase: SQL Editor > New query > Run
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  producto text not null,
  modelo text,
  anio int,
  datos jsonb not null default '{}',
  fotos text[] not null default '{}',
  estado text not null default 'pendiente'
);
alter table public.pedidos enable row level security;
create policy "clientes crean pedidos" on public.pedidos for insert to anon with check (estado = 'pendiente');
create policy "admin lee" on public.pedidos for select to authenticated using (true);
create policy "admin edita" on public.pedidos for update to authenticated using (true);
create policy "admin borra" on public.pedidos for delete to authenticated using (true);
insert into storage.buckets (id, name, public) values ('fotos','fotos', false) on conflict do nothing;
create policy "clientes suben fotos" on storage.objects for insert to anon with check (bucket_id = 'fotos');
create policy "admin ve fotos" on storage.objects for select to authenticated using (bucket_id = 'fotos');
create policy "admin borra fotos" on storage.objects for delete to authenticated using (bucket_id = 'fotos');
