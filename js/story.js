/* ==========================================================================
   Story behaviours. No scroll listeners: IntersectionObserver + CSS only.
   Everything degrades to a complete static page without JS.
   ========================================================================== */
(function (global) {
  'use strict';
  var doc = document, root = doc.documentElement;
  root.classList.add('js');
  var reduce = global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var TDS = global.TDS = global.TDS || {};

  /* ---- Reveal on enter (.reveal) --------------------------------------- */
  if ('IntersectionObserver' in global && !reduce) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    $$('.reveal').forEach(function (n) { rio.observe(n); });
  } else {
    $$('.reveal').forEach(function (n) { n.classList.add('is-in'); });
  }

  /* ---- Scrollytelling ---------------------------------------------------
     <section class="scrolly" data-scrolly="name"> ... <div class="step">
     TDS.onStep('name', function (index, stepEl) { chart.update({...}) })   */
  var handlers = {};
  TDS.onStep = function (name, fn) { (handlers[name] = handlers[name] || []).push(fn); };
  $$('[data-scrolly]').forEach(function (sec) {
    var name = sec.getAttribute('data-scrolly'), steps = $$('.step', sec), current = -1;
    var layers = $$('[data-n]', sec);   /* graphic states keyed to steps: data-n="0" or "1 2" */
    function showLayer(i) {
      var hit = layers.filter(function (n) { return n.getAttribute('data-n').split(' ').indexOf(String(i)) > -1; });
      if (hit.length) layers.forEach(function (n) { n.classList.toggle('is-active', hit.indexOf(n) > -1); });
    }
    showLayer(0);
    function activate(i) {
      if (i === current) return;
      current = i;
      steps.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
      showLayer(i);
      (handlers[name] || []).forEach(function (fn) { fn(i, steps[i]); });
      sec.dispatchEvent(new CustomEvent('step', { detail: { index: i, step: steps[i] } }));
    }
    if (!('IntersectionObserver' in global)) return;
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) activate(steps.indexOf(e.target)); });
    }, { rootMargin: '-48% 0px -48% 0px' });
    steps.forEach(function (s) { sio.observe(s); });
    global.addEventListener('load', function () { if (current < 0 && steps.length) activate(0); });
  });

  /* ---- Hero / ambient video: pause control, reduced motion, offscreen --- */
  $$('video[data-ambient]').forEach(function (v) {
    var btn = v.closest('.hero') && v.closest('.hero').querySelector('.hero__toggle');
    function setBtn() {
      if (!btn) return;
      btn.setAttribute('aria-label', v.paused ? 'Play background video' : 'Pause background video');
      btn.innerHTML = v.paused
        ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>'
        : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z"/></svg>';
    }
    var saveData = navigator.connection && navigator.connection.saveData;
    var userPaused = reduce || saveData;   /* poster only for reduced motion and Save-Data */
    if (userPaused) { v.removeAttribute('autoplay'); v.preload = 'none'; v.pause(); }
    if (btn) btn.addEventListener('click', function () {
      if (v.paused) { userPaused = false; v.play(); } else { userPaused = true; v.pause(); }
    });
    v.addEventListener('play', setBtn); v.addEventListener('pause', setBtn); setBtn();
    if ('IntersectionObserver' in global) new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) v.pause(); else if (!userPaused) v.play().catch(function () {}); });
    }, { threshold: 0.15 }).observe(v);
  });

  /* ---- YouTube facade: load the iframe only on click -------------------- */
  $$('[data-youtube]').forEach(function (fig) {
    var btn = fig.querySelector('.video__facade');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var id = fig.getAttribute('data-youtube');
      var f = doc.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      f.title = btn.getAttribute('aria-label') || 'Video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      btn.replaceWith(f);
      f.focus();
    });
  });

  /* ---- Before / after compare ------------------------------------------ */
  $$('[data-compare]').forEach(function (fig) {
    var stage = fig.querySelector('.compare__stage'), range = fig.querySelector('.compare__range');
    if (!stage || !range) return;
    var set = function () { stage.style.setProperty('--pos', range.value + '%'); };
    range.addEventListener('input', set); set();
  });

  /* ---- Copy link (share row) ------------------------------------------- */
  $$('[data-copy-link]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(location.href.split('#')[0]).then(function () {
        var t = b.textContent; b.textContent = 'Link copied';
        setTimeout(function () { b.textContent = t; }, 1800);
      });
    });
  });

  /* ---- Footer year ----------------------------------------------------- */
  $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
})(window);
