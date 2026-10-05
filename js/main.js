/* ==========================================================================
   Pirojpur story: motion scenes.
   Needs js/story.js (TDS.onStep). GSAP + ScrollTrigger are optional: without
   them, or under reduced motion, every scene jumps between the same states
   at each step (no movement, same information).

   Scenes
     opening   hero + P1: letterbox entrance, push-in as the rickshaw comes down the road, 10.6km, Tk 13.23 crore;
               the last card rises to mid-screen before the stage lets go (numbers move up ahead of it on phones)
     projects  eight projects, % view then stacked taka view (P6 to P9)
     roadseq   drone frames crossfade at one spot (P10, P11); then four road photos as a carousel (carousel())
     clique    family tree of the brothers and their firms, then ~375 contracts (P12 to P14)
     cheque    zoom out from Tk 21.42 lakh to Tk 15.04 crore, labels scale with their squares (P23)
     docs      340 documents fade out (P25)
     quote     "Just sign it" word by word (P28)
     accused   27 people regroup by status (P29 to P33)
   ========================================================================== */
(function () {
  'use strict';
  var doc = document, win = window;
  var TDS = win.TDS || {};
  var reduce = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = null, ST = null, animate = false;   /* set in boot, once vendor GSAP has loaded */

  /* ---- helpers ---------------------------------------------------------- */
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function el(tag, cls, parent, html) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    if (parent) parent.appendChild(n);
    return n;
  }
  function css(n, o) { for (var k in o) n.style[k] = o[k]; return n; }
  function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
  function svgEl(tag, attrs, parent) {
    var n = doc.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function isDesk() { return win.innerWidth >= 960; }
  function token(name) { return getComputedStyle(doc.documentElement).getPropertyValue(name).trim(); }
  var C = {};
  function readColors() {
    C.accent = token('--accent') || '#C60001';
    C.ink = token('--text') || '#101828';
    C.rest = token('--s-rest') || '#B0B5BE';
    C.paper = token('--paper') || '#FBFBFA';
    C.mid = token('--gray-6') || '#475467';
    C.axis = token('--axis') || '#8B939F';
  }

  /* Set props instantly. GSAP when present (so tweens read the same values), else plain styles. */
  function set(target, p) {
    if (G) { G.set(target, p); return; }
    var list = target && target.nodeType ? [target] : target || [];
    var keys = ['xPercent', 'x', 'y', 'scale', 'scaleX', 'scaleY'];
    for (var i = 0; i < list.length; i++) {
      var s = list[i].style, tf = list[i]._tf || (list[i]._tf = {}), touched = false;
      keys.forEach(function (k) { if (p[k] != null) { tf[k] = p[k]; touched = true; } });   /* merge, like GSAP */
      if (touched) {
        var sc = tf.scale != null ? tf.scale : 1;
        s.transform = 'translate(' + (tf.xPercent != null ? tf.xPercent + '%' : (tf.x || 0) + 'px') + ',' + (tf.y || 0) + 'px) ' +
          'scale(' + (tf.scaleX != null ? tf.scaleX : sc) + ',' + (tf.scaleY != null ? tf.scaleY : sc) + ')';
      }
      if (p.opacity != null) s.opacity = p.opacity;
      if (p.backgroundColor) s.backgroundColor = p.backgroundColor;
      if (p.borderColor) s.borderColor = p.borderColor;
      if (p.stroke) s.stroke = p.stroke;
      if (p.strokeDashoffset != null) s.strokeDashoffset = p.strokeDashoffset;
    }
  }
  function applyList(list) { (list || []).forEach(function (it) { set(it[0], it[1]); }); }

  /* ---- step-aligned scrub ------------------------------------------------
     The transition into state i plays while card i rises from the bottom of
     the screen until its top is at 72% of the height, so on phones the
     graphic above it is clear when the state completes, scrubbed to the scroll (reversible).
     Without animation, TDS.onStep jumps to the state of the active card.     */
  var stepFns = {}, lastStep = {};
  function hookSteps(name) {
    if (name in stepFns) return;
    stepFns[name] = null;
    if (TDS.onStep) TDS.onStep(name, function (i) { lastStep[name] = i; if (stepFns[name]) stepFns[name](i); });
  }
  function stepWindows(wrap) {
    var vh = win.innerHeight, top = wrap.getBoundingClientRect().top;
    return $$('.step__card', wrap).map(function (c) {
      var t = c.getBoundingClientRect().top - top;   /* card top, measured from the wrap */
      var a = Math.max(0, t - vh * 0.6), b = Math.max(a + 40, t - vh * 0.22);
      return { a: a, b: b };
    });
  }
  function runSteps(name, wrap, init, steps) {
    function upTo(i) { applyList(init); for (var k = 0; k <= i && k < steps.length; k++) applyList(steps[k]); }
    if (!animate) {
      hookSteps(name);
      stepFns[name] = upTo;
      var cur = $$('.step', wrap).map(function (st) { return st.classList.contains('is-active'); }).indexOf(true);
      upTo(lastStep[name] != null ? lastStep[name] : cur > -1 ? cur : steps.length - 1);
      return function () { stepFns[name] = null; };
    }
    applyList(init);
    var wins = stepWindows(wrap), H = wrap.offsetHeight;
    var tl = G.timeline({ paused: true });
    steps.forEach(function (list, i) {
      var w = wins[Math.min(i, wins.length - 1)], d = w.b - w.a;
      (list || []).forEach(function (it) {
        var o = it[2] || {};
        var vars = assign({ duration: d * (o.span || 1), ease: o.ease || 'power2.inOut' }, it[1]);
        if (o.stagger) {
          vars.stagger = { amount: d * o.stagger, from: o.from || 'start' };
          vars.duration = d * (o.span || Math.max(0.1, 1 - o.stagger - (o.at || 0)));
        }
        tl.to(it[0], vars, w.a + d * (o.at || 0));
      });
    });
    tl.set({}, {}, H);
    var st = ST.create({ trigger: wrap, start: 'top 50%', end: 'bottom 50%', scrub: 0.6, animation: tl });
    return function () { st.kill(); tl.kill(); };
  }

  /* ======================================================================
     A. Opening: hero + P1 on one photo stage
        Photos 15 and 16 are one burst; 16 is aligned to 15. The letterbox
        entrance is CSS (index.html opens it once the first frame is in).
        On scroll, one continuous camera move: a slow push-in on the
        rickshaw while 15 dissolves into 16, so the auto-rickshaw comes
        down the road; the headline lifts away; "10.6km" lands on the
        road; then the photo drains to grey as "Tk 13.23 crore" and the
        paid bar arrive. Without GSAP or under reduced motion the same
        three states switch with the cards.
     ====================================================================== */
  function loadDeferred() {
    $$('.opening [data-defer] source, .opening [data-defer] img').forEach(function (n) {
      var ss = n.getAttribute('data-srcset'), src = n.getAttribute('data-src');
      if (ss) { n.setAttribute('srcset', ss); n.removeAttribute('data-srcset'); }
      if (src) { n.setAttribute('src', src); n.removeAttribute('data-src'); }
    });
  }

  var openingHooked = false;
  function sceneOpening() {
    var sec = $('.opening');
    if (!sec) return null;
    var zoom = $('.opening__zoom', sec), frames = $$('.opening__frame', sec);   /* 15, 16, 16 drained */
    var hero = $('.opening__hero', sec), body = $('.hero__body', hero);
    var scrim = $('.opening__scrim', sec), shade = $('.opening__shade', sec);
    var km = $('.opening__n--km', sec), tk = $('.opening__n--tk', sec);
    var meter = $('.opening__meter', sec), fill = $('.meter__fill', meter), cards = $$('.step__card', sec);
    var figs = $('.opening__figures', sec), liftShade = $('.opening__lift', sec);
    var vh = win.innerHeight, paid = 13.23 / 15.92;
    var init = [[body, { opacity: 1, y: 0 }], [scrim, { opacity: 1 }], [frames.slice(1), { opacity: 0 }], [shade, { opacity: 0 }],
      [[km, tk], { opacity: 0, y: 30 }], [meter, { opacity: 0, y: 16 }], [fill, { scaleX: 0 }], [zoom, { scale: 1 }],
      [figs, { y: 0 }], [liftShade, { opacity: 0 }]];
    applyList(init);

    /* The last card rises to about the middle of the screen before the stage lets go (CSS spacer after it).
       Where it shares a column with the numbers (below 960px), they move up ahead of it, as if it pushed
       them, so they never sit under the card. lift = how far, from = the scroll point where it starts. */
    var top0 = sec.getBoundingClientRect().top + win.pageYOffset;
    function at(n) { return n.getBoundingClientRect().top + win.pageYOffset - top0; }
    var c1 = at(cards[1]), END = sec.offsetHeight - vh;
    var cr = cards[1].getBoundingClientRect(), fr = figs.getBoundingClientRect();
    var figTop = figs.offsetTop, figBot = figTop + figs.offsetHeight, room = 20;
    var from = c1 - figBot - room, lift = 0;
    if (cr.left < fr.right && cr.right > fr.left) lift = Math.max(0, Math.min(END - from, figTop - 24));

    if (!animate) {                       /* hero, card 1, card 2: same states, switched with the cards */
      var states = [
        [[body, { opacity: 0 }], [scrim, { opacity: 0.4 }], [[frames[1], shade], { opacity: 1 }], [km, { opacity: 1, y: 0 }]],
        [[body, { opacity: 0 }], [scrim, { opacity: 0.4 }], [frames.slice(1).concat(shade), { opacity: 1 }], [[tk, meter], { opacity: 1, y: 0 }],
          [fill, { scaleX: paid }], [figs, { y: -lift }], [liftShade, { opacity: lift ? 1 : 0 }]]
      ];
      var show = function (i) { applyList(init); if (i >= 0) applyList(states[i]); };
      var heroUp = function () { var r = hero.getBoundingClientRect(); return r.bottom > vh * 0.5; };
      if (!openingHooked) {
        openingHooked = true;
        if (TDS.onStep) TDS.onStep('road', function (i) { if (!animate) show(heroUp() ? -1 : i); });
        /* The kit activates card 1 on load, while the hero is still up, and won't fire it again:
           so the hero leaving the middle of the screen shows the active card's state. */
        if ('IntersectionObserver' in win) new IntersectionObserver(function (es) {
          var e = es[es.length - 1];
          if (animate) return;
          if (e.isIntersecting) show(-1);
          else if (e.boundingClientRect.top < 0) show(Math.max(0, $$('.step', sec).map(function (s) { return s.classList.contains('is-active'); }).indexOf(true)));
        }, { rootMargin: '-48% 0px -48% 0px' }).observe(hero);
      }
      var cur = $$('.step', sec).map(function (s) { return s.classList.contains('is-active'); }).indexOf(true);
      show(heroUp() ? -1 : cur);
      return null;
    }

    /* positions on the scroll, in px from the top of the section */
    var c0 = at(cards[0]);
    var E0 = c0 - vh, P0 = c0 - vh * 0.72, E1 = c1 - vh, P1 = c1 - vh * 0.72;   /* card enters / its state is complete */
    var d1 = P1 - E1;
    var tl = G.timeline({ paused: true });
    function to(t, vars, a, b, ease) { vars.duration = Math.max(1, b - a); vars.ease = ease || 'none'; tl.to(t, vars, a); }
    function rise(t, vars, a, b) { tl.to(t, assign({ opacity: 1, y: 0, duration: Math.max(1, b - a), ease: 'power2.out' }, vars || {}), a); }

    /* the camera: one continuous push-in on the rickshaw, from the hero to the second card */
    to(zoom, { scale: 1.22 }, 0, END, 'sine.inOut');
    /* the headline lifts away as the page starts to move */
    to(body, { opacity: 0, y: -vh * 0.06 }, vh * 0.04, vh * 0.5, 'sine.inOut');
    to(scrim, { opacity: 0.35 }, 0, vh * 0.75, 'sine.inOut');
    /* the auto-rickshaw comes down the road: 15 to 16 */
    to(frames[1], { opacity: 1 }, vh * 0.28, vh * 0.5, 'sine.inOut');
    /* "10.6km" lands on the road */
    to(shade, { opacity: 1 }, E0 + vh * 0.04, P0, 'sine.inOut');
    rise(km, null, E0 + vh * 0.1, P0);
    /* the money: the colour drains, the figure turns to Tk 13.23 crore, the paid bar fills */
    to(frames[2], { opacity: 1 }, E1 - vh * 0.08, P1, 'sine.inOut');
    to(km, { opacity: 0, y: -24 }, E1 + d1 * 0.05, E1 + d1 * 0.4, 'sine.inOut');
    rise(tk, null, E1 + d1 * 0.35, E1 + d1 * 0.8);
    rise(meter, null, E1 + d1 * 0.55, E1 + d1 * 0.9);
    to(fill, { scaleX: paid }, E1 + d1 * 0.7, Math.min(END, P1 + vh * 0.12), 'power1.inOut');
    /* the last card rises to the middle; on phones the numbers move up ahead of it, the photo darkens behind them */
    if (lift) {
      var L0 = Math.min(Math.max(P1, from), END - 1);
      to(figs, { y: -lift }, L0, END);
      to(liftShade, { opacity: 1 }, L0, L0 + (END - L0) * 0.6, 'sine.inOut');
    }
    tl.set({}, {}, END);
    var st = ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 1, animation: tl });
    return function () { st.kill(); tl.kill(); };
  }

  /* ======================================================================
     B. Eight projects (P6 to P9)
     ====================================================================== */
  var PJ = [
    ['IBRP', 936.70, 996.40, 468.35, 0.50],
    ['BDIRWSP', 693.85, 624.95, 104.07, 0.15],
    ['CAFDRIRP', 325.26, 277.66, 133.35, 0.41],
    ['UHBP', 72.79, 72.71, 36.39, 0.50],
    ['FDDRIRP', 39.91, 39.90, 36.31, 0.91],
    ['VRRP', 30.97, 23.96, 20.44, 0.66],
    ['UTMIDP', 30.00, 25.77, 19.50, 0.65],
    ['CRMIDP', 11.39, 8.04, 7.97, 0.70]
  ].map(function (r) { return { code: r[0], contract: r[1], paid: r[2], work: r[3], prog: r[4] }; });

  function sceneProjects() {
    var sec = $('[data-scrolly="projects"]'), plot = $('#pj-plot');
    if (!sec || !plot) return;
    plot.innerHTML = '';
    var W = plot.clientWidth || 340, desk = isDesk();
    var pitch = 52, bh = 14, lab = 20, top = 24;
    if (!desk) {
      var gr = plot.closest('.scrolly__graphic'), head = plot.getBoundingClientRect().top - gr.getBoundingClientRect().top;
      pitch = Math.max(30, Math.min(42, Math.floor((win.innerHeight * 0.72 - head - top - 10) / PJ.length)));
      bh = pitch >= 38 ? 11 : 9; lab = pitch >= 38 ? 17 : 15;
    }
    var n = PJ.length, PS = 1.1;                       /* % view: 110% of a contract fits the width */
    var sumC = 0, sumW = 0;
    PJ.forEach(function (p) { sumC += p.contract; sumW += p.work; });
    var stackH = Math.round(bh * 2.6), stackY = top + Math.round(n * pitch * 0.42);
    plot.style.height = (top + n * pitch + 6) + 'px';
    var seam = 0.6 / W, fy = bh / stackH;   /* stacked pieces overlap a hair, so the bar reads as one */

    var line = el('div', 'pj__line', plot);
    css(line, { left: (100 / PS) + '%', top: (top - 4) + 'px', height: (n * pitch) + 'px' });
    var lineLab = el('p', 'pj__linelab', plot, 'Contract value');
    css(lineLab, { right: (100 - 100 / PS) + '%', top: '0' });

    var cumC = 0, cumW = 0, cumO = 0;
    var rows = PJ.map(function (p, i) {
      var y = top + i * pitch, r = {};
      r.label = el('div', 'pj__label', plot,
        '<b>' + p.code + '</b><span class="pj__note"><span class="pj__done">' + Math.round(p.prog * 100) + '% done</span>' +
        '<span class="pj__paid">, ' + Math.round(p.paid / p.contract * 100) + '% paid</span></span>');
      css(r.label, { top: y + 'px' });
      r.note = $('.pj__note', r.label);
      r.done = $('.pj__done', r.label);
      r.paidLab = $('.pj__paid', r.label);
      r.shift = r.paidLab.offsetWidth;          /* "% done" sits flush right until "% paid" arrives */
      r.y = y + lab;
      var over = p.paid - p.work;
      r.pct = {
        track: { xPercent: 0, y: r.y, scaleX: 1 / PS, scaleY: fy },
        work: { xPercent: 0, y: r.y, scaleX: p.prog / PS, scaleY: fy },
        over: { xPercent: p.prog / PS * 100, y: r.y, scaleX: (p.paid / p.contract - p.prog) / PS, scaleY: fy }
      };
      r.stack = {
        track: { xPercent: cumC / sumC * 100, y: stackY, scaleX: p.contract / sumC + seam, scaleY: 1 },
        work: { xPercent: cumW / sumC * 100, y: stackY, scaleX: p.work / sumC + seam, scaleY: 1 }
      };
      cumC += p.contract; cumW += p.work; cumO += over;
      return r;
    });
    var sumO = cumO;
    /* layers: all tracks, then all work, then all paid-beyond, so the stacked bar never hides red */
    ['track', 'work', 'over'].forEach(function (k) {
      rows.forEach(function (r) { r[k] = el('div', 'pj__seg pj__seg--' + k, plot); css(r[k], { height: stackH + 'px' }); });
    });
    /* In the stacked view the paid-beyond part is one bar that grows from the end of the work done */
    var overAll = el('div', 'pj__seg pj__seg--over', plot);
    css(overAll, { height: stackH + 'px' });
    var overAllAt = { xPercent: sumW / sumC * 100, y: stackY, scaleY: 1 };

    /* annotations on the IBRP row, swapped in place of its note */
    var alt1 = el('span', 'pj__alt', rows[0].label, 'Paid past the contract value');
    var alt2 = el('span', 'pj__alt', rows[0].label, 'Only half the work done');

    /* stacked view labels */
    var totC = el('p', 'pj__tot', plot, '<b>Combined contract value</b>, Tk 2,141 crore');
    css(totC, { left: '0', top: (stackY - 44) + 'px' });
    var totP = el('p', 'pj__tot pj__tot--end', plot, '<b>Released</b>, Tk 2,069 crore');
    css(totP, { right: (100 - (sumW + sumO) / sumC * 100) + '%', top: (stackY - 24) + 'px' });
    var totW = el('p', 'pj__tot', plot, 'Work done, worth Tk 826.38 crore');
    css(totW, { left: '0', width: (sumW / sumC * 100 - 1.5) + '%', top: (stackY + stackH + 22) + 'px' });
    var brk = el('div', 'pj__bracket', plot);
    css(brk, { left: (sumW / sumC * 100) + '%', width: (sumO / sumC * 100) + '%', top: (stackY + stackH + 6) + 'px' });
    var totO = el('p', 'pj__tot', plot, '<b class="pj__acc">~Tk 1,243 crore</b> paid beyond the work done');
    css(totO, { left: (sumW / sumC * 100) + '%', right: '0', top: (stackY + stackH + 22) + 'px' });

    var subA = $('.pj__sub-a', sec), subB = $('.pj__sub-b', sec);
    var tracks = rows.map(function (r) { return r.track; }), works = rows.map(function (r) { return r.work; });
    var overs = rows.map(function (r) { return r.over; }), labels = rows.map(function (r) { return r.label; });
    function rowEls(i) { var r = rows[i]; return [r.label, r.track, r.work, r.over]; }
    function others(i) { var a = []; rows.forEach(function (r, j) { if (j !== i) a = a.concat(rowEls(j)); }); return a; }
    var stackLabels = [totC, totW], endLabels = [totP, brk, totO];

    var dones = rows.map(function (r) { return r.done; }), paidLabs = rows.map(function (r) { return r.paidLab; });
    var init = [[subB, { opacity: 0 }], [subA, { opacity: 1 }], [[alt1, alt2], { opacity: 0 }], [stackLabels.concat(endLabels), { opacity: 0 }],
      [paidLabs, { opacity: 0 }], [overAll, assign({ scaleX: 0.0001, opacity: 0 }, overAllAt)]];
    rows.forEach(function (r) {
      init.push([r.track, r.pct.track]);
      init.push([r.work, assign(assign({}, r.pct.work), { scaleX: 0.0001 })]);
      init.push([r.over, assign(assign({}, r.pct.over), { scaleX: 0.0001, opacity: 1 })]);
      init.push([rowEls(rows.indexOf(r)).slice(0, 1), { opacity: 1 }]);
      init.push([r.done, { x: r.shift }]);
    });
    init.push([tracks.concat(works, overs), { opacity: 1 }]);
    init.push([[line, lineLab], { opacity: 1 }]);

    /* step 0: grey grows, labels say only "% done"; step 1: red grows and "% paid" joins each label */
    var s0 = rows.map(function (r, i) { return [r.work, { scaleX: r.pct.work.scaleX }, { at: i * 0.04, span: 0.7 }]; });
    var s1 = rows.map(function (r, i) { return [r.over, { scaleX: r.pct.over.scaleX }, { at: i * 0.04, span: 0.7 }]; })
      .concat([[dones, { x: 0 }, { at: 0.15, span: 0.45 }], [paidLabs, { opacity: 1 }, { at: 0.3, span: 0.45 }]]);
    var s2 = [[others(0), { opacity: 0.18 }], [rows[0].note, { opacity: 0 }], [alt1, { opacity: 1 }]];
    var s3 = [[alt1, { opacity: 0 }, { span: 0.5 }], [alt2, { opacity: 1 }, { at: 0.5, span: 0.5 }]];
    var s4 = [[alt2, { opacity: 0 }, { span: 0.5 }], [rows[0].note, { opacity: 1 }, { at: 0.4, span: 0.6 }],
      [rowEls(0), { opacity: 0.18 }], [rowEls(1), { opacity: 1 }]];
    var s5 = [
      [labels.concat([line, lineLab]), { opacity: 0 }, { span: 0.35 }],
      [tracks.concat(works), { opacity: 1 }, { span: 0.2 }],
      [overs, { opacity: 0 }, { span: 0.25 }],
      [subA, { opacity: 0 }, { span: 0.3 }], [subB, { opacity: 1 }, { at: 0.3, span: 0.4 }],
      [stackLabels, { opacity: 1 }, { at: 0.75, span: 0.25 }]
    ];
    rows.forEach(function (r) {
      s5.push([r.track, r.stack.track, { at: 0.2, span: 0.6 }]);
      s5.push([r.work, r.stack.work, { at: 0.2, span: 0.6 }]);
    });
    var s6 = [[overAll, { opacity: 1 }, { span: 0.05 }], [overAll, { scaleX: sumO / sumC }, { span: 0.6 }], [endLabels, { opacity: 1 }, { at: 0.55, span: 0.4 }]];

    return runSteps('projects', $('.scrolly__steps', sec), init, [s0, s1, s2, s3, s4, s5, s6]);
  }

  /* ======================================================================
     C. Road sequence: drone frames from one spot (P10, P11)
     ====================================================================== */
  function sceneRoadSeq() {
    var sec = $('.roadseq');
    if (!sec || !animate) return;           /* CSS shows the first frame */
    var frames = $$('.roadseq__frame', sec);
    var tl = G.timeline({ scrollTrigger: { trigger: $('.roadseq__steps', sec), start: 'top top', end: 'bottom bottom', scrub: 0.8 } });
    tl.to(frames[1], { opacity: 1, duration: 0.1, ease: 'none' }, 0.16)
      .to(frames[2], { opacity: 1, duration: 0.1, ease: 'none' }, 0.46)
      .to(frames[3], { opacity: 1, duration: 0.1, ease: 'none' }, 0.74)
      .set({}, {}, 1);
  }

  /* ======================================================================
     D. The clique (P12 to P14): a family tree of the four brothers,
        Merajul Islam's wife and their eight firms, then the ~375 contracts.
        The whole tree sits faint. Each card colours the people and firms it
        names (red while it speaks of them, ink after) and draws the lines
        that join them. Wide: the brothers in a row under one bar, firms
        hanging below. Narrow: the brothers down one line, firms indented.
        Centred in the space above the cards.
     ====================================================================== */
  var PEOPLE = [
    ['Mohiuddin Maharaj', 'Former Pirojpur-2 MP'],
    ['Merajul Islam', 'Brother'],
    ['Shamima Akhter', 'Merajul’s wife'],
    ['Md Shamsuddin', 'Brother'],
    ['Mohammad Salahuddin', 'Brother']
  ];
  var FIRMS = [            /* name, owner (index in PEOPLE) */
    ['Horinpala Trade International', 0],
    ['EFTE. ETCL (Pvt.) Limited', 1],
    ['EFTE Enterprise', 1],
    ['EFTE Trading Corporation Limited', 1],
    ['South Bangla Trading Limited', 1],
    ['Shimu Enterprise', 2],
    ['M/S Teli Khali Construction', 3],
    ['Ishan Enterprises', 4]
  ];
  /* What each of the first four cards names: people, firms, family lines */
  var FOCUS = [
    { p: [0, 1], f: [1], l: ['sibA'] },
    { p: [1], f: [1, 2, 3, 4], l: [] },
    { p: [0, 2], f: [5, 0], l: ['wed'] },
    { p: [3, 4], f: [6, 7], l: ['sibB'] }
  ];

  function treeLayout(box, W, wide, compact) {
    box.innerHTML = '';
    box.classList.toggle('net--wide', wide);
    box.classList.toggle('net--compact', compact);
    var graph = el('div', 'net__graph', box);
    var svg = svgEl('svg', { 'aria-hidden': 'true', focusable: 'false' }, graph);
    var gBase = svgEl('g', {}, svg), gInk = svgEl('g', {}, svg);
    var head = el('p', 'net__head', graph, 'Brothers');
    var P = PEOPLE.map(function (p) {
      return { dot: el('i', 'net__dot', graph),
        txt: el('div', 'net__person', graph, '<p class="net__name">' + p[0] + '</p><p class="net__role">' + p[1] + '</p>') };
    });
    var F = FIRMS.map(function (f) { return { o: f[1], sq: el('i', 'net__sq', graph), txt: el('p', 'net__firm', graph, f[0]) }; });
    var R = P[0].dot.offsetWidth / 2, S = F[0].sq.offsetWidth;
    var d = {};
    function at(n, x, y) { n.style.left = Math.round(x) + 'px'; n.style.top = Math.round(y) + 'px'; }
    function dot(i, x, y) { at(P[i].dot, x - R, y - R); P[i].x = x; P[i].y = y; }
    function firstLine(n) { return parseFloat(getComputedStyle(n).lineHeight) || 16; }
    /* one firm under its owner's line at x = sx; returns the bottom of the row */
    function firmRow(j, sx, y, w) {
      var f = F[j];
      f.txt.style.width = Math.max(64, w - 24) + 'px';
      at(f.txt, sx + 24, y);
      f.sx = sx; f.yc = y + Math.round(firstLine(f.txt) / 2);
      at(f.sq, sx + 10, f.yc - S / 2);
      return y + f.txt.offsetHeight;
    }
    var H;
    if (wide) {
      var colW = W / 5, cx = P.map(function (p, i) { return Math.round(i * colW + R + 1); });
      var yBar = 28, yDot = 56, yTop = yDot - R - 3, gap = compact ? 6 : 10;
      at(head, 0, 0);
      P.forEach(function (p, i) {
        dot(i, cx[i], yDot);
        p.txt.style.width = Math.floor(colW - 14) + 'px';
        at(p.txt, cx[i] - R, yDot + R + 9);
        p.bot = yDot + R + 9 + p.txt.offsetHeight;
      });
      var yF = Math.max.apply(null, P.map(function (p) { return p.bot; })) + (compact ? 20 : 28);
      var cur = P.map(function () { return yF; });
      F.forEach(function (f, j) { cur[f.o] = firmRow(j, cx[f.o], cur[f.o], colW - 12) + gap; });
      d.sibA = ['M' + cx[0] + ' ' + yTop + ' V' + (yBar + 6) + ' Q' + cx[0] + ' ' + yBar + ' ' + (cx[0] + 6) + ' ' + yBar + ' H' + cx[1] + ' V' + yTop];
      d.sibB = ['M' + cx[1] + ' ' + yBar + ' H' + cx[3] + ' V' + yTop +
        ' M' + cx[3] + ' ' + yBar + ' H' + (cx[4] - 6) + ' Q' + cx[4] + ' ' + yBar + ' ' + cx[4] + ' ' + (yBar + 6) + ' V' + yTop];
      d.wed = [-2, 2].map(function (o) { return 'M' + (cx[1] + R + 5) + ' ' + (yDot + o) + ' H' + (cx[2] - R - 5); });
      H = Math.max.apply(null, cur) - gap;
    } else {
      var x0 = R + 1, tx = 22, y = 24, gapB = compact ? 8 : 14, gapF = compact ? 2 : 5;
      at(head, 0, 0);
      [0, 1, 3, 4].forEach(function (i) {
        var t = P[i].txt;
        at(t, tx, y);
        var cy0 = y + Math.round(t.firstChild.offsetHeight / 2);
        dot(i, x0, cy0);
        P[i].bot = y + t.offsetHeight;
        var cy = P[i].bot + 4;
        if (i === 1) {      /* Merajul Islam and his wife side by side, joined by a double line */
          var mw = t.offsetWidth, xs = tx + mw + 32, ts = P[2].txt;
          dot(2, xs, cy0);
          at(ts, xs + 14, y);
          P[2].bot = y + ts.offsetHeight;
          d.wed = [-2, 2].map(function (o) { return 'M' + (tx + mw + 6) + ' ' + (cy0 + o) + ' H' + (xs - R - 4); });
          cy = Math.max(cy, firmRow(5, xs + 20, P[2].bot + 4, W - xs - 20) + 6);
        }
        F.forEach(function (f, j) { if (f.o === i) cy = firmRow(j, tx + 6, cy, W - tx - 6) + gapF; });
        y = cy + gapB;
      });
      d.sibA = ['M' + x0 + ' ' + (P[0].y + R + 3) + ' V' + (P[1].y - R - 3)];
      d.sibB = ['M' + x0 + ' ' + (P[1].y + R + 3) + ' V' + (P[3].y - R - 3) + ' M' + x0 + ' ' + (P[3].y + R + 3) + ' V' + (P[4].y - R - 3)];
      H = y - gapB - gapF;
    }
    F.forEach(function (f, j) {      /* ownership: down the owner's line, then into the firm's square */
      d['f' + j] = ['M' + f.sx + ' ' + (P[f.o].bot + 5) + ' V' + (f.yc - 5) + ' Q' + f.sx + ' ' + f.yc + ' ' + (f.sx + 5) + ' ' + f.yc + ' H' + (f.sx + 8)];
    });
    var foot = el('p', 'net__foot', graph, 'Lines show who owns each firm, according to an investigation by the Anti-Corruption Commission.');
    foot.style.width = W + 'px';
    at(foot, 0, H + 18);
    H += 18 + foot.offsetHeight;
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    var L = {};
    Object.keys(d).forEach(function (k) {
      L[k] = d[k].map(function (path) {
        svgEl('path', { d: path, 'class': 'net__line net__line--base' }, gBase);
        var q = svgEl('path', { d: path, 'class': 'net__line' }, gInk);
        q.len = Math.ceil(q.getTotalLength ? q.getTotalLength() : W) + 1;
        q.style.strokeDasharray = q.len + ' ' + q.len;
        return q;
      });
    });
    return { graph: graph, head: head, P: P, F: F, L: L, H: H };
  }

  function sceneClique() {
    var sec = $('[data-scrolly="clique"]'), box = $('#net');
    if (!sec || !box) return;
    box.style.marginTop = '';
    var W = box.clientWidth || 340, vh = win.innerHeight, wide = W >= 640;
    var gr = box.closest('.scrolly__graphic');
    var room = Math.round(vh * 0.72) - (parseFloat(getComputedStyle(gr).paddingTop) || 0) - 16;   /* above a card whose state is complete */
    var T = treeLayout(box, W, wide, false);
    if (T.H > room) T = treeLayout(box, W, wide, true);
    var P = T.P, F = T.F, L = T.L;

    /* --- the ~375 contracts ---------------------------------------------- */
    var units = el('div', 'net__units', box);
    var uHead = el('p', 'net__uhead', units, '<b>~375 contracts</b> won by M/S Teli Khali Construction and EFTE. ETCL (Pvt.) Limited from Pirojpur LGED, worth more than Tk 1,000 crore');
    var grid = el('div', 'net__grid', units);
    var legend = el('p', 'net__legend', units, '<b class="net__acc">~200</b> with no other bidder');
    var cols = 25, rows = 15, gap = wide ? 4 : 3, gW = Math.min(W, 620);
    units.style.width = gW + 'px';
    var fixed = uHead.offsetHeight + legend.offsetHeight + 28;
    var cell = Math.max(6, Math.min(Math.floor((gW - (cols - 1) * gap) / cols), Math.floor((room - fixed + gap) / rows) - gap));
    gW = cols * cell + (cols - 1) * gap;
    css(units, { width: gW + 'px', left: Math.round((W - gW) / 2) + 'px' });
    css(grid, { gridTemplateColumns: 'repeat(' + cols + ', ' + cell + 'px)', gridAutoRows: cell + 'px', gap: gap + 'px' });
    var cells = [];
    for (var i = 0; i < 375; i++) cells.push(el('i', '', grid));
    var red = cells.slice(0, 200);
    var H = Math.max(T.H, units.offsetHeight);
    box.style.height = H + 'px';
    T.graph.style.top = Math.round((H - T.H) / 2) + 'px';
    units.style.top = Math.round((H - units.offsetHeight) / 2) + 'px';
    box.style.marginTop = Math.max(0, Math.round((room - H) / 2)) + 'px';

    /* --- states: 0 faint, 1 in focus (red), 2 named earlier (ink) --------- */
    function first(kind, id) { for (var k = 0; k < FOCUS.length; k++) if (FOCUS[k][kind].indexOf(id) > -1) return k; return 99; }
    function stateAt(kind, id, s) { return s < first(kind, id) ? 0 : FOCUS[s][kind].indexOf(id) > -1 ? 1 : 2; }
    var markAt = [{ backgroundColor: C.paper, borderColor: C.rest }, { backgroundColor: C.accent, borderColor: C.accent }, { backgroundColor: C.ink, borderColor: C.ink }];
    var textAt = [{ opacity: 0.34 }, { opacity: 1 }, { opacity: 1 }];
    function lineAt(q, st) { return st === 0 ? { strokeDashoffset: q.len, stroke: C.accent } : { strokeDashoffset: 0, stroke: st === 1 ? C.accent : C.axis }; }
    var items = P.map(function (p, i) { return { kind: 'p', id: i, mark: p.dot, txt: p.txt, lines: [] }; })
      .concat(F.map(function (f, j) { return { kind: 'f', id: j, mark: f.sq, txt: f.txt, lines: L['f' + j] }; }))
      .concat([{ kind: 'l', id: 'sibA', txt: T.head, lines: L.sibA }, { kind: 'l', id: 'sibB', lines: L.sibB }, { kind: 'l', id: 'wed', lines: L.wed }]);
    var marks = [], texts = [], lines = [];
    items.forEach(function (it) { if (it.mark) marks.push(it.mark); if (it.txt) texts.push(it.txt); lines = lines.concat(it.lines); });

    var init = [[[T.graph], { opacity: 1 }], [marks.concat(lines), { opacity: 1 }],
      [[units], { opacity: 0 }], [cells, { opacity: 0, backgroundColor: C.rest }], [[legend], { opacity: 0 }]];
    items.forEach(function (it) {
      if (it.mark) init.push([it.mark, markAt[0]]);
      if (it.txt) init.push([it.txt, textAt[0]]);
      it.lines.forEach(function (q) { init.push([q, lineAt(q, 0)]); });
    });
    var steps = FOCUS.map(function (fc, s) {
      var list = [];
      items.forEach(function (it) {
        var a = s ? stateAt(it.kind, it.id, s - 1) : 0, b = stateAt(it.kind, it.id, s);
        if (a === b) return;
        var o = b === 1 ? { at: 0.25, span: 0.55 } : { span: 0.45 };     /* the old focus settles, then the new one lights */
        if (it.mark) list.push([it.mark, markAt[b], o]);
        if (it.txt) list.push([it.txt, textAt[b], o]);
        it.lines.forEach(function (q) { list.push([q, lineAt(q, b), a === 0 ? { at: 0.1, span: 0.75 } : o]); });
      });
      return list;
    });
    /* P14: the two firms behind ~375 contracts, then the contracts themselves */
    var keep = [F[1].sq, F[1].txt, F[6].sq, F[6].txt].concat(L.f1, L.f6);
    var dim = marks.concat(texts, lines).filter(function (n) { return keep.indexOf(n) < 0; });
    steps.push([
      [dim, { opacity: 0.14 }, { span: 0.3 }],
      [[F[1].sq, F[6].sq], markAt[1], { span: 0.3 }],
      [L.f1.concat(L.f6), { stroke: C.accent }, { span: 0.3 }],
      [[T.graph], { opacity: 0 }, { at: 0.42, span: 0.2 }],
      [[units], { opacity: 1 }, { at: 0.5, span: 0.15 }],
      [cells, { opacity: 1 }, { at: 0.5, stagger: 0.4, span: 0.1 }]
    ]);
    steps.push([[red, { backgroundColor: C.accent }, { stagger: 0.6, span: 0.25 }], [[legend], { opacity: 1 }, { at: 0.6, span: 0.4 }]]);
    return runSteps('clique', $('.scrolly__steps', sec), init, steps);
  }

  /* ======================================================================
     F. The cheque: pull back from Tk 21.42 lakh to Tk 15.04 crore (P23)
     ====================================================================== */
  function sceneCheque() {
    var fig = $('#cheque');
    if (!fig || !animate) return;           /* CSS holds the final, labelled layout */
    var zoom = $('.cheque__zoom', fig), stage = $('.cheque__stage', fig);
    var labZ = $('.cheque__lab--zoom', fig), labBig = $('.cheque__lab--big', fig), labSmall = $('.cheque__lab--small', fig);
    var k = Math.sqrt(1504 / 21.42), ease = 'power2.inOut';   /* side ratio of two squares with areas in that ratio */
    G.set(zoom, { scale: k }); G.set(labZ, { scale: 1, opacity: 1 }); G.set(labBig, { scale: 0.32, opacity: 0 }); G.set(labSmall, { opacity: 0 });
    /* The three scale tweens share position, length and ease, so the labels stay locked to their squares:
       the contract label shrinks with the contract square, the cheque figure grows as the red square opens. */
    G.timeline({ scrollTrigger: { trigger: stage, start: 'top 75%', end: 'bottom 45%', scrub: 0.6 } })
      .to(zoom, { scale: 1, duration: 0.64, ease: ease }, 0.12)
      .to(labZ, { scale: 1 / k, duration: 0.64, ease: ease }, 0.12)
      .to(labZ, { opacity: 0, duration: 0.07, ease: 'none' }, 0.48)
      .to(labBig, { scale: 1, duration: 0.64, ease: ease }, 0.12)
      .to(labBig, { opacity: 1, duration: 0.1, ease: 'none' }, 0.28)
      .to(labSmall, { opacity: 1, duration: 0.12 }, 0.8);
  }

  /* ======================================================================
     G. 340 documents fade out, leaving outlines (P25)
     ====================================================================== */
  var docFills = [];
  function buildDocs() {          /* built at once so the page height never shifts */
    var grid = $('#docs-grid');
    if (!grid) return;
    var frag = doc.createDocumentFragment();
    for (var i = 0; i < 340; i++) { var d = el('span', 'doc'); docFills.push(el('i', '', d)); frag.appendChild(d); }
    grid.appendChild(frag);
  }
  function sceneDocs() {
    var grid = $('#docs-grid'), fills = docFills;
    if (!grid || !fills.length) return;
    if (!animate) { set(fills, { opacity: 0 }); return; }
    G.timeline({ scrollTrigger: { trigger: grid, start: 'top 70%', end: 'bottom 40%', scrub: 0.5 } })
      .to(fills, { opacity: 0, duration: 0.25, ease: 'none', stagger: { amount: 0.75, from: 'random' } }, 0);
  }

  /* ======================================================================
     Quote: "Just sign it", word by word (P28)
     ====================================================================== */
  function sceneQuote() {
    var p = $('#sign-quote blockquote p');
    if (!p || !animate) return;
    var words = p.textContent.split(' ');
    p.textContent = '';
    words.forEach(function (w, i) {
      el('span', 'w', p).textContent = w;
      if (i < words.length - 1) p.appendChild(doc.createTextNode(' '));
    });
    /* Words dim only once the quote is just below the screen, so it never sits dimmed in view. */
    G.fromTo($$('.w', p), { opacity: 0.16 }, {
      opacity: 1, ease: 'none', stagger: 0.12, immediateRender: false,
      scrollTrigger: { trigger: p, start: 'top 102%', end: 'bottom 50%', scrub: 0.4 }
    });
  }

  /* ======================================================================
     H. 27 accused regroup (P29 to P33)
     ====================================================================== */
  function sceneAccused() {
    var sec = $('[data-scrolly="accused"]'), box = $('#acc');
    if (!sec || !box) return;
    box.innerHTML = '';
    var W = box.clientWidth || 340, desk = isDesk();
    var s = desk ? 28 : 26, g = 6, u = s + g;
    var cols = Math.max(6, Math.min(11, Math.floor((W + g) / u)));
    var yLab1 = 0, yRow1 = 26, yAnn = yRow1 + s + 10, yLab2 = yAnn + (desk ? 64 : W < 360 ? 96 : 76), yGrid = yLab2 + (desk ? 28 : 44);
    box.style.height = (yGrid + 2 * u + 8) + 'px';

    var sq = [];
    for (var i = 0; i < 27; i++) { var q = el('i', 'acc__sq', box); css(q, { width: s + 'px', height: s + 'px' }); sq.push(q); }
    var fam = sq.slice(0, 5), off = sq.slice(5), died = sq[5], bail = sq.slice(6, 11), rest = fam.concat(sq.slice(11));

    function row(arr, x0, y) { return arr.map(function (n, j) { return [n, { x: x0 + j * u, y: y }]; }); }
    function grid(arr, y) { return arr.map(function (n, j) { return [n, { x: (j % cols) * u, y: y + Math.floor(j / cols) * u }]; }); }
    function lab(html, x, y, w) { var n = el('p', 'acc__lab', box, html); css(n, { left: x + 'px', top: y + 'px', width: (w || W - x) + 'px' }); return n; }

    var lFam = lab('<strong>Mohiuddin Maharaj and family</strong>, 5', 0, yLab1);
    var lAnn = lab('The ACC says the money moved mainly through their eight firms', 0, yAnn);
    var lOff = lab('<strong>Officials of the local LGED and District Accounts Office</strong>, 22', 0, yLab2);
    var lArr = lab('<strong>Arrested</strong>, 6', 0, yLab1);
    var lOther = lab('<strong>The other 21</strong>', 0, yLab2);
    var diedX = 5 * u + 22;
    var lBail = lab('Out on bail, 5 officials from the Accounts Office', 0, yAnn, diedX - 30);
    var lDied = lab('Died in jail: AKM Mozammel Hoque Khan, accounts officer, LGED Pirojpur', diedX, yAnn);
    var lFug = lab('<strong class="acc__acc">Fugitives</strong>, the other 21', 0, yLab2);
    var labs = [lFam, lAnn, lOff, lArr, lOther, lBail, lDied, lFug];
    function only(keep) { return labs.map(function (l) { return [l, { opacity: keep.indexOf(l) > -1 ? 1 : 0 }, { span: 0.6, at: keep.indexOf(l) > -1 ? 0.4 : 0 }]; }); }
    function fill(arr, c) { return [arr, { backgroundColor: c, borderColor: c }, { span: 0.6 }]; }
    function move(list) { return list.map(function (it) { return [it[0], it[1], { span: 0.8 }]; }); }

    var L0 = row(fam, 0, yRow1).concat(grid(off, yGrid));
    var init = [[sq, { opacity: 0 }], [fam, { backgroundColor: C.ink, borderColor: C.ink }], [off, { backgroundColor: C.rest, borderColor: C.rest }]]
      .concat(L0).concat(labs.map(function (l) { return [l, { opacity: 0 }]; }));
    var s0 = [[sq, { opacity: 1 }, { stagger: 0.55, span: 0.25 }], [[lFam, lOff], { opacity: 1 }, { span: 0.5 }]];
    var s1 = [fill(fam, C.accent)].concat(only([lFam, lAnn, lOff]));
    var s2 = move(row([died].concat(bail), 0, yRow1).concat(grid(rest, yGrid)))
      .concat([fill([died].concat(bail), C.ink), fill(rest, C.rest)]).concat(only([lArr, lOther]));
    var s3 = move(row(bail, 0, yRow1).concat([[died, { x: diedX, y: yRow1 }]]))
      .concat([[died, { backgroundColor: C.paper, borderColor: C.ink }, { span: 0.6 }]]).concat(only([lArr, lOther, lBail, lDied]));
    var s4 = [fill(rest, C.accent)].concat(only([lArr, lBail, lDied, lFug]));
    return runSteps('accused', $('.scrolly__steps', sec), init, [s0, s1, s2, s3, s4]);
  }

  /* ---- boot ------------------------------------------------------------
     GSAP (~45 KB gzipped) loads after the page's own load event, so it never
     competes with the hero. Reduced motion skips it. The three layout scenes
     build when they come within a screen and a half.                        */
  var LAZY = [['[data-scrolly="projects"]', sceneProjects], ['[data-scrolly="clique"]', sceneClique], ['[data-scrolly="accused"]', sceneAccused]];
  var kills = {}, killOpening = null;
  function buildScene(i) {
    if (kills[i]) kills[i]();
    readColors();
    kills[i] = LAZY[i][1]() || null;
  }
  function boot() {
    G = win.gsap || null; ST = win.ScrollTrigger || null;
    animate = !!(G && ST) && !reduce;
    if (G && ST) { G.registerPlugin(ST); ST.config({ ignoreMobileResize: true }); }
    readColors();
    killOpening = sceneOpening(); sceneRoadSeq(); sceneCheque(); sceneDocs(); sceneQuote();
    if ('IntersectionObserver' in win) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          buildScene(+e.target.getAttribute('data-lazy'));
          if (ST) ST.refresh();
        });
      }, { rootMargin: '150% 0px' });
      LAZY.forEach(function (l, i) { var n = $(l[0]); if (n) { n.setAttribute('data-lazy', i); io.observe(n); } });
    } else {
      LAZY.forEach(function (l, i) { buildScene(i); });
    }
    var lastW = win.innerWidth, t;
    win.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        if (Math.abs(win.innerWidth - lastW) < 2) return;
        lastW = win.innerWidth;
        if (killOpening) killOpening();
        readColors(); killOpening = sceneOpening();
        Object.keys(kills).forEach(function (i) { buildScene(+i); });
        if (ST) ST.refresh();
      }, 250);
    });
  }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var sc = doc.createElement('script'); sc.src = src; sc.onload = res; sc.onerror = rej; doc.head.appendChild(sc);
    });
  }
  function wait(ms) { return new Promise(function (res) { setTimeout(res, ms); }); }

  /* ---- back to top: appears once the opening has scrolled away -----------
     i.e. its bottom edge has passed the middle of the screen and the next section fills most of it. */
  function toTop() {
    var btn = $('.to-top'), hero = $('.hero'), opening = $('.opening') || hero;
    if (!btn || !hero) return;
    if ('IntersectionObserver' in win) {
      new IntersectionObserver(function (es) {
        var e = es[es.length - 1];
        btn.classList.toggle('is-shown', !e.isIntersecting && e.boundingClientRect.top < 0);
      }, { rootMargin: '-50% 0px 0px 0px' }).observe(opening);
    } else {
      btn.classList.add('is-shown');
    }
    /* Jump to one screen below the top, then glide the last screen. Native smooth scrolling over the
       whole page gets cancelled when a lazy scene builds (ScrollTrigger.refresh) and drags every
       scrubbed scene along on old phones; this loop re-applies its position each frame instead. */
    var stop = false;
    function cancel() { stop = true; }
    win.addEventListener('wheel', cancel, { passive: true });
    win.addEventListener('touchstart', cancel, { passive: true });
    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      var y0 = Math.min(win.pageYOffset, win.innerHeight), t0 = null;
      win.scrollTo(0, y0);
      try { hero.focus({ preventScroll: true }); } catch (x) { /* focus is a nicety */ }
      if (reduce || !win.requestAnimationFrame) { win.scrollTo(0, 0); return; }
      stop = false;
      win.requestAnimationFrame(function frame(t) {
        if (stop) return;
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / 480), e = 1 - Math.pow(1 - k, 3);
        win.scrollTo(0, Math.round(y0 * (1 - e)));
        if (k < 1) win.requestAnimationFrame(frame);
      });
    });
  }
  /* ---- road photos: carousel with a slider under it, no arrows ------------
     Swipe (CSS scroll snap), drag with a mouse, or drag/tap/arrow-key the slider. While the slider or
     the mouse drags, snapping is off so the strip follows exactly; on release it settles on a photo. */
  function carousel() {
    var fig = $('.carousel');
    if (!fig) return;
    var track = $('.carousel__track', fig), slider = $('.carousel__slider', fig), slides = $$('.carousel__slide', fig);
    var n = slides.length, U = 100, scrubbing = false, drag = false, raf = 0, settle = 0;
    function pitch() { return n > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth || 1; }
    function pos() { var x = track.scrollLeft / pitch(), r = Math.round(x); return Math.abs(x - r) < 0.02 ? r : x; }   /* sub-pixel ends */
    function label(i) { slider.setAttribute('aria-valuetext', 'Photo ' + (i + 1) + ' of ' + n); }
    /* snapping comes back only once the strip has come to rest on a photo, so it never jumps */
    function settleLater(ms) {
      clearTimeout(settle);
      settle = setTimeout(function () { if (!scrubbing && !drag) fig.classList.remove('is-scrubbing'); }, ms);
    }
    function go(i, smooth) {
      i = Math.max(0, Math.min(n - 1, i));
      if (smooth && !reduce && track.scrollTo) {
        fig.classList.add('is-scrubbing');
        track.scrollTo({ left: i * pitch(), behavior: 'smooth' });
        settleLater(700);
      } else {
        track.scrollLeft = i * pitch();
        fig.classList.remove('is-scrubbing');
      }
      label(i);
    }
    slider.max = (n - 1) * U;
    track.addEventListener('scroll', function () {
      if (fig.classList.contains('is-scrubbing')) settleLater(150);
      if (scrubbing || raf) return;
      raf = win.requestAnimationFrame(function () { raf = 0; slider.value = Math.round(pos() * U); label(Math.round(pos())); });
    }, { passive: true });
    /* the slider */
    slider.addEventListener('input', function () {
      scrubbing = true;
      fig.classList.add('is-scrubbing');
      track.scrollLeft = slider.value / U * pitch();
      label(Math.round(slider.value / U));
    });
    slider.addEventListener('change', function () { scrubbing = false; go(Math.round(slider.value / U), true); });
    slider.addEventListener('keydown', function (e) {
      var k = e.key, i = Math.round(pos());
      var to = k === 'ArrowRight' || k === 'ArrowUp' || k === 'PageUp' ? i + 1 :
        k === 'ArrowLeft' || k === 'ArrowDown' || k === 'PageDown' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? n - 1 : null;
      if (to === null) return;
      e.preventDefault();
      go(to, true);
    });
    /* mouse drag on the photos (touch already swipes natively) */
    var x0 = 0, s0 = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = true; x0 = e.clientX; s0 = track.scrollLeft;
      fig.classList.add('is-scrubbing', 'is-dragging');
      if (track.setPointerCapture) track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function (e) { if (drag) track.scrollLeft = s0 - (e.clientX - x0); });
    function release(e) {
      if (!drag) return;
      drag = false;
      fig.classList.remove('is-dragging');
      var dx = e.clientX - x0, i = Math.round(s0 / pitch());
      go(Math.abs(dx) > 40 ? i - (dx > 0 ? 1 : -1) : i, true);
    }
    track.addEventListener('pointerup', release);
    track.addEventListener('pointercancel', release);
  }

  toTop();
  carousel();
  buildDocs();
  var fontsReady = doc.fonts && doc.fonts.ready ? Promise.race([doc.fonts.ready, wait(1500)]) : Promise.resolve();
  var pageLoaded = new Promise(function (res) {
    if (doc.readyState === 'complete') res(); else win.addEventListener('load', function () { res(); });
  });
  pageLoaded.then(loadDeferred);      /* frames 2 to 4 of the opening, after everything else */
  var vendor = reduce ? Promise.resolve() : pageLoaded.then(function () {
    return loadScript('vendor/gsap.min.js').then(function () { return loadScript('vendor/ScrollTrigger.min.js'); });
  }).catch(function () { /* no GSAP: scenes jump between states instead */ });
  Promise.all([fontsReady, vendor]).then(boot);
})();
