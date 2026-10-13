/* Seitenverhalten: Kopfleiste, Menü, Parallaxe, Einblenden, Zähler, Demo-Leiste, Videos auf Klick, Lauf-Band. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.getElementById('nav');
  var hasHero = !!document.querySelector('.hero, .subhero');

  // Kopfleiste: transparent über dunklem Kopf, ab 30 px solid
  function onScroll() { if (!nav.classList.contains('menu-open')) nav.classList.toggle('scrolled', !hasHero || window.scrollY > 30); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // Mobiles Menü
  var burger = document.getElementById('burger'), menu = document.getElementById('mmenu');
  function setMenu(open) {
    menu.classList.toggle('open', open); nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert', '');
    if (!open) onScroll();
  }
  burger.addEventListener('click', function (e) { e.stopPropagation(); setMenu(!menu.classList.contains('open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('click', function (e) { if (menu.classList.contains('open') && !menu.contains(e.target) && !nav.contains(e.target)) setMenu(false); });
  var sx = 0, sy = 0;
  menu.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  menu.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (dx > 58 && Math.abs(dx) > Math.abs(dy)) setMenu(false); });

  // Parallaxe 50 % im Kopfbild
  var bg = document.querySelector('.hero__bg, .subhero__bg');
  if (bg && !reduce) {
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () { bg.style.transform = 'translate3d(0,' + (window.scrollY * 0.5) + 'px,0)'; tick = false; });
    }, { passive: true });
  }

  // Einblenden und Zähler
  var zaehle = function (el) {
    var ziel = parseFloat(el.getAttribute('data-count')), vor = el.getAttribute('data-pre') || '', nach = el.getAttribute('data-post') || '';
    if (reduce) { el.textContent = vor + ziel + nach; return; }
    var t0 = null;
    (function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1400, 1), e = 1 - Math.pow(1 - p, 4); el.textContent = vor + Math.round(ziel * e) + nach; if (p < 1) requestAnimationFrame(step); })(performance.now());
  };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        en.target.querySelectorAll('[data-count]').forEach(zaehle);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // Demo-Leiste: kommt bei jedem Laden, × blendet nur für diese Ansicht aus
  var db = document.getElementById('demobar');
  if (db) document.getElementById('demoClose').addEventListener('click', function () { db.classList.add('hide'); });

  // Kontaktformular: baut die Mail im E-Mail-Programm, bis ein Formular-Endpunkt angebunden ist
  var kf = document.getElementById('kform');
  if (kf) kf.addEventListener('submit', function (e) {
    e.preventDefault();
    var w = function (id) { return document.getElementById(id).value.trim(); };
    var text = w('f-msg') + '\n\n' + w('f-name') + '\n' + w('f-mail');
    window.location.href = 'mailto:' + kf.getAttribute('data-an') + '?subject=' + encodeURIComponent('Anfrage über die Webseite') + '&body=' + encodeURIComponent(text);
  });

  // Videos: YouTube lädt erst nach Klick (ohne Klick keine Verbindung zu YouTube)
  document.querySelectorAll('.video__frame[data-yt]').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + b.getAttribute('data-yt') + '?autoplay=1&rel=0';
      f.title = b.getAttribute('aria-label') || 'Video'; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true;
      var w = document.createElement('div'); w.className = 'video__frame'; w.appendChild(f); b.replaceWith(w);
    }, { once: true });
  });

  // Lauf-Band unter dem Hero: nur am Handy, per Finger schiebbar
  var track = document.querySelector('.ribbon__track');
  if (track && window.matchMedia('(max-width: 760px)').matches) {
    var items = track.innerHTML; track.innerHTML = items + items;
    var x = 0, drag = false, lx = 0;
    track.style.touchAction = 'pan-y'; track.style.willChange = 'transform';
    track.addEventListener('touchstart', function (e) { drag = true; lx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchmove', function (e) { var nx = e.touches[0].clientX; x += nx - lx; lx = nx; }, { passive: true });
    track.addEventListener('touchend', function () { drag = false; });
    (function loop() {
      var half = track.scrollWidth / 2;
      if (!drag && !reduce) x -= 0.4;
      if (x <= -half) x += half; if (x > 0) x -= half;
      track.style.transform = 'translateX(' + x + 'px)';
      requestAnimationFrame(loop);
    })();
  }
})();
