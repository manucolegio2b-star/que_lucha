// Configuración pública (la clave "publishable" es pública por diseño)
window.CONFIG = {
  SUPABASE_URL: "https://yrwxxdhkivbooabbsxdi.supabase.co",
  SUPABASE_KEY: "sb_publishable_izR84OwN7WPC_R7qs6Phhg_IJF6nLIV",
  NEGOCIO: "¡Qué lucha!!",   // <- cambia aquí el nombre que sale arriba
  BUCKET: "fotos",
  WHATSAPP: "34684712841",   // número con prefijo de país, sin + ni espacios
  // Mensaje que el cliente te envía por WhatsApp al apuntarse a la lista ¡Qué lucha!.
  // {nombre} y {codigo} se cambian solos por sus datos.
  WA_APUNTARSE: "Hola, soy {nombre}. Autorizo a ¡Qué lucha!! a añadirme a su lista de difusión de WhatsApp. Mi código es {codigo}.",
  // Texto legal de la lista (apuntarse). Vacío = se ve el hueco marcado en amarillo.
  RAZON_SOCIAL: "",        // nombre fiscal del titular
  EMAIL_CONTACTO: "",      // correo para protección de datos y bajas
  INSTAGRAM: "",          // enlace completo; vacío = no se muestra
  FACEBOOK: "",             // enlace completo; vacío = no se muestra
  MAX_PX: 3000,        // lado largo máximo de cada foto enviada
  CALIDAD: 0.85,       // calidad JPEG (0 a 1)
  ANIOS: [2026, 2027, 2028],
  ANIO_POR_DEFECTO: 2027
};
