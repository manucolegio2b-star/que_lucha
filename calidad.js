// Explicación de la calidad de las fotos (alta, media, baja, mala) para el cliente.
// Uso: QLCalidad.enlace() devuelve el botón "ⓘ ¿Qué significa la calidad?"; al tocarlo se abre la ventanita.
(function(){
  var css='.qlc-link{display:flex;align-items:center;gap:10px;width:100%;min-height:48px;background:#FFF8E6;border:2px solid #E0A100;border-radius:12px;padding:10px 14px;color:#7A4B00;font-weight:700;font-size:15px;cursor:pointer;text-align:left;font-family:inherit;line-height:1.3}'+
    '.qlc-link i{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#E0A100;color:#fff;font-style:normal;font-size:15px;font-weight:800;flex:none}'+
    '.qlc-link small{display:block;font-weight:500;font-size:13px;color:#8A5A00}'+
    '.qlc-link .fl{margin-left:auto;font-size:20px;flex:none}'+
    '.qlc .malas{display:flex;flex-direction:column;gap:8px}'+
    '.qlc .mf{display:flex;align-items:center;gap:10px;background:#F4F6F8;border-radius:10px;padding:6px 10px 6px 6px;font-size:14px}'+
    '.qlc .mf img{width:48px;height:48px;object-fit:cover;border-radius:8px;flex:none}'+
    '.qlc .mf b{display:block;font-size:13px}'+
    '.qlc .qlc-no{width:100%;height:48px;border-radius:12px;border:1.5px solid #13A4AA;background:#fff;color:#0B7C82;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit}'+
    '.qlc{position:fixed;inset:0;z-index:9000;background:rgba(17,24,39,.6);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}'+
    '.qlc .caja{background:#fff;border-radius:16px;padding:18px;width:100%;max-width:420px;max-height:100%;overflow:auto;display:flex;flex-direction:column;gap:12px;color:#111827}'+
    '.qlc h2{margin:0;font-size:19px}'+
    '.qlc .caja>*{flex:none}'+
    '.qlc ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}'+
    '.qlc li{display:flex;gap:10px;align-items:flex-start;font-size:14.5px;line-height:1.4}'+
    '.qlc li span{width:14px;height:14px;border-radius:50%;flex:none;margin-top:3px}'+
    '.qlc .tip{background:#E6F6F6;border-radius:10px;padding:10px 12px;font-size:14px;line-height:1.4;color:#0B5F63}'+
    '.qlc .qlc-ok{width:100%;height:48px;border-radius:12px;border:0;background:#13A4AA;color:#fff;font-size:16px;font-weight:600;cursor:pointer;font-family:inherit}';
  var st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);

  var NIVELES=[
    ["#1B7F4B","Calidad alta","perfecta, nítida incluso de muy cerca."],
    ["#4F9A1E","Calidad media","se ve muy bien, también de cerca."],
    ["#B45309","Calidad baja","de lejos se ve bien; de muy cerca, algo suave (pelo, ojos, letras). No se ven cuadraditos."],
    ["#C0392B","Calidad mala","puede verse borrosa o pixelada. Mejor cambiarla por otra o ponerla más pequeña."]];

  function info(){
    var previo=document.activeElement, el=document.createElement("div");
    el.className="qlc"; el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true"); el.setAttribute("aria-label","Qué significa la calidad");
    el.innerHTML='<div class="caja"><h2>¿Qué significa la calidad?</h2><p style="margin:0;font-size:14px;color:#5B6472;line-height:1.4">Te decimos cómo se verá cada foto una vez impresa.</p><ul>'+
      NIVELES.map(function(n){ return '<li><span style="background:'+n[0]+'"></span><div><b style="color:'+n[0]+'">'+n[1]+':</b> '+n[2]+'</div></li>'; }).join("")+
      '</ul><div class="tip">💡 Las fotos hechas con la cámara del móvil suelen salir en calidad alta. Las capturas de pantalla, las fotos de WhatsApp reenviadas o las descargadas de redes sociales suelen salir peor.</div>'+
      '<button type="button" class="qlc-ok">Entendido</button></div>';
    function cerrar(){ el.remove(); document.removeEventListener("keydown",tecla); if(previo&&previo.focus) previo.focus(); }
    function tecla(e){ if(e.key==="Escape") cerrar(); }
    el.addEventListener("click",function(e){ if(e.target===el) cerrar(); });
    el.querySelector(".qlc-ok").addEventListener("click",cerrar);
    document.addEventListener("keydown",tecla);
    document.body.appendChild(el); el.querySelector(".qlc-ok").focus();
  }
  // Un solo escuchador para todos los enlaces (las pantallas se vuelven a pintar a menudo)
  document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-qlc]"); if(b){ e.preventDefault(); info(); } });
  function enlace(){ return '<button type="button" class="qlc-link" data-qlc="1"><i aria-hidden="true">i</i><span>¿Qué significa la calidad?<small>Mira cómo se verán tus fotos impresas</small></span><span class="fl" aria-hidden="true">›</span></button>'; }
  function calidad(p){ return p>=200?{n:"Calidad alta",c:NIVELES[0][0]}:(p>=150?{n:"Calidad media",c:NIVELES[1][0]}:(p>=100?{n:"Calidad baja",c:NIVELES[2][0]}:{n:"Calidad mala",c:NIVELES[3][0]})); }
  // Antes de hacer el pedido: si hay fotos de calidad baja o mala, se avisa al cliente.
  // fotos = [{nombre, ppp, src}]; seguir() se llama si decide hacer el pedido igualmente.
  function antesDePedir(fotos,seguir){
    var malas=(fotos||[]).filter(function(f){ return f&&f.ppp!=null&&f.ppp<150; });
    if(!malas.length){ seguir(); return; }
    var previo=document.activeElement, el=document.createElement("div"), una=malas.length===1;
    el.className="qlc"; el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true"); el.setAttribute("aria-label","Revisa la calidad de tus fotos");
    el.innerHTML='<div class="caja"><h2>⚠ Revisa '+(una?'esta foto':'estas fotos')+'</h2><p style="margin:0;font-size:14.5px;line-height:1.4">'+(una?'Esta foto tiene':'Estas fotos tienen')+' poca calidad y puede'+(una?'':'n')+' no quedar tan bien como esperas al imprimir'+(una?'la':'las')+'.</p>'+
      '<div class="malas">'+malas.slice(0,6).map(function(f){ var c=calidad(f.ppp); return '<div class="mf">'+(f.src?'<img src="'+f.src+'" alt="">':'')+'<div>'+esc(f.nombre)+'<b style="color:'+c.c+'">'+c.n+'</b></div></div>'; }).join("")+(malas.length>6?'<p style="margin:0;font-size:14px;color:#5B6472">… y '+(malas.length-6)+' más.</p>':'')+'</div>'+
      '<ul>'+NIVELES.slice(2).map(function(n){ return '<li><span style="background:'+n[0]+'"></span><div><b style="color:'+n[0]+'">'+n[1]+':</b> '+n[2]+'</div></li>'; }).join("")+'</ul>'+
      '<div class="tip">💡 Para mejorarla: usa la foto original de la cámara del móvil (no una captura ni una de WhatsApp)'+(fotos.length>1?', o ponla más pequeña':'')+'.</div>'+
      '<button type="button" class="qlc-ok">Cambiar '+(una?'la foto':'las fotos')+'</button><button type="button" class="qlc-no">Hacer el pedido igualmente</button></div>';
    function cerrar(){ el.remove(); document.removeEventListener("keydown",tecla); }
    function tecla(e){ if(e.key==="Escape"){ cerrar(); if(previo&&previo.focus) previo.focus(); } }
    el.addEventListener("click",function(e){ if(e.target===el) cerrar(); });
    el.querySelector(".qlc-ok").addEventListener("click",function(){ cerrar(); if(previo&&previo.focus) previo.focus(); });
    el.querySelector(".qlc-no").addEventListener("click",function(){ cerrar(); seguir(); });
    document.addEventListener("keydown",tecla);
    document.body.appendChild(el); el.querySelector(".qlc-ok").focus();
  }
  function esc(t){ return String(t==null?"":t).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  window.QLCalidad={info:info,enlace:enlace,antesDePedir:antesDePedir,calidad:calidad};
})();
