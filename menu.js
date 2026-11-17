// Menú de arriba (Inicio, Productos, Cómo comprar, Contacto) para las páginas que no son el inicio.
// Se pone con <script src="menu.js"></script> justo después de <body>.
(function(){
  var css='.qlm{background:#fff;box-shadow:0 1px 0 rgba(12,43,75,.08);position:relative;z-index:30;font-family:"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif}'+
    '.qlm .w{max-width:1080px;margin:0 auto;padding:0 20px;display:flex;align-items:center;justify-content:space-between;min-height:64px}'+
    '.qlm .marca{display:flex;align-items:center;gap:10px;text-decoration:none}.qlm .marca img:first-child{height:40px;width:auto}.qlm .marca img:last-child{height:34px;width:auto}'+
    '.qlm ul{list-style:none;margin:0;padding:0;display:flex;gap:28px}'+
    '.qlm nav a{display:inline-block;padding:8px 2px;text-decoration:none;font-weight:600;color:#0C2B4B;border-bottom:2px solid transparent;font-size:16px}'+
    '.qlm nav a:hover{color:#0B7C82;border-bottom-color:#13A4AA}'+
    '.qlm .burger{display:none;background:none;border:0;width:48px;height:48px;cursor:pointer;padding:12px}'+
    '.qlm .burger span{display:block;height:3px;border-radius:3px;background:#13A4AA;margin:5px 0}'+
    '@media(max-width:760px){.qlm .burger{display:block}.qlm nav{position:absolute;left:0;right:0;top:100%;background:#fff;box-shadow:0 12px 20px rgba(12,43,75,.12);display:none}'+
      '.qlm nav.abierto{display:block}.qlm ul{flex-direction:column;gap:0;padding:8px 20px 16px}.qlm nav a{display:block;padding:14px 4px;font-size:18px;border-bottom:1px solid #EAF0F2}}'+
    // en estas páginas, el logo de su barra propia sobra (ya está en el menú)
    '#app .top .brand{display:none}#app .top:has(> .brand:only-child){display:none}';
  var st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);
  var h=document.createElement("header"); h.className="qlm";
  h.innerHTML='<div class="w"><a class="marca" href="./" aria-label="¡Qué lucha!! · Inicio"><img src="logo/hexagono.png" alt=""><img src="logo/rotulo.png" alt="¡Qué lucha!!"></a>'+
    '<button class="burger" type="button" aria-label="Abrir el menú" aria-expanded="false" aria-controls="qlmMenu"><span></span><span></span><span></span></button>'+
    '<nav id="qlmMenu" aria-label="Principal"><ul><li><a href="./">Inicio</a></li><li><a href="productos.html">Productos</a></li><li><a href="./#como-comprar">Cómo comprar</a></li><li><a href="./#contacto">Contacto</a></li></ul></nav></div>';
  document.body.insertBefore(h,document.body.firstChild);
  var b=h.querySelector(".burger"), m=h.querySelector("nav");
  b.addEventListener("click",function(){ var a=m.classList.toggle("abierto"); b.setAttribute("aria-expanded",a); });
})();
