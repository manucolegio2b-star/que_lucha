// Configuración pública (la clave "publishable" es pública por diseño)
window.CONFIG = {
  SUPABASE_URL: "https://yrwxxdhkivbooabbsxdi.supabase.co",
  SUPABASE_KEY: "sb_publishable_izR84OwN7WPC_R7qs6Phhg_IJF6nLIV",
  NEGOCIO: "¡Qué lucha!!",   // <- cambia aquí el nombre que sale arriba
  BUCKET: "fotos",
  WHATSAPP: "34627627627",   // número con prefijo de país, sin + ni espacios (el de tu plantilla; confírmalo)
  // Mensaje que el cliente te envía por WhatsApp al terminar su pedido.
  // {nombre}, {codigo}, {producto} y {anio} se cambian solos por los datos del pedido.
  WA_MENSAJE: "Hola, soy {nombre}. Acabo de hacer mi pedido de {producto} {anio}. Mi código es {codigo}.",
  INSTAGRAM: "",          // enlace completo; vacío = no se muestra
  FACEBOOK: "",             // enlace completo; vacío = no se muestra
  MAX_PX: 3000,        // lado largo máximo de cada foto enviada
  CALIDAD: 0.85,       // calidad JPEG (0 a 1)
  ANIOS: [2026, 2027, 2028],
  ANIO_POR_DEFECTO: 2027
};
