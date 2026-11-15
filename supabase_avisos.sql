-- Avisos de pedidos nuevos por Telegram (ya aplicado en Supabase).
-- El código del bot y el chat se guardan en privado.ajustes (no visible desde la web).
-- NO pongas aquí el código real del bot.
create extension if not exists pg_net with schema extensions;
create schema if not exists privado;
revoke all on schema privado from public, anon, authenticated;
create table if not exists privado.ajustes(clave text primary key, valor text not null);
revoke all on privado.ajustes from public, anon, authenticated;
-- insert into privado.ajustes values ('telegram_token','<CÓDIGO DEL BOT>'), ('telegram_chat','<ID DEL CHAT>');
-- Para dejar de recibir avisos: delete from privado.ajustes where clave='telegram_chat';
-- La función privado.avisar_pedido() y el disparador aviso_telegram (AFTER INSERT ON public.pedidos)
-- mandan el mensaje con net.http_post a https://api.telegram.org/bot<token>/sendMessage.
-- Si el aviso falla, el pedido se guarda igual.
