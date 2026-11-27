/* STRANGEVERSE pitch — two small behaviours, nothing else.
   1) scroll reveal: adds .in to .reveal elements as they enter the viewport
   2) top bar: marks the link of the section currently on screen + section-title label under the numbers
   The page is complete without this file (the hidden state only applies under html.js). */
(function () {
  'use strict';
  // 0) CRT de tubo (botón CRT de la barra): prendido por defecto; se recuerda en este navegador
  (function () {
    var btn = document.querySelector('.topbar__crt');
    if (!btn) return;
    // CRT apagado por ahora (sin botón ni efecto): CRT_ENABLED = true lo vuelve
    var CRT_ENABLED = false;
    if (!CRT_ENABLED) { btn.style.display = 'none'; document.documentElement.classList.remove('crt'); return; }
    var glass = document.createElement('div'); glass.className = 'crt-glass'; glass.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glass);
    var on = true;
    try { on = localStorage.getItem('pitch_crt') !== '0'; } catch (e) {}
    function set(v) {
      on = v; document.documentElement.classList.toggle('crt', v); btn.setAttribute('aria-pressed', v ? 'true' : 'false');
      try { localStorage.setItem('pitch_crt', v ? '1' : '0'); } catch (e) {}
    }
    set(on);
    btn.addEventListener('click', function () { set(!on); });
  })();
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  // 1) reveal once, then stop watching
  var reveal = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el) { reveal.observe(el); });

  // 2) active section link in the top bar
  var links = {};
  document.querySelectorAll('.topbar__nav a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  // 3) cartelito con el título de la sección: HOME en la portada, si no el texto del kicker ("02 · BYOD" -> "BYOD")
  var here = document.querySelector('.topbar__here');
  function titleOf(sec) {
    if (sec.id === 's00') return 'HOME';
    var k = sec.querySelector('.kicker');
    if (!k) return '';
    var t = k.textContent.split('·');
    return t[t.length - 1].trim();
  }
  var pending = 'HOME', timer = 0;
  function setHere(text) {
    if (!here || !text || pending === text) return;
    pending = text;                                   // siempre gana el último pedido
    here.classList.add('is-swapping');
    clearTimeout(timer);
    timer = setTimeout(function () { here.textContent = pending; here.classList.remove('is-swapping'); }, 180);
  }
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      setHere(titleOf(e.target));
      var a = links[e.target.id];
      Object.keys(links).forEach(function (k) { links[k].classList.remove('is-active'); });
      if (a) a.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });
  // 4) THE IDEA: cada chip de género muestra su imagen en el recuadro (mouse, foco o toque)
  var peek = document.querySelector('.idea__peek');
  if (peek) {
    var pImg = peek.querySelector('img'), pCap = peek.querySelector('figcaption'), pHint = peek.querySelector('.idea__hint');
    var chipsP = document.querySelectorAll('.idea__eras li[data-peek]');
    function show(li) {
      chipsP.forEach(function (c) { c.classList.toggle('is-on', c === li); });
      pImg.classList.remove('is-in');
      pImg.hidden = false;
      pImg.alt = li.textContent;
      pImg.onload = function () { pImg.classList.add('is-in'); };
      pImg.src = li.getAttribute('data-peek');
      if (pImg.complete) pImg.classList.add('is-in');
      pCap.textContent = li.textContent + ' — ' + li.getAttribute('data-cap');
      if (pHint) pHint.hidden = true;
    }
    chipsP.forEach(function (li) {
      li.addEventListener('mouseenter', function () { show(li); });
      li.addEventListener('focus', function () { show(li); });
      li.addEventListener('click', function () { show(li); });
    });
    // siempre hay uno elegido: arranca con el primero y queda el último que se pasó con el mouse
    if (chipsP.length) show(chipsP[0]);
  }
})();
