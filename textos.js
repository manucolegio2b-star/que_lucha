// Diseños con texto personalizable (cojines, etc.).
// Lo usan personalizar.html (vista previa del cliente) y admin.html (archivo de impresión),
// así el archivo final sale igual que lo que aprobó el cliente.
// Medidas de las zonas en "unidades": el lado de la imagen base vale 1000.
(function(){
"use strict";

const FUENTES=[["QL Titulo","fuentes/LilitaOne-Regular.ttf"],["QL Destacado","fuentes/LuckiestGuy-Regular.ttf"],["QL Mano","fuentes/PatrickHand-Regular.ttf"]];

const DISENOS={
  jubilacion:{
    id:"jubilacion", producto:"cojin", nombre:"Cojín Jubilación", corto:"Jubilación",
    desc:"Cojín con el celador saliendo del quirófano. Título, pizarra y cartel con tus textos.",
    precio:"19,50 €",              // vacío = no se muestra
    cm:29,                         // tamaño de impresión: 29 × 29 cm a 200 ppp
    base:"disenos/cojin_jubilacion/base.jpg", baseFull:"disenos/cojin_jubilacion/base_full.jpg",
    campos:[
      {id:"t1", etiqueta:"Título (arriba, en azul)", def:"Intervención finalizada:", max:40},
      {id:"t2", etiqueta:"Título destacado (en rojo)", def:"Jubilación con éxito", max:36},
      {id:"pizarra", etiqueta:"Texto de la pizarra", def:"Diagnóstico: demasiados años aguantándonos.\n\nPronóstico: descanso de por vida.", max:170, varias:true,
       ayuda:"Deja una línea en blanco para separar dos partes con una raya roja."},
      {id:"cartel", etiqueta:"Texto del cartel amarillo", def:"Tus compañeros de celadores de quirófano", max:60, varias:true}
    ],
    zonas:[
      {campo:"t1", estilo:"azul",  cx:506, cy:108, w:640, h:138, ang:0,    max:64, min:24, lineas:3, alto:1.0,  pegar:"abajo",  rayos:true},
      {campo:"t2", estilo:"rojo",  cx:506, cy:280, w:760, h:196, ang:0,    max:124,min:30, lineas:3, alto:0.98, pegar:"arriba", subrayado:true},
      {campo:"pizarra", estilo:"mano", cx:785, cy:572, w:200, h:262, ang:-4.5, max:50, min:15, lineas:10, alto:1.04, color:"#1F2433", raya:true},
      {campo:"cartel",  estilo:"mano", cx:792, cy:797, w:258, h:68,  ang:-5,   max:42, min:14, lineas:3,  alto:0.98, color:"#1F2433", corazon:{w:150,s:26}}
    ]
  }
};

let fuentesListas=null;
function cargarFuentes(){
  if(fuentesListas) return fuentesListas;
  fuentesListas=Promise.all(FUENTES.map(([n,u])=>{ const f=new FontFace(n,"url("+u+")"); return f.load().then(x=>{ document.fonts.add(x); }); }));
  return fuentesListas;
}
function cargarImagen(src){
  return new Promise((ok,ko)=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=()=>ko(new Error("No se pudo cargar "+src)); i.src=src; });
}
function cargar(d,full){ return Promise.all([cargarFuentes(),cargarImagen(full?d.baseFull:d.base)]).then(r=>r[1]); }

const FAM={azul:"QL Titulo",rojo:"QL Destacado",mano:"QL Mano"};
const MAY={azul:true,rojo:true,mano:false};

// Reparte las palabras en líneas buscando el tamaño de letra más grande que cabe en la zona.
function ajustar(g,texto,z){
  const fam=FAM[z.estilo];
  let t=String(texto||"").replace(/\r/g,"").replace(/[ \t]+/g," ");
  if(MAY[z.estilo]) t=t.toLocaleUpperCase("es");
  const secciones=t.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
  const pal=[], br=[];                       // br: tras cada palabra -> 0 normal, 1 salto de línea, 2 cambio de parte
  secciones.forEach((s,si)=>{ s.split("\n").forEach((ln,li,arr)=>{ const ws=ln.trim().split(" ").filter(Boolean);
    ws.forEach((w,wi)=>{ pal.push(w); br.push(wi<ws.length-1?0:(li<arr.length-1?1:(si<secciones.length-1?2:0))); }); }); });
  if(!pal.length) return null;
  g.font="100px '"+fam+"'";
  const wd=pal.map(w=>g.measureText(w).width), sp=g.measureText(" ").width, N=pal.length;
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
    const tam=Math.min(z.max, z.w*100/mw, z.h/(n*z.alto+huecos*GAP));
    if(!mejor||tam>mejor.tam+0.01){
      const lineas=[]; let j=N-1;
      for(let k=n;k>=1;k--){ const i=k===1?0:de[k][j]; lineas.unshift({txt:pal.slice(i,j+1).join(" "),parte:i>0&&br[i-1]===2}); j=i-1; }
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
function dibujar(cv,d,textos,img,px){
  cv.width=px; cv.height=px;
  const g=cv.getContext("2d"), u=px/1000;
  g.fillStyle="#fff"; g.fillRect(0,0,px,px);
  g.drawImage(img,0,0,px,px);
  const avisos={};
  d.zonas.forEach(z=>{
    const txt=(textos&&textos[z.campo]!=null)?textos[z.campo]:"";
    const a=ajustar(g,txt,z); if(!a) return;
    if(a.corto) avisos[z.campo]=true;
    const t=a.tam*u, lh=t*z.alto, gap=a.gap*lh, W=z.w*u, H=z.h*u;
    const altoTot=a.lineas.length*lh+a.huecos*gap;
    let y0=-H/2; if(z.pegar==="abajo") y0=H/2-altoTot; else if(z.pegar!=="arriba") y0=-altoTot/2;
    g.save(); g.translate(z.cx*u,z.cy*u); if(z.ang) g.rotate(z.ang*Math.PI/180);
    g.font=t+"px '"+FAM[z.estilo]+"'"; g.textAlign="center"; g.textBaseline="middle"; g.lineJoin="round"; g.miterLimit=2;
    const pos=[]; let y=y0;
    a.lineas.forEach((l,i)=>{ if(l.parte){ pos.push({raya:y+gap*0.5-lh*0.02,anterior:i-1}); y+=gap; } pos.push({l,y:y+lh*0.53}); y+=lh; });
    const filas=pos.filter(p=>p.l);
    if(z.estilo==="rojo"){
      const ex=Math.max(2,t*0.055), pasos=6;
      filas.forEach(p=>{ g.lineWidth=t*0.2; g.strokeStyle="#fff"; for(let s=0;s<=pasos;s++) g.strokeText(p.l.txt,ex*s/pasos,ex*s/pasos+p.y); });
      filas.forEach(p=>{ g.fillStyle="#5E0B0B"; for(let s=pasos;s>=1;s--) g.fillText(p.l.txt,ex*s/pasos,ex*s/pasos+p.y); });
      filas.forEach(p=>{ g.lineWidth=t*0.045; g.strokeStyle="#5E0B0B"; g.strokeText(p.l.txt,0,p.y); g.fillStyle="#E3231B"; g.fillText(p.l.txt,0,p.y); });
      if(z.subrayado&&filas.length){ const ult=filas[filas.length-1], m=g.measureText(ult.l.txt), w=Math.max(m.width,t*2.2), gr=Math.max(3,Math.min(t,90*u)*0.075); rayaRoja(g,-w*0.3,w*0.34,ult.y+(m.actualBoundingBoxDescent||t*0.3)+gr*2.2,gr); }
    } else if(z.estilo==="azul"){
      filas.forEach(p=>{ g.lineWidth=t*0.18; g.strokeStyle="#fff"; g.strokeText(p.l.txt,0,p.y); });
      filas.forEach(p=>{ g.fillStyle="#1B2A41"; g.fillText(p.l.txt,0,p.y); });
      if(z.rayos&&filas.length){
        const wmax=Math.max(...filas.map(p=>g.measureText(p.l.txt).width)), cy=(filas[0].y+filas[filas.length-1].y)/2, r0=wmax/2+t*0.3, L=t*0.6;
        g.strokeStyle="#1B2A41"; g.lineCap="round"; g.lineWidth=Math.max(3,t*0.13);
        [-34,0,34].forEach(gr=>{ const an=gr*Math.PI/180; [-1,1].forEach(sd=>{ const dx=sd*Math.cos(an), dy=Math.sin(an);
          const x1=sd*r0+dx*t*0.1, y1=cy+dy*t*0.75; g.beginPath(); g.moveTo(x1,y1); g.lineTo(x1+dx*L,y1+dy*L); g.stroke(); }); });
      }
    } else {
      g.fillStyle=z.color||"#1F2433"; g.strokeStyle=z.color||"#1F2433"; g.lineWidth=t*0.03;
      filas.forEach(p=>{ g.strokeText(p.l.txt,0,p.y); g.fillText(p.l.txt,0,p.y); });
      if(z.raya) pos.filter(p=>p.raya!=null).forEach(p=>{ const fa=pos[p.anterior]&&pos[p.anterior].l?pos[p.anterior]:null; const w=Math.min(W,fa?g.measureText(fa.l.txt).width*1.05:W*0.8); rayaRoja(g,-w/2,w/2,p.raya,Math.max(2,t*0.09)); });
      if(z.corazon){ const cs=z.corazon.s*u, yb=y0+altoTot+cs*0.62, cw=z.corazon.w*u/2; rayaRoja(g,-cw,cw,yb,Math.max(2,4*u)); corazon(g,0,yb+cs*0.15,cs,z.color||"#1F2433",Math.max(2,3.2*u)); }
    }
    g.restore();
  });
  return avisos;
}

window.QLTextos={DISENOS,cargar,cargarFuentes,dibujar,ajustar};
})();
