// Cojín con tus fotos y tu texto.
// Lo usan cojin-fotos.html (vista previa del cliente) y admin.html (archivo de impresión),
// así el archivo final sale igual que lo que aprobó el cliente.
// Medidas en "unidades": el lado del diseño (29 × 29 cm) vale 1000.
(function(){
"use strict";

const CM=29;                 // zona impresa: 29 × 29 cm
const PPP=200;               // resolución de impresión
const PRECIO="19,50 €";      // IVA incluido (vacío = no se muestra)

// Tipos de letra que puede elegir el cliente (alto = espacio entre líneas)
const FUENTES={
  elegante:  {n:"Elegante",   fam:"QLF Elegante",   url:"fuentes/GreatVibes-Regular.ttf",   alto:1.02},
  manuscrita:{n:"Manuscrita", fam:"QLF Manuscrita", url:"fuentes/DancingScript.ttf",        alto:1.08},
  alta:      {n:"Alta",       fam:"QLF Alta",       url:"fuentes/AmaticSC-Bold.ttf",        alto:0.98},
  redonda:   {n:"Redonda",    fam:"QLF Redonda",    url:"fuentes/LilitaOne-Regular.ttf",    alto:1.06}
};
const COLORES={
  blanco:{n:"Blanco",hex:"#FFFFFF"}, negro:{n:"Negro",hex:"#1F2328"}, marino:{n:"Azul marino",hex:"#1B2A41"},
  turquesa:{n:"Turquesa",hex:"#0B8F95"}, rosa:{n:"Rosa",hex:"#D9467A"}, rojo:{n:"Rojo",hex:"#C62828"}
};

// Degradado de abajo del modelo "Una foto": tamaños (alto en unidades) y colores que puede elegir el cliente
const TAM_DEG={p:{n:"Pequeño",u:260}, m:{n:"Mediano",u:400}, g:{n:"Grande",u:560}};
const COLORES_DEG=["negro","blanco"];
const OP_DEG={min:0.15, max:0.95, def:0.65};   // opacidad del borde de abajo (más bajo = más transparente)

// Modelos. Cada hueco de foto es cuadrado.
const G=14, CEL=(1000-2*G)/3;   // collage: separación y lado de cada casilla
const casilla=i=>({x:(i%3)*(CEL+G), y:Math.floor(i/3)*(CEL+G), w:CEL, h:CEL});
const MODELOS={
  una:{id:"una", modelo:"fotos_una", nombre:"Una foto", corto:"1 foto + texto",
    desc:"Una foto grande y, abajo, tu texto.",
    fuente:"elegante", color:"blanco", colores:Object.keys(COLORES),
    texto:{cx:500, cy:872, w:860, h:176, lineas:2, max:130, min:34, max_car:60}},
  collage:{id:"collage", modelo:"fotos_collage", nombre:"Collage", corto:"Collage de 8 o 9 fotos",
    desc:"8 fotos con tu texto en el centro, o 9 fotos sin texto.",
    fuente:"alta", color:"negro", colores:["negro","marino","turquesa","rosa","rojo"],
    texto:{cx:500, cy:500, w:CEL-44, h:CEL-44, lineas:4, max:110, min:30, max_car:50}}
};
// Huecos de fotos del modelo, en orden de lectura
function huecos(mid,conTexto){
  if(mid==="una") return [{x:0,y:0,w:1000,h:1000}];
  const l=[]; for(let i=0;i<9;i++){ if(conTexto&&i===4) continue; l.push(casilla(i)); } return l;
}
const nFotos=(mid,conTexto)=>huecos(mid,conTexto).length;
const lleva=cfg=>cfg.modelo==="una"||cfg.conTexto;   // ¿el modelo lleva texto?

let fuentesListas=null;
function cargarFuentes(){
  if(fuentesListas) return fuentesListas;
  fuentesListas=Promise.all(Object.values(FUENTES).map(f=>new FontFace(f.fam,"url("+f.url+")").load().then(x=>{ document.fonts.add(x); })))
    .catch(e=>{ fuentesListas=null; throw e; });
  return fuentesListas;
}

// Parte de la foto que se ve en un hueco. enc = {z: zoom (1 = la foto justo cubre el hueco), x, y: centro (0 a 1)}
function recorte(iw,ih,h,enc){
  enc=enc||{}; const z=Math.max(1,enc.z||1);
  const s=Math.max(h.w/iw,h.h/ih)*z, vw=h.w/s, vh=h.h/s;
  const cx=(enc.x==null?.5:enc.x)*iw, cy=(enc.y==null?.5:enc.y)*ih;
  return {sx:Math.min(Math.max(cx-vw/2,0),iw-vw), sy:Math.min(Math.max(cy-vh/2,0),ih-vh), vw, vh};
}
// Corrige el encuadre para que la foto siempre cubra el hueco
function ajustarEnc(iw,ih,h,enc){
  const r=recorte(iw,ih,h,enc);
  return {z:Math.max(1,enc.z||1), x:(r.sx+r.vw/2)/iw, y:(r.sy+r.vh/2)/ih};
}
// Puntos por pulgada con que saldrá la foto (pw = ancho real de la foto enviada)
function ppp(h,enc,pw,ph){
  const r=recorte(pw,ph,h,enc), cm=h.w/1000*CM;
  return Math.round(r.vw/(cm/2.54));
}

// Reparte el texto en líneas buscando la letra más grande que cabe.
function ajustarTexto(g,txt,fam,z,alto){
  const lineasUsr=String(txt||"").replace(/\r/g,"").split("\n").map(l=>l.trim().replace(/\s+/g," ")).filter(Boolean);
  const pal=[], br=[];
  lineasUsr.forEach((ln,li)=>{ const ws=ln.split(" "); ws.forEach((w,wi)=>{ pal.push(w); br.push(wi<ws.length-1?0:(li<lineasUsr.length-1?1:0)); }); });
  if(!pal.length) return null;
  g.font="100px '"+fam+"'";
  const wd=pal.map(w=>g.measureText(w).width), sp=g.measureText(" ").width, N=pal.length;
  const ancho=(i,j)=>{ let s=0; for(let k=i;k<=j;k++) s+=wd[k]; return s+sp*(j-i); };
  const valida=(i,j)=>{ for(let k=i;k<j;k++) if(br[k]) return false; return true; };
  const duras=br.filter(b=>b).length;
  let mejor=null;
  for(let n=duras+1;n<=Math.max(duras+1,z.lineas)&&n<=N;n++){
    const f=[], de=[];
    for(let k=1;k<=n;k++){ f[k]=[]; de[k]=[];
      for(let j=0;j<N;j++){ f[k][j]=Infinity;
        if(k===1){ if(valida(0,j)) f[1][j]=ancho(0,j); continue; }
        for(let i=k-1;i<=j;i++){ if(f[k-1][i-1]===Infinity||!valida(i,j)) continue; const v=Math.max(f[k-1][i-1],ancho(i,j)); if(v<f[k][j]){ f[k][j]=v; de[k][j]=i; } }
      }
    }
    const mw=f[n][N-1]; if(mw===Infinity) continue;
    const tam=Math.min(z.max, z.w*100/mw, z.h/(n*alto));
    if(!mejor||tam>mejor.tam+0.01){
      const lineas=[]; let j=N-1;
      for(let k=n;k>=1;k--){ const i=k===1?0:de[k][j]; lineas.unshift(pal.slice(i,j+1).join(" ")); j=i-1; }
      mejor={tam,lineas};
    }
  }
  if(mejor) mejor.corto=mejor.tam<z.min;
  return mejor;
}
function claro(hex){ const n=parseInt(hex.slice(1),16), r=n>>16, g=n>>8&255, b=n&255; return (0.299*r+0.587*g+0.114*b)/255>0.6; }

// Hueco vacío (solo en la vista previa del cliente)
function vacio(g,x,y,w,h,num,u){
  g.fillStyle="#E5E8ED"; g.fillRect(x,y,w,h);
  const c=Math.min(w,h), cx=x+w/2, cy=y+h/2-c*0.06;
  g.strokeStyle="#9AA4B2"; g.lineWidth=Math.max(2,c*0.022); g.lineJoin="round";
  const bw=c*0.3, bh=c*0.21;
  g.beginPath(); g.rect(cx-bw/2,cy-bh/2,bw,bh); g.stroke();
  g.beginPath(); g.arc(cx,cy+bh*0.04,bh*0.3,0,Math.PI*2); g.stroke();
  g.beginPath(); g.moveTo(cx-bw*0.18,cy-bh/2); g.lineTo(cx-bw*0.1,cy-bh*0.72); g.lineTo(cx+bw*0.1,cy-bh*0.72); g.lineTo(cx+bw*0.18,cy-bh/2); g.stroke();
  g.fillStyle="#5B6472"; g.font="600 "+Math.round(c*0.075)+"px system-ui,Arial,sans-serif"; g.textAlign="center"; g.textBaseline="middle";
  g.fillText("Foto "+num,cx,cy+bh*0.5+c*0.1);
}

// Dibuja el diseño en un canvas de lado px.
// cfg = {modelo, conTexto, texto, fuente, color, enc:[...]}; imgs = imágenes de cada hueco (null = vacío)
// transparente=true: sin fondo blanco (para ponerlo sobre la foto del cojín). Devuelve {corto:true} si el texto queda muy pequeño.
function dibujar(cv,cfg,imgs,px,transparente){
  cv.width=px; cv.height=px;
  const g=cv.getContext("2d"), u=px/1000, M=MODELOS[cfg.modelo], hs=huecos(cfg.modelo,cfg.conTexto);
  g.clearRect(0,0,px,px);
  if(!transparente){ g.fillStyle="#fff"; g.fillRect(0,0,px,px); }
  g.imageSmoothingEnabled=true; g.imageSmoothingQuality="high";
  hs.forEach((h,i)=>{
    const im=imgs&&imgs[i], X=h.x*u, Y=h.y*u, W=h.w*u, H=h.h*u;
    if(!im){ vacio(g,X,Y,W,H,i+1,u); return; }
    const iw=im.naturalWidth||im.width, ih=im.naturalHeight||im.height, r=recorte(iw,ih,h,(cfg.enc||[])[i]);
    g.drawImage(im,r.sx,r.sy,r.vw,r.vh,X,Y,W,H);
  });
  const res={};
  const F=FUENTES[cfg.fuente]||FUENTES[M.fuente], col=(COLORES[cfg.color]||COLORES[M.color]).hex;
  const a=lleva(cfg)?ajustarTexto(g,cfg.texto,F.fam,M.texto,F.alto):null;
  if(cfg.modelo==="una"){   // degradado abajo (el cliente elige si lo quiere, su color y su tamaño)
    const dg=cfg.degradado||{on:!!a, color:claro(col)?"negro":"blanco", tam:"m"};
    if(dg.on){
      const alto=(TAM_DEG[dg.tam]||TAM_DEG.m).u, y0=(1000-alto)*u, n=parseInt((COLORES[dg.color]||COLORES.negro).hex.slice(1),16), rgb=(n>>16)+","+(n>>8&255)+","+(n&255);
      const op=Math.min(OP_DEG.max,Math.max(OP_DEG.min,dg.op==null?OP_DEG.def:+dg.op)), fuerte=[op*0.68,op];
      const gr=g.createLinearGradient(0,y0,0,px);
      gr.addColorStop(0,"rgba("+rgb+",0)"); gr.addColorStop(0.55,"rgba("+rgb+","+fuerte[0]+")"); gr.addColorStop(1,"rgba("+rgb+","+fuerte[1]+")");
      g.fillStyle=gr; g.fillRect(0,y0,px,px-y0);
    }
  }
  if(!lleva(cfg)) return res;
  const z=M.texto;
  if(cfg.modelo==="collage"&&!transparente){ const c=casilla(4); g.fillStyle="#fff"; g.fillRect(c.x*u,c.y*u,c.w*u,c.h*u); }
  if(!a) return res;
  if(a.corto) res.corto=true;
  const t=a.tam*u, lh=t*F.alto;
  g.save();
  g.font=t+"px '"+F.fam+"'"; g.textAlign="center"; g.textBaseline="middle"; g.fillStyle=col;
  if(cfg.modelo==="una"){ g.shadowColor=claro(col)?"rgba(0,0,0,.45)":"rgba(255,255,255,.6)"; g.shadowBlur=8*u; g.shadowOffsetY=2*u; }
  const tot=a.lineas.length*lh; let y=z.cy*u-tot/2+lh/2;
  a.lineas.forEach(l=>{ g.fillText(l,z.cx*u,y); y+=lh; });
  g.restore();
  return res;
}

// Pone el diseño sobre la foto del cojín (misma foto y posición que el cojín de jubilación)
const MOCKUP={src:"disenos/cojin_jubilacion/mockup.jpg", w:1000, h:1007, m:[0.72373,0.02998,-0.02989,0.72307,150.25,125.91]};
let _mk=null;
function cargarMockup(){ if(!_mk) _mk=new Promise((ok,ko)=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=()=>{ _mk=null; ko(new Error("No se pudo cargar la foto del cojín")); }; i.src=MOCKUP.src; }); return _mk; }
function dibujarMockup(cv,diseno,foto){
  const mk=MOCKUP; cv.width=mk.w; cv.height=mk.h;
  const g=cv.getContext("2d"); g.drawImage(foto,0,0,mk.w,mk.h);
  const k=1000/diseno.width, m=mk.m;
  g.save(); g.globalCompositeOperation="multiply"; g.setTransform(m[0]*k,m[1]*k,m[2]*k,m[3]*k,m[4],m[5]);
  g.imageSmoothingQuality="high"; g.drawImage(diseno,0,0);
  g.globalCompositeOperation="source-over"; g.globalAlpha=0.55; g.drawImage(diseno,0,0); g.restore();
}

window.QLFotoCojin={CM,PPP,PRECIO,FUENTES,COLORES,TAM_DEG,COLORES_DEG,OP_DEG,MODELOS,huecos,nFotos,lleva,cargarFuentes,recorte,ajustarEnc,ppp,dibujar,cargarMockup,dibujarMockup,
  porModelo:m=>Object.values(MODELOS).find(x=>x.modelo===m)||null};
})();
