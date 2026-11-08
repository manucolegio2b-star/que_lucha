/* Calendario de 12 hojas: dibujo de cada hoja (portada y meses).
   Hoja de 32 × 45 cm a 200 ppp = 2520 × 3543 px. Lo usan pedir.html (vista previa) y admin.html (archivo final).
   Todas las medidas están pensadas para 2520 px de ancho y se escalan solas. */
(function(){
  var ANCHO = 2520, ALTO = 3543; // 32 × 45 cm a 200 ppp

  // Combinaciones de color. a = cuadro del año y días pares de la cabecera; b = la otra; suave = días del mes anterior; fest = festivos.
  var PALETAS = [
    {id:"morado",   nombre:"Morado y azul",          a:"#B23BB5", b:"#1F86D1", suave:"#F7DCF3", fest:"#8BD04E"},
    {id:"turquesa", nombre:"Turquesa y coral",       a:"#13A4AA", b:"#F2765A", suave:"#DDF1F3", fest:"#F5BE2E"},
    {id:"verde",    nombre:"Verde y naranja",        a:"#3E9B4F", b:"#F28C28", suave:"#E4F3E2", fest:"#E8505B"},
    {id:"rosa",     nombre:"Rosa y lila",            a:"#E35D9B", b:"#8E6CCF", suave:"#FBE3EF", fest:"#5CC2B0"},
    {id:"marino",   nombre:"Azul marino y amarillo", a:"#1E3A5F", b:"#E2A91F", suave:"#E3E9F2", fest:"#E8505B", tb:"#1B2B3A"},
    {id:"rojo",     nombre:"Rojo y azul",            a:"#D63A3A", b:"#2E5EAA", suave:"#FBE1E1", fest:"#F5BE2E"},
    {id:"naranja",  nombre:"Naranja y morado",       a:"#EF7D1A", b:"#7B3FA0", suave:"#FDEBD9", fest:"#3BAA6A"},
    {id:"agua",     nombre:"Verde agua y rosa",      a:"#22A699", b:"#EE6A9B", suave:"#DDF4F1", fest:"#F5BE2E"},
    {id:"mostaza",  nombre:"Mostaza y gris",         a:"#D9A21B", b:"#5E6670", suave:"#FBF0D6", fest:"#E8505B", ta:"#1B2B3A"},
    {id:"lima",     nombre:"Azul y verde lima",      a:"#2563B8", b:"#7CB82F", suave:"#E1EAF7", fest:"#F28C28"}
  ];
  // Texto blanco u oscuro según lo claro que sea el fondo
  function sobre(hex){ var n=parseInt(hex.slice(1),16), r=n>>16&255, g=n>>8&255, b=n&255; return (0.299*r+0.587*g+0.114*b)>175?"#1B2B3A":"#fff"; }
  // Color del texto sobre el color a, b o fest de una combinación (algunas lo fijan a mano)
  function textoDe(P,k){ return P["t"+(k==="fest"?"f":k)] || sobre(P[k]); }
  var MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  var DIAS = ["LUNES","MARTES","MIÉRCOLES","JUEVES","VIERNES","SÁBADO","DOMINGO"];
  var SANS = "Arial, Helvetica, 'Liberation Sans', sans-serif";

  function paleta(id){ for(var i=0;i<PALETAS.length;i++) if(PALETAS[i].id===id) return PALETAS[i]; return PALETAS[0]; }

  // Domingo de Pascua (método de Gauss / Meeus)
  function pascua(y){
    var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),
        h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),
        mes=Math.floor((h+l-7*m+114)/31),dia=((h+l-7*m+114)%31)+1;
    return new Date(y,mes-1,dia);
  }
  // Festivos nacionales de España: {"m-d": nombre}  (m de 0 a 11)
  function festivos(y){
    var f={"0-1":"Año Nuevo","0-6":"Reyes","4-1":"Día del Trabajo","7-15":"Asunción","9-12":"Fiesta Nacional",
           "10-1":"Todos los Santos","11-6":"Constitución","11-8":"Inmaculada","11-25":"Navidad"};
    var p=pascua(y), vs=new Date(p.getFullYear(),p.getMonth(),p.getDate()-2);
    f[vs.getMonth()+"-"+vs.getDate()]="Viernes Santo";
    return f;
  }

  // Fuente del nombre del mes
  var fuenteLista=null;
  function cargarFuentes(base){
    if(fuenteLista) return fuenteLista;
    base=base||"";
    try{
      var ff=new FontFace("Patrick Hand","url("+base+"fuentes/PatrickHand-Regular.ttf)");
      var fl=new FontFace("Lilita One","url("+base+"fuentes/LilitaOne-Regular.ttf)");
      fuenteLista=Promise.all([ff.load(),fl.load()]).then(function(r){ r.forEach(function(x){document.fonts.add(x);}); }).catch(function(){});
    }catch(e){ fuenteLista=Promise.resolve(); }
    return fuenteLista;
  }

  // Zona de fotos en cm sobre la hoja de 32 × 45 (portada = más alta)
  var CM=32/ANCHO, MARGEN=110, ALTO_FOTO_MES=1500, ALTO_FOTO_PORTADA=ALTO-2*MARGEN-560;
  function zona(portada){ return {x:+(MARGEN*CM).toFixed(3), y:+(MARGEN*CM).toFixed(3), w:+((ANCHO-2*MARGEN)*CM).toFixed(3), h:+((portada?ALTO_FOTO_PORTADA:ALTO_FOTO_MES)*CM).toFixed(3)}; }

  // Zona de fotos: fondo blanco y cada foto en su sitio (x, y, w, h en cm dentro de la zona)
  function fotos(ctx,lista,portada,k){
    var z=zona(portada), kc=k/CM;
    (lista||[]).forEach(function(f){ if(f.img) ctx.drawImage(f.img,(z.x+f.x)*kc,(z.y+f.y)*kc,f.w*kc,f.h*kc); });
  }

  /* Dibuja una hoja.
     o = {anio, mes: 0..11 (o -1 = portada), paleta: id, fotos: [{img, x, y, w, h}] (cm dentro de la zona), pie: texto pequeño opcional}
     ctx es el contexto de un canvas de cualquier tamaño con la proporción 32 × 45. */
  function dibujar(ctx, o){
    var W=ctx.canvas.width, H=ctx.canvas.height, k=W/ANCHO, P=paleta(o.paleta);
    ctx.save(); ctx.textBaseline="alphabetic";
    ctx.fillStyle="#fff"; ctx.fillRect(0,0,W,H);
    var m=MARGEN*k, x0=m, gw=W-2*m;

    if(o.mes<0){ // ----- Portada -----
      var ph=ALTO_FOTO_PORTADA*k;
      fotos(ctx,o.fotos,true,k);
      var y=m+ph+70*k;
      ctx.fillStyle=P.a; ctx.fillRect(x0,y,gw,24*k);
      ctx.fillStyle=P.b; ctx.fillRect(x0,y+34*k,gw,12*k);
      ctx.fillStyle=P.a; ctx.textAlign="center";
      ctx.font="400 "+Math.round(340*k)+"px 'Lilita One', "+SANS;
      ctx.fillText(String(o.anio), W/2, y+46*k+340*k);
      pie(ctx,o.pie,W,H,k); ctx.restore(); return;
    }

    // ----- Hoja del mes -----
    var ph=ALTO_FOTO_MES*k; fotos(ctx,o.fotos,false,k);
    var cw=gw/7, y=m+ph+90*k, gap=8*k;

    // Año y nombre del mes
    var hh=190*k;
    ctx.fillStyle=P.a; ctx.fillRect(x0,y,cw-gap,hh);
    ctx.fillStyle=textoDe(P,"a"); ctx.textAlign="center";
    ctx.font="700 "+Math.round(118*k)+"px "+SANS;
    ctx.fillText(String(o.anio), x0+(cw-gap)/2, y+hh/2+42*k);
    ctx.fillStyle="#111"; ctx.textAlign="left";
    ctx.font="400 "+Math.round(175*k)+"px 'Patrick Hand', "+SANS;
    ctx.fillText(MESES[o.mes], x0+cw+16*k, y+hh-34*k);
    y+=hh+10*k;

    // Días de la semana
    var dh=70*k;
    ctx.font="700 "+Math.round(42*k)+"px "+SANS;
    for(var c=0;c<7;c++){
      var kc=c%2?"a":"b"; ctx.fillStyle=P[kc]; ctx.fillRect(x0+c*cw,y,cw-gap,dh);
      ctx.fillStyle=textoDe(P,kc); ctx.textAlign="left"; ctx.fillText(DIAS[c], x0+c*cw+14*k, y+dh/2+15*k);
    }
    y+=dh+6*k;

    // Rejilla de días
    var yfin=H-m, filas=6, rh=(yfin-y)/filas;
    var primero=(new Date(o.anio,o.mes,1).getDay()+6)%7, ndias=new Date(o.anio,o.mes+1,0).getDate();
    var nprev=new Date(o.anio,o.mes,0).getDate(), F=festivos(o.anio);
    var ultimo=primero+ndias-1; // casilla del último día
    var notas=ultimo+1; // las notas empiezan justo después del último día
    var numH=60*k, numF="400 "+Math.round(64*k)+"px "+SANS;

    // Franja del mes anterior
    if(primero>0){
      ctx.fillStyle=P.suave; ctx.fillRect(x0,y,primero*cw,46*k);
      ctx.fillStyle="#9AA0A6"; ctx.font="400 "+Math.round(36*k)+"px "+SANS; ctx.textAlign="left";
      for(var i=0;i<primero;i++) ctx.fillText(String(nprev-primero+1+i), x0+i*cw+14*k, y+36*k);
    }
    // Líneas: horizontales debajo de cada fila y verticales entre columnas (no en la zona de notas)
    ctx.strokeStyle="#DADDE1"; ctx.lineWidth=3*k;
    for(var r=0;r<filas;r++){
      var yb=y+(r+1)*rh;
      ctx.beginPath(); ctx.moveTo(x0,yb); ctx.lineTo(x0+gw,yb); ctx.stroke();
      for(var c2=1;c2<7;c2++){
        var cel=r*7+c2; if(cel>notas && cel>ultimo) continue;
        ctx.beginPath(); ctx.moveTo(x0+c2*cw-gap/2,y+r*rh); ctx.lineTo(x0+c2*cw-gap/2,yb); ctx.stroke();
      }
    }
    // Números
    for(var d=1; d<=ndias; d++){
      var cel2=primero+d-1, cx=x0+(cel2%7)*cw, cy=y+Math.floor(cel2/7)*rh;
      var esF=F[o.mes+"-"+d];
      if(esF){ ctx.fillStyle=P.fest; ctx.fillRect(cx,cy+8*k,cw-gap,numH+4*k); }
      ctx.fillStyle=esF?textoDe(P,"fest"):"#111"; ctx.font=(esF?"700 ":"")+numF.replace("400 ",""); ctx.textAlign="left";
      ctx.fillText((d<10?"0":"")+d, cx+16*k, cy+8*k+numH-8*k);
    }
    // Notas
    if(notas<42){
      var nr=Math.floor(notas/7), nc=notas%7;
      ctx.fillStyle="#333"; ctx.font="700 "+Math.round(38*k)+"px "+SANS; ctx.textAlign="left";
      ctx.fillText("Notas:", x0+nc*cw+16*k, y+nr*rh+52*k);
    }
    pie(ctx,o.pie,W,H,k);
    ctx.restore();
  }
  // Texto pequeño en vertical en el margen derecho (nº de pedido para el taller)
  function pie(ctx,t,W,H,k){
    if(!t) return;
    ctx.save(); ctx.translate(W-55*k,MARGEN*k+ALTO_FOTO_MES*k/2); ctx.rotate(Math.PI/2);
    ctx.font=Math.round(22*k)+"px "+SANS; ctx.fillStyle="#555"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(t,0,0); ctx.restore();
  }

  // Hoja completa a 200 ppp en un canvas nuevo
  function hojaCanvas(o, escala){
    var cv=document.createElement("canvas"); escala=escala||1;
    cv.width=Math.round(ANCHO*escala); cv.height=Math.round(ALTO*escala);
    dibujar(cv.getContext("2d"),o); return cv;
  }

  window.QLCal12={ANCHO:ANCHO,ALTO:ALTO,PALETAS:PALETAS,MESES:MESES,paleta:paleta,sobre:sobre,textoDe:textoDe,zona:zona,festivos:festivos,cargarFuentes:cargarFuentes,dibujar:dibujar,hojaCanvas:hojaCanvas};
})();
