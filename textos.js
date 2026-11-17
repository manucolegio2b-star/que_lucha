// Diseños con texto personalizable (cojines, etc.).
// Lo usan personalizar.html (vista previa del cliente) y admin.html (archivo de impresión),
// así el archivo final sale igual que lo que aprobó el cliente.
// Medidas de las zonas en "unidades": el lado de la imagen base vale 1000.
(function(){
"use strict";

const FUENTES=[["QL Titulo","fuentes/LilitaOne-Regular.ttf"],["QL Destacado","fuentes/LuckiestGuy-Regular.ttf"],["QL Mano","fuentes/PatrickHand-Regular.ttf"],
  ["QL Elegante","fuentes/GreatVibes-Regular.ttf"],["QL Script","fuentes/DancingScript.ttf",{weight:"400 700"}]];
// Cojines de nacimiento: misma ficha que el de jubilación
const COJIN_FICHA=["Cojín de 40 × 40 cm, color blanco","Zona impresa: 29 × 29 cm aprox.","Material: 100 % poliéster"];
const MOCKUP_COJIN={src:"disenos/cojin_jubilacion/mockup.jpg", w:1000, h:1007, m:[0.72373,0.02998,-0.02989,0.72307,150.25,125.91]};

// Cojín perrito con globos (niña rosa / niño azul): mismos textos, cambia el color de los datos
const CAMPOS_PERRITO=nom=>[
  {id:"nombre", etiqueta:"Nombre", def:nom, max:20},
  {id:"apellidos", etiqueta:"Apellidos", def:"Jiménez Beltrán", max:32},
  {id:"titulo", etiqueta:"Título (en morado)", def:"Mis papis", max:20},
  {id:"padres", etiqueta:"Nombres de los papás", def:"David y Tamara", max:40},
  {id:"dia", etiqueta:"Día (en el calendario)", def:"4", max:2},
  {id:"mes", etiqueta:"Mes", def:"Mayo", max:12},
  {id:"anio", etiqueta:"Año", def:"2018", max:4},
  {id:"hora", etiqueta:"Hora (junto al reloj)", def:"1:10", max:8},
  {id:"medida", etiqueta:"Medida (junto a la regla)", def:"50 cm", max:9},
  {id:"peso", etiqueta:"Peso (junto a la balanza)", def:"2.840 gr", max:10}
];
const ZONAS_PERRITO=c=>[
  {campo:"nombre",    estilo:"libre", fuente:"QL Elegante", sep:"\u00A0\u00A0", color:"#141416", grosor:0.035, cx:458, cy:444, w:360, h:118, max:150, min:40, lineas:1, alto:1.0},
  {campo:"apellidos", estilo:"libre", fuente:"QL Elegante", sep:"\u00A0\u00A0", color:"#141416", grosor:0.03,  cx:455, cy:528, w:380, h:72,  max:88,  min:24, lineas:1, alto:1.0},
  {campo:"titulo",    estilo:"libre", fuente:"QL Titulo", color:"#A244E9", cx:477, cy:632, w:300, h:64, max:66, min:22, lineas:1, alto:1.0},
  {campo:"padres",    estilo:"libre", fuente:"QL Script", peso:700, color:"#3E3B0A", cx:492, cy:692, w:330, h:56, max:50, min:18, lineas:2, alto:1.05},
  {campo:"dia",       estilo:"libre", fuente:"QL Script", peso:700, color:c, cx:102, cy:791, w:66,  h:58, max:66, min:20, lineas:1, alto:1.0},
  {campo:"mes",       estilo:"libre", fuente:"QL Script", peso:700, color:c, cx:106, cy:862, w:150, h:36, max:40, min:16, lineas:1, alto:1.0},
  {campo:"anio",      estilo:"libre", fuente:"QL Script", peso:700, color:c, cx:106, cy:905, w:150, h:44, max:48, min:16, lineas:1, alto:1.0},
  {campo:"hora",      estilo:"libre", fuente:"QL Mano", color:c, grosor:0.04, cx:351, cy:906, w:190, h:62, max:66, min:18, lineas:1, alto:1.0},
  {campo:"medida",    estilo:"libre", fuente:"QL Mano", color:c, grosor:0.04, cx:642, cy:888, w:210, h:62, max:66, min:18, lineas:1, alto:1.0},
  {campo:"peso",      estilo:"libre", fuente:"QL Mano", color:c, grosor:0.04, cx:873, cy:914, w:220, h:62, max:66, min:18, lineas:1, alto:1.0}
];

const DISENOS={
  jubilacion:{
    id:"jubilacion", producto:"cojin", nombre:"Cojín Jubilación", corto:"Jubilación",
    desc:"Cojín blanco de 40 × 40 cm con tus textos en el título, la pizarra y el cartel. Zona impresa de 29 × 29 cm aprox. 100 % poliéster.",
    ficha:["Cojín de 40 × 40 cm, color blanco","Zona impresa: 29 × 29 cm aprox.","Material: 100 % poliéster"],
    precio:"19,50 €",              // vacío = no se muestra
    cm:29,                         // tamaño de impresión: 29 × 29 cm a 200 ppp
    base:"disenos/cojin_jubilacion/base.webp", baseFull:"disenos/cojin_jubilacion/base_full.png", mini:"disenos/cojin_jubilacion/miniatura.jpg",   // fondo transparente
    // Personajes: mismo diseño con distinto personaje (el primero es el que sale al entrar)
    personajes:[
      {id:"jubilado1", nombre:"Jubilado 1", base:"disenos/cojin_jubilacion/base.webp", baseFull:"disenos/cojin_jubilacion/base_full.png", mini:"disenos/cojin_jubilacion/mini_jubilado1.jpg"},
      {id:"jubilada_morena", nombre:"Jubilada morena", base:"disenos/cojin_jubilacion/jubilada_morena.webp", baseFull:"disenos/cojin_jubilacion/jubilada_morena_full.png", mini:"disenos/cojin_jubilacion/mini_jubilada_morena.jpg"},
      {id:"jubilada_rubia", nombre:"Jubilada rubia", base:"disenos/cojin_jubilacion/jubilada_rubia.webp", baseFull:"disenos/cojin_jubilacion/jubilada_rubia_full.png", mini:"disenos/cojin_jubilacion/mini_jubilada_rubia.jpg"}
    ],
    proximamente:"Próximamente, más personajes y diseños de otros servicios.",
    logo:{src:"logo/rotulo_grande.png", der:968, abajo:972, w:150},   // logo ¡Qué lucha!! abajo a la derecha (unidades)
    // Maqueta: foto del cojín en blanco y dónde va el diseño encima (matriz de canvas, diseño de 1000 px)
    mockup:{src:"disenos/cojin_jubilacion/mockup.jpg", w:1000, h:1007, m:[0.72373,0.02998,-0.02989,0.72307,150.25,125.91]},
    campos:[
      {id:"t1", etiqueta:"Título (arriba, en azul)", def:"Intervención finalizada:", max:40, formas:true, quitar:true, ayuda:"Si dejas solo un título, saldrá más grande."},
      {id:"t2", etiqueta:"Título destacado (en rojo)", def:"Jubilación con éxito", max:36, formas:true, quitar:true, ayuda:"Si dejas solo un título, saldrá más grande."},
      {id:"pizarra", etiqueta:"Texto de la pizarra", def:"Diagnóstico: demasiados años aguantándonos.\n\nPronóstico: descanso de por vida.", max:120, varias:true,
       ayuda:"Deja una línea en blanco para separar dos partes con una raya roja."},
      {id:"cartel", etiqueta:"Texto del cartel amarillo", def:"Tus compañeros de celadores de quirófano", max:60, varias:true}
    ],
    zonas:[
      {campo:"t1", estilo:"azul",  cx:506, cy:99, w:640, h:132, ang:0,    max:64, min:24, lineas:3, alto:1.0,  pegar:"abajo",  rayos:true, pareja:"t2", solo:{cy:194, h:288, max:110, pegar:"centro"}},
      {campo:"t2", estilo:"rojo",  cx:506, cy:266, w:760, h:164, ang:0,    max:124,min:30, lineas:3, alto:0.98, pegar:"arriba", subrayado:true, pareja:"t1", solo:{cy:198, h:288, max:150, pegar:"centro"}},
      {campo:"pizarra", estilo:"mano", cx:785, cy:572, w:200, h:262, ang:-4.5, max:50, min:15, lineas:10, alto:1.04, color:"#1F2433", raya:true},
      {campo:"cartel",  estilo:"mano", cx:792, cy:797, w:258, h:68,  ang:-5,   max:42, min:14, lineas:3,  alto:0.98, color:"#1F2433", corazon:{w:150,s:26}}
    ]
  },
  // estilo "libre": fuente, peso y color propios de cada zona (grosor = trazo extra para engordar la letra)
  erizo:{
    id:"erizo", producto:"cojin", nombre:"Cojín Nacimiento Erizo", corto:"Nacimiento Erizo",
    desc:"Cojín blanco de 40 × 40 cm con el nombre y los datos del nacimiento. Zona impresa de 29 × 29 cm aprox. 100 % poliéster.",
    ficha:COJIN_FICHA, precio:"19,50 €", cm:29,
    base:"disenos/cojin_erizo/base.webp", baseFull:"disenos/cojin_erizo/base_full.jpg", mini:"disenos/cojin_erizo/miniatura.jpg",
    mockup:MOCKUP_COJIN,
    campos:[
      {id:"nombre", etiqueta:"Nombre", def:"Manu", max:20},
      {id:"apellidos", etiqueta:"Apellidos", def:"Sevillano Hernández", max:32},
      {id:"datos", etiqueta:"Datos del nacimiento", def:"Nací el 21 de septiembre\nde 2013 a las 7:30 h.\nCon un peso de 3.500 gr\ny midiendo 53 cm.", max:140, varias:true,
       ayuda:"Pulsa Intro para empezar una línea nueva."}
    ],
    zonas:[
      {campo:"nombre",    estilo:"libre", fuente:"QL Elegante", sep:"\u00A0\u00A0", color:"#161618", grosor:0.022, cx:697, cy:100, w:440, h:124, max:125, min:40, lineas:1, alto:1.0},
      {campo:"apellidos", estilo:"libre", fuente:"QL Elegante", sep:"\u00A0\u00A0", color:"#161618", grosor:0.02,  cx:697, cy:222, w:450, h:80,  max:76,  min:26, lineas:1, alto:1.0},
      {campo:"datos",     estilo:"libre", fuente:"QL Script", peso:400, color:"#1D1D20", grosor:0.012, cx:700, cy:356, w:520, h:176, max:40, min:17, lineas:6, alto:1.3}
    ]
  },
  animales:{
    id:"animales", producto:"cojin", nombre:"Cojín Nacimiento Animalitos", corto:"Nacimiento Animalitos",
    desc:"Cojín blanco de 40 × 40 cm con el nombre, los papás y los datos del nacimiento. Zona impresa de 29 × 29 cm aprox. 100 % poliéster.",
    ficha:COJIN_FICHA, precio:"19,50 €", cm:29,
    base:"disenos/cojin_animales/base.webp", baseFull:"disenos/cojin_animales/base_full_v2.jpg", mini:"disenos/cojin_animales/miniatura.jpg",
    mockup:MOCKUP_COJIN,
    campos:[
      {id:"nombre", etiqueta:"Nombre", def:"María", max:20},
      {id:"apellidos", etiqueta:"Apellidos", def:"Jiménez Beltrán", max:32},
      {id:"titulo", etiqueta:"Título (en rojo)", def:"Mis papis", max:20},
      {id:"padres", etiqueta:"Nombres de los papás", def:"David y Tamara", max:40},
      {id:"dia", etiqueta:"Día (en el calendario)", def:"4", max:2},
      {id:"mes", etiqueta:"Mes", def:"Mayo", max:12},
      {id:"anio", etiqueta:"Año", def:"2018", max:4},
      {id:"hora", etiqueta:"Hora (junto al reloj)", def:"1:10", max:8},
      {id:"medida", etiqueta:"Medida (junto a la regla)", def:"50 cm", max:9},
      {id:"peso", etiqueta:"Peso (junto a la balanza)", def:"2.840 gr", max:10}
    ],
    zonas:[
      {campo:"nombre",    estilo:"libre", fuente:"QL Elegante", sep:"\u00A0\u00A0", color:"#141416", grosor:0.035, cx:478, cy:305, w:420, h:128, max:160, min:40, lineas:1, alto:1.0},
      {campo:"apellidos", estilo:"libre", fuente:"QL Elegante", sep:"\u00A0\u00A0", color:"#141416", grosor:0.03,  cx:478, cy:398, w:420, h:70,  max:86,  min:24, lineas:1, alto:1.0},
      {campo:"titulo",    estilo:"libre", fuente:"QL Script", peso:700, color:"#D7261E", cx:162, cy:546, w:232, h:60, max:64, min:22, lineas:1, alto:1.0},
      {campo:"padres",    estilo:"libre", fuente:"QL Script", peso:700, color:"#363C12", cx:162, cy:622, w:250, h:66, max:48, min:18, lineas:2, alto:1.08},
      {campo:"dia",       estilo:"libre", fuente:"QL Mano", color:"#34303A", cx:392, cy:557, w:62,  h:58, max:62, min:20, grosor:0.05, lineas:1, alto:1.0},
      {campo:"mes",       estilo:"libre", fuente:"QL Mano", color:"#34303A", cx:392, cy:607, w:124, h:32, max:34, min:16, lineas:1, alto:1.0},
      {campo:"anio",      estilo:"libre", fuente:"QL Mano", color:"#34303A", cx:392, cy:641, w:124, h:36, max:40, min:16, lineas:1, alto:1.0},
      {campo:"hora",      estilo:"libre", fuente:"QL Mano", color:"#34303A", cx:558, cy:634, w:140, h:44, max:48, min:18, lineas:1, alto:1.0},
      {campo:"medida",    estilo:"libre", fuente:"QL Mano", color:"#34303A", cx:749, cy:628, w:150, h:44, max:48, min:18, lineas:1, alto:1.0},
      {campo:"peso",      estilo:"libre", fuente:"QL Mano", color:"#34303A", cx:899, cy:634, w:150, h:44, max:48, min:18, lineas:1, alto:1.0}
    ]
  },
  perrito_nina:{
    id:"perrito_nina", producto:"cojin", nombre:"Cojín Nacimiento Perrito (niña)", corto:"Perrito niña",
    desc:"Cojín blanco de 40 × 40 cm con el nombre, los papás y los datos del nacimiento. Zona impresa de 29 × 29 cm aprox. 100 % poliéster.",
    ficha:COJIN_FICHA, precio:"19,50 €", cm:29,
    base:"disenos/cojin_perrito_nina/base.webp", baseFull:"disenos/cojin_perrito_nina/base_full.jpg", mini:"disenos/cojin_perrito_nina/miniatura.jpg",
    mockup:MOCKUP_COJIN,
    campos:CAMPOS_PERRITO("María"),
    zonas:ZONAS_PERRITO("#E033C7")
  },
  perrito_nino:{
    id:"perrito_nino", producto:"cojin", nombre:"Cojín Nacimiento Perrito (niño)", corto:"Perrito niño",
    desc:"Cojín blanco de 40 × 40 cm con el nombre, los papás y los datos del nacimiento. Zona impresa de 29 × 29 cm aprox. 100 % poliéster.",
    ficha:COJIN_FICHA, precio:"19,50 €", cm:29,
    base:"disenos/cojin_perrito_nino/base.webp", baseFull:"disenos/cojin_perrito_nino/base_full.jpg", mini:"disenos/cojin_perrito_nino/miniatura.jpg",
    mockup:MOCKUP_COJIN,
    campos:CAMPOS_PERRITO("Antonio"),
    zonas:ZONAS_PERRITO("#032DB8")
  },
  conejo:{
    id:"conejo", producto:"cojin", nombre:"Cojín Nacimiento Conejito Skate", corto:"Conejito skate",
    desc:"Cojín blanco de 40 × 40 cm con el nombre, los papás y los datos del nacimiento. Zona impresa de 29 × 29 cm aprox. 100 % poliéster.",
    ficha:COJIN_FICHA, precio:"19,50 €", cm:29,
    base:"disenos/cojin_conejo/base.webp", baseFull:"disenos/cojin_conejo/base_full.jpg", mini:"disenos/cojin_conejo/miniatura.jpg",
    mockup:MOCKUP_COJIN,
    campos:CAMPOS_PERRITO("María").map(c=>c.id==="titulo"?Object.assign({},c,{etiqueta:"Título (en rojo)"}):c),
    zonas:[
      {campo:"nombre",    estilo:"libre", fuente:"QL Elegante", sep:"\u00A0\u00A0", color:"#141416", grosor:0.035, cx:280, cy:151, w:400, h:118, max:150, min:40, lineas:1, alto:1.0},
      {campo:"apellidos", estilo:"libre", fuente:"QL Elegante", sep:"\u00A0\u00A0", color:"#141416", grosor:0.03,  cx:272, cy:234, w:368, h:76,  max:92,  min:24, lineas:1, alto:1.0},
      {campo:"titulo",    estilo:"libre", fuente:"QL Script", peso:700, color:"#E3170A", cx:290, cy:335, w:270, h:66, max:70, min:22, lineas:1, alto:1.0},
      {campo:"padres",    estilo:"libre", fuente:"QL Script", peso:700, color:"#3D3C09", cx:291, cy:404, w:310, h:58, max:50, min:18, lineas:2, alto:1.05},
      {campo:"dia",       estilo:"libre", fuente:"QL Script", peso:700, color:"#1A0310", cx:152, cy:521, w:70,  h:58, max:66, min:20, lineas:1, alto:1.0},
      {campo:"mes",       estilo:"libre", fuente:"QL Script", peso:700, color:"#1A0310", cx:157, cy:589, w:150, h:44, max:46, min:16, lineas:1, alto:1.0},
      {campo:"anio",      estilo:"libre", fuente:"QL Script", peso:700, color:"#1A0310", cx:156, cy:633, w:150, h:46, max:48, min:16, lineas:1, alto:1.0},
      {campo:"hora",      estilo:"libre", fuente:"QL Mano", color:"#1A0310", grosor:0.04, cx:372, cy:622, w:180, h:60, max:64, min:18, lineas:1, alto:1.0},
      {campo:"medida",    estilo:"libre", fuente:"QL Mano", color:"#1A0310", grosor:0.04, cx:156, cy:813, w:200, h:60, max:64, min:18, lineas:1, alto:1.0},
      {campo:"peso",      estilo:"libre", fuente:"QL Mano", color:"#1A0310", grosor:0.04, cx:378, cy:835, w:180, h:60, max:64, min:18, lineas:1, alto:1.0}
    ]
  }
};

let fuentesListas=null;
function cargarFuentes(){
  if(fuentesListas) return fuentesListas;
  fuentesListas=Promise.all(FUENTES.map(([n,u,o])=>{ const f=new FontFace(n,"url("+u+")",o||{}); return f.load().then(x=>{ document.fonts.add(x); }); }));
  return fuentesListas;
}
function cargarImagen(src){
  return new Promise((ok,ko)=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=()=>ko(new Error("No se pudo cargar "+src)); i.src=src; });
}
function personaje(d,pid){ const l=d.personajes||[]; return l.find(p=>p.id===pid)||l[0]||null; }
function cargar(d,full,pid){
  const logo=d.logo&&!d.logoImg?cargarImagen(d.logo.src).then(i=>{ d.logoImg=i; }).catch(()=>{}):null;
  const pj=personaje(d,pid), src=pj?(full?pj.baseFull:pj.base):(full?d.baseFull:d.base);
  // Los archivos de imprenta (full) están en el almacén privado: el panel pone QLTextos.resolver para leerlos
  const R=window.QLTextos&&QLTextos.resolver, img=(full&&R)?R(src).then(cargarImagen):cargarImagen(src);
  return Promise.all([cargarFuentes(),img,logo]).then(r=>r[1]);
}

const FAM={azul:"QL Titulo",rojo:"QL Destacado",mano:"QL Mano"};
// Letra de una zona: la del estilo o la suya propia (estilo "libre")
function letra(z,px){ return (z.peso?z.peso+" ":"")+px+"px '"+(z.fuente||FAM[z.estilo])+"'"; }
// Formas que el cliente puede elegir para los títulos.
// arc: curva (parte de la anchura que baja en los extremos) · hl: alto extra por línea · w: anchura extra
const FORMAS={recto:{n:"Recto"},arco:{n:"Arco",arc:0.07},saltarinas:{n:"Saltarinas",hl:0.1},onda:{n:"Onda",hl:0.32},abombado:{n:"Abombado",hl:0.3,w:1.2}};
// Posición de cada letra según la forma (relativa al centro de la línea)
function glifos(g,txt,t,forma){
  const ch=Array.from(txt), W=g.measureText(txt).width; let acc="";
  let L=ch.map(c=>{ const x0=g.measureText(acc).width; acc+=c; const w=g.measureText(c).width; return {c,x:x0+w/2-W/2,w,dy:0,r:0,s:1}; });
  const n=L.length;
  if(forma==="abombado"){
    L.forEach(l=>{ const p=l.x/(W/2||1); l.s=1+0.4*(1-p*p); });
    const W2=L.reduce((a,l)=>a+l.w*l.s,0); let x=-W2/2; L.forEach(l=>{ l.x=x+l.w*l.s/2; x+=l.w*l.s; });
  } else if(forma==="arco"){
    const R=W/(2*0.28)||1; L.forEach(l=>{ const th=l.x/R; l.x=R*Math.sin(th); l.dy=R*(1-Math.cos(th)); l.r=th; });
  } else if(forma==="onda"){
    const A=t*0.16; L.forEach(l=>{ const p=l.x/(W/2||1); l.dy=-A*Math.sin(p*Math.PI); l.r=-Math.atan(A*Math.PI/(W/2||1)*Math.cos(p*Math.PI)); });
  } else if(forma==="saltarinas"){
    let k=0; L.forEach(l=>{ if(l.c===" ") return; const v=[-1,0.6,-0.4,1,-0.8,0.3][k%6]; l.dy=t*0.055*v; l.r=[-0.07,0.05,0.02,-0.05,0.07,-0.02][k%6]; k++; });
  }
  const ancho=Math.max(...L.map(l=>Math.abs(l.x)+l.w*l.s/2))*2, bajo=Math.max(0,...L.map(l=>l.dy+(l.s-1)*t*0.4));
  return {L,ancho,bajo};
}
function texto(g,fila,op,dx,dy){
  if(!fila.gl){ g[op](fila.l.txt,dx,fila.y+dy); return; }
  fila.gl.L.forEach(l=>{ if(l.c===" ") return; g.save(); g.translate(l.x+dx,fila.y+l.dy+dy); if(l.r) g.rotate(l.r); if(l.s!==1) g.scale(l.s,l.s); g[op](l.c,0,0); g.restore(); });
}
const MAY={azul:true,rojo:true,mano:false,libre:false};

// Reparte las palabras en líneas buscando el tamaño de letra más grande que cabe en la zona.
function ajustar(g,texto,z,forma){
  const F=FORMAS[forma]||{};
  let t=String(texto||"").replace(/\r/g,"").replace(/[ \t]+/g," ");
  if(z.mayus!=null?z.mayus:MAY[z.estilo]) t=t.toLocaleUpperCase("es");
  const secciones=t.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
  const pal=[], br=[];                       // br: tras cada palabra -> 0 normal, 1 salto de línea, 2 cambio de parte
  secciones.forEach((s,si)=>{ s.split("\n").forEach((ln,li,arr)=>{ const ws=ln.trim().split(" ").filter(Boolean);
    ws.forEach((w,wi)=>{ pal.push(w); br.push(wi<ws.length-1?0:(li<arr.length-1?1:(si<secciones.length-1?2:0))); }); }); });
  if(!pal.length) return null;
  g.font=letra(z,100);
  const sep=z.sep||" ", wd=pal.map(w=>g.measureText(w).width), sp=g.measureText(sep).width, N=pal.length;   // sep: espacio entre palabras (más ancho en letras muy juntas)
  const ancho=(i,j)=>{ let s=0; for(let k=i;k<=j;k++) s+=wd[k]; return s+sp*(j-i); };
  const valida=(i,j)=>{ for(let k=i;k<j;k++) if(br[k]) return false; return true; };
  const huecos=br.filter(b=>b===2).length, duras=br.filter(b=>b>=1).length;
  const GAP=0.55; // espacio extra (en líneas) entre partes
  let mejor=null;
  for(let n=duras+1;n<=Math.max(duras+1,z.lineas);n++){
    if(n>N) break;
    // f[k][j]: menor anchura máxima repartiendo las palabras 0..j en k líneas
    const f=[], de=[];
    for(let k=1;k<=n;k++){ f[k]=[]; de[k]=[];
      for(let j=0;j<N;j++){ f[k][j]=Infinity;
        if(k===1){ if(valida(0,j)) f[1][j]=ancho(0,j); continue; }
        for(let i=k-1;i<=j;i++){ if(f[k-1][i-1]===Infinity||!valida(i,j)) continue; const v=Math.max(f[k-1][i-1],ancho(i,j)); if(v<f[k][j]){ f[k][j]=v; de[k][j]=i; } }
      }
    }
    const mw=f[n][N-1]; if(mw===Infinity) continue;
    const tam=Math.min(z.max, z.w*100/(mw*(F.w||1)), z.h/(n*(z.alto+(F.hl||0))+huecos*GAP+(F.arc||0)*mw/100));
    if(!mejor||tam>mejor.tam+0.01){
      const lineas=[]; let j=N-1;
      for(let k=n;k>=1;k--){ const i=k===1?0:de[k][j]; lineas.unshift({txt:pal.slice(i,j+1).join(sep),parte:i>0&&br[i-1]===2}); j=i-1; }
      mejor={tam,lineas,huecos,gap:GAP};
    }
  }
  if(mejor) mejor.corto=mejor.tam<z.min;
  return mejor;
}

function rayaRoja(g,x0,x1,y,grosor){
  g.save(); g.strokeStyle="#D7261E"; g.lineCap="round"; g.lineWidth=grosor;
  g.beginPath(); g.moveTo(x0,y+grosor*0.15); g.quadraticCurveTo((x0+x1)/2,y-grosor*0.55,x1,y-grosor*0.1); g.stroke();
  g.globalAlpha=0.55; g.lineWidth=grosor*0.45; g.beginPath(); g.moveTo(x0+(x1-x0)*0.18,y+grosor*0.7); g.quadraticCurveTo((x0+x1)/2,y+grosor*0.1,x1-(x1-x0)*0.05,y+grosor*0.45); g.stroke();
  g.restore();
}
function corazon(g,cx,cy,s,color,grosor){
  g.save(); g.strokeStyle=color; g.lineWidth=grosor; g.lineJoin="round"; g.lineCap="round";
  g.beginPath(); g.moveTo(cx,cy+s*0.42);
  g.bezierCurveTo(cx-s*0.62,cy,cx-s*0.55,cy-s*0.5,cx,cy-s*0.2);
  g.bezierCurveTo(cx+s*0.55,cy-s*0.5,cx+s*0.62,cy,cx,cy+s*0.42); g.stroke(); g.restore();
}

// Dibuja el diseño completo en un canvas de lado "px". Devuelve los avisos de textos demasiado largos.
// transparente=true: sin fondo blanco (para ponerlo sobre la foto del cojín)
function dibujar(cv,d,textos,img,px,formas,transparente){
  cv.width=px; cv.height=px;
  const g=cv.getContext("2d"), u=px/1000;
  if(!transparente){ g.fillStyle="#fff"; g.fillRect(0,0,px,px); }
  g.drawImage(img,0,0,px,px);
  const avisos={};
  const vacio=k=>!String((textos&&textos[k])||"").trim();
  d.zonas.forEach(z=>{
    const txt=(textos&&textos[z.campo]!=null)?textos[z.campo]:"";
    if(z.pareja&&z.solo&&vacio(z.pareja)&&!vacio(z.campo)) z=Object.assign({},z,z.solo);   // solo un título: ocupa toda la zona
    const campo=d.campos.find(c=>c.id===z.campo)||{}, forma=campo.formas&&formas&&FORMAS[formas[z.campo]]?formas[z.campo]:"recto", F=FORMAS[forma];
    const a=ajustar(g,txt,z,forma); if(!a) return;
    if(a.corto) avisos[z.campo]=true;
    const t=a.tam*u, lh=t*(z.alto+(F.hl||0)), gap=a.gap*lh, W=z.w*u, H=z.h*u;
    g.font=letra(z,t);
    const gls=forma==="recto"?null:a.lineas.map(l=>glifos(g,l.txt,t,forma));
    const altoTot=a.lineas.length*lh+a.huecos*gap+(F.arc?Math.max(...gls.map(x=>x.bajo)):0);
    let y0=-H/2; if(z.pegar==="abajo") y0=H/2-altoTot; else if(z.pegar!=="arriba") y0=-altoTot/2;
    g.save(); g.translate(z.cx*u,z.cy*u); if(z.ang) g.rotate(z.ang*Math.PI/180);
    g.font=letra(z,t); g.textAlign="center"; g.textBaseline="middle"; g.lineJoin="round"; g.miterLimit=2;
    const pos=[]; let y=y0;
    a.lineas.forEach((l,i)=>{ if(l.parte){ pos.push({raya:y+gap*0.5-lh*0.02,anterior:i-1}); y+=gap; } pos.push({l,y:y+lh*0.53,gl:gls?gls[i]:null}); y+=lh; });
    const filas=pos.filter(p=>p.l);
    if(z.estilo==="rojo"){
      const ex=Math.max(2,t*0.055), pasos=6;
      filas.forEach(p=>{ g.lineWidth=t*0.2; g.strokeStyle="#fff"; for(let s=0;s<=pasos;s++) texto(g,p,"strokeText",ex*s/pasos,ex*s/pasos); });
      filas.forEach(p=>{ g.fillStyle="#5E0B0B"; for(let s=pasos;s>=1;s--) texto(g,p,"fillText",ex*s/pasos,ex*s/pasos); });
      filas.forEach(p=>{ g.lineWidth=t*0.045; g.strokeStyle="#5E0B0B"; texto(g,p,"strokeText",0,0); g.fillStyle="#E3231B"; texto(g,p,"fillText",0,0); });
      if(z.subrayado&&filas.length){ const ult=filas[filas.length-1], m=g.measureText(ult.l.txt), w=Math.max(ult.gl?ult.gl.ancho:m.width,t*2.2), gr=Math.max(3,Math.min(t,90*u)*0.075), extra=ult.gl?ult.gl.bajo*(forma==="arco"?0.45:1):0; rayaRoja(g,-w*0.3,w*0.34,ult.y+(m.actualBoundingBoxDescent||t*0.3)+extra+gr*2.2,gr); }
    } else if(z.estilo==="azul"){
      filas.forEach(p=>{ g.lineWidth=t*0.18; g.strokeStyle="#fff"; texto(g,p,"strokeText",0,0); });
      filas.forEach(p=>{ g.fillStyle="#1B2A41"; texto(g,p,"fillText",0,0); });
      if(z.rayos&&filas.length){
        const wmax=Math.max(...filas.map(p=>p.gl?p.gl.ancho:g.measureText(p.l.txt).width)), cy=(filas[0].y+filas[filas.length-1].y)/2, r0=wmax/2+t*0.3, L=t*0.6;
        g.strokeStyle="#1B2A41"; g.lineCap="round"; g.lineWidth=Math.max(3,t*0.13);
        [-34,0,34].forEach(gr=>{ const an=gr*Math.PI/180; [-1,1].forEach(sd=>{ const dx=sd*Math.cos(an), dy=Math.sin(an);
          const x1=sd*r0+dx*t*0.1, y1=cy+dy*t*0.75; g.beginPath(); g.moveTo(x1,y1); g.lineTo(x1+dx*L,y1+dy*L); g.stroke(); }); });
      }
    } else {
      g.fillStyle=z.color||"#1F2433"; g.strokeStyle=z.color||"#1F2433"; g.lineWidth=t*(z.grosor!=null?z.grosor:0.03);
      filas.forEach(p=>{ g.strokeText(p.l.txt,0,p.y); g.fillText(p.l.txt,0,p.y); });
      if(z.raya) pos.filter(p=>p.raya!=null).forEach(p=>{ const fa=pos[p.anterior]&&pos[p.anterior].l?pos[p.anterior]:null; const w=Math.min(W,fa?g.measureText(fa.l.txt).width*1.05:W*0.8); rayaRoja(g,-w/2,w/2,p.raya,Math.max(2,t*0.09)); });
      if(z.corazon){ const cs=z.corazon.s*u, yb=y0+altoTot+cs*0.62, cw=z.corazon.w*u/2; rayaRoja(g,-cw,cw,yb,Math.max(2,4*u)); corazon(g,0,yb+cs*0.15,cs,z.color||"#1F2433",Math.max(2,3.2*u)); }
    }
    g.restore();
  });
  if(d.logo&&d.logoImg){ const L=d.logo, w=L.w*u, h=w*d.logoImg.naturalHeight/d.logoImg.naturalWidth; g.imageSmoothingQuality="high"; g.drawImage(d.logoImg,L.der*u-w,L.abajo*u-h,w,h); }
  return avisos;
}

// Pone el diseño (canvas ya dibujado) sobre la foto del cojín, con sus sombras
function cargarMockup(d){ return d.mockup?cargarImagen(d.mockup.src):Promise.resolve(null); }
function dibujarMockup(cv,d,diseno,foto){
  const mk=d.mockup; cv.width=mk.w; cv.height=mk.h;
  const g=cv.getContext("2d"); g.drawImage(foto,0,0,mk.w,mk.h);
  const k=1000/diseno.width, m=mk.m;
  g.save(); g.globalCompositeOperation="multiply"; g.setTransform(m[0]*k,m[1]*k,m[2]*k,m[3]*k,m[4],m[5]);
  g.imageSmoothingQuality="high"; g.drawImage(diseno,0,0);
  // El cojín de la foto es gris claro: se mezcla con el diseño normal para no oscurecer los colores
  g.globalCompositeOperation="source-over"; g.globalAlpha=0.55; g.drawImage(diseno,0,0); g.restore();
}
window.QLTextos={DISENOS,FORMAS,personaje,cargar,cargarFuentes,dibujar,ajustar,cargarMockup,dibujarMockup};
})();
