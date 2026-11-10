// Visor a pantalla completa para ver un diseño en grande y comparar (flechas, deslizar el dedo, teclado).
// Uso: QLVisor.abrir({items:[{nombre, src}|{nombre, crear:()=>Promise<url>}], idx, elegido, boton, onElegir:i=>{}})
(function(){
  var css='.qlv{position:fixed;inset:0;z-index:9999;background:rgba(17,24,39,.97);display:flex;flex-direction:column;align-items:center;padding:12px 12px calc(14px + env(safe-area-inset-bottom));gap:10px;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#fff;touch-action:pan-y}'+
    '.qlv-top{width:100%;max-width:720px;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:44px}'+
    '.qlv-tit{font-size:17px;font-weight:700}.qlv-tit small{font-weight:400;opacity:.75;margin-left:6px;font-size:14px}'+
    '.qlv-x{width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:22px;line-height:1;cursor:pointer;flex:none}'+
    '.qlv-zona{position:relative;flex:1;min-height:0;width:100%;max-width:720px;display:flex;align-items:center;justify-content:center}'+
    '.qlv-zona img{max-width:100%;max-height:100%;object-fit:contain;border-radius:6px;box-shadow:0 6px 28px rgba(0,0,0,.5);background:#fff;user-select:none;-webkit-user-drag:none}'+
    '.qlv-cargando{font-size:14px;opacity:.8}'+
    '.qlv-fl{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;border:0;background:rgba(255,255,255,.92);color:#111827;font-size:28px;line-height:1;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;padding:0 0 3px}'+
    '.qlv-fl.i{left:4px}.qlv-fl.d{right:4px}'+
    '.qlv-pts{display:flex;gap:8px}.qlv-pts i{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.35)}.qlv-pts i.on{background:#fff}'+
    '.qlv-ok{width:100%;max-width:420px;height:52px;border-radius:14px;border:0;background:#13A4AA;color:#fff;font-size:17px;font-weight:600;cursor:pointer}'+
    '.qlv-ok.ya{background:#fff;color:#0B7C82}'+
    '.qlv-lupa{position:absolute;top:6px;right:6px;width:34px;height:34px;border-radius:50%;border:0;background:rgba(255,255,255,.95);box-shadow:0 1px 5px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;z-index:2}';
  var st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);

  var LUPA='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B7C82" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6"/></svg>';
  function lupa(attr,nombre){ return '<button type="button" class="qlv-lupa" '+attr+' aria-label="Ver '+(nombre||"")+' en grande">'+LUPA+'</button>'; }

  var cache={};
  function url(it){
    if(it.src) return Promise.resolve(it.src);
    var k=it.clave||it.nombre;
    if(!cache[k]) cache[k]=it.crear().catch(function(e){ delete cache[k]; throw e; });
    return cache[k];
  }

  function abrir(o){
    var items=o.items, i=o.idx||0, n=items.length, previo=document.activeElement;
    var el=document.createElement("div"); el.className="qlv"; el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true");
    el.innerHTML='<div class="qlv-top"><div class="qlv-tit"></div><button type="button" class="qlv-x" aria-label="Cerrar">✕</button></div>'+
      '<div class="qlv-zona"><span class="qlv-cargando">Cargando…</span><img alt="" hidden>'+
      (n>1?'<button type="button" class="qlv-fl i" aria-label="Anterior">‹</button><button type="button" class="qlv-fl d" aria-label="Siguiente">›</button>':'')+'</div>'+
      (n>1?'<div class="qlv-pts" aria-hidden="true">'+items.map(function(){return "<i></i>";}).join("")+'</div>':'')+
      (o.onElegir?'<button type="button" class="qlv-ok"></button>':'');
    var img=el.querySelector("img"), car=el.querySelector(".qlv-cargando"), tit=el.querySelector(".qlv-tit"), ok=el.querySelector(".qlv-ok");
    var ov=document.body.style.overflow; document.body.style.overflow="hidden";
    function pinta(){
      var it=items[i];
      tit.innerHTML=it.nombre+(n>1?'<small>'+(i+1)+' de '+n+'</small>':'');
      el.querySelectorAll(".qlv-pts i").forEach(function(p,j){ p.className=j===i?"on":""; });
      if(ok){ var ya=o.elegido===i; ok.className="qlv-ok"+(ya?" ya":""); ok.textContent=ya?(o.botonYa||"✓ Diseño elegido"):(o.boton||"Elegir este diseño"); }
      var pedido=i; img.hidden=true; car.hidden=false; car.textContent="Cargando…";
      url(it).then(function(u){ if(pedido!==i) return; img.onload=function(){ if(pedido===i){ img.hidden=false; car.hidden=true; } }; img.src=u; img.alt="Diseño "+it.nombre; })
        .catch(function(){ if(pedido===i) car.textContent="No se ha podido cargar la imagen."; });
    }
    function mover(d){ if(n<2) return; i=(i+d+n)%n; pinta(); }
    function cerrar(){ document.removeEventListener("keydown",tecla); document.body.style.overflow=ov; el.remove(); if(previo&&previo.focus) previo.focus(); }
    function tecla(e){ if(e.key==="Escape") cerrar(); else if(e.key==="ArrowLeft") mover(-1); else if(e.key==="ArrowRight") mover(1); }
    el.querySelector(".qlv-x").onclick=cerrar;
    if(n>1){ el.querySelector(".qlv-fl.i").onclick=function(){ mover(-1); }; el.querySelector(".qlv-fl.d").onclick=function(){ mover(1); }; }
    if(ok) ok.onclick=function(){ var j=i; cerrar(); if(o.elegido!==j) o.onElegir(j); };
    el.querySelector(".qlv-zona").addEventListener("click",function(e){ if(e.target===this) cerrar(); });
    var x0=null, y0=null;
    el.addEventListener("touchstart",function(e){ x0=e.touches[0].clientX; y0=e.touches[0].clientY; },{passive:true});
    el.addEventListener("touchend",function(e){ if(x0===null) return; var dx=e.changedTouches[0].clientX-x0, dy=e.changedTouches[0].clientY-y0; x0=null;
      if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)) mover(dx<0?1:-1); },{passive:true});
    document.addEventListener("keydown",tecla);
    document.body.appendChild(el); pinta(); el.querySelector(".qlv-x").focus();
  }
  window.QLVisor={abrir:abrir,lupa:lupa};
})();
