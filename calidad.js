// Explicación de la calidad de las fotos (alta, media, baja, mala) para el cliente.
// Uso: QLCalidad.enlace() devuelve el botón "ⓘ ¿Qué significa la calidad?"; al tocarlo se abre la ventanita.
(function(){
  var css='.qlc-link{display:inline-flex;align-items:center;gap:6px;background:none;border:0;padding:6px 0;color:#0B7C82;font-weight:700;font-size:14px;cursor:pointer;text-align:left;font-family:inherit}'+
    '.qlc-link i{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:#13A4AA;color:#fff;font-style:normal;font-size:13px;font-weight:800;flex:none}'+
    '.qlc{position:fixed;inset:0;z-index:9000;background:rgba(17,24,39,.6);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}'+
    '.qlc .caja{background:#fff;border-radius:16px;padding:18px;width:100%;max-width:420px;max-height:100%;overflow:auto;display:flex;flex-direction:column;gap:12px;color:#111827}'+
    '.qlc h2{margin:0;font-size:19px}'+
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
  function enlace(){ return '<button type="button" class="qlc-link" data-qlc="1"><i aria-hidden="true">i</i>¿Qué significa la calidad?</button>'; }
  window.QLCalidad={info:info,enlace:enlace};
})();
