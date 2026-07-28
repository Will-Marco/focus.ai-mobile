/* ═══════════════════════════════════════════════════════════════════
   Focus AI — taqdimot sahifasi interaktivligi.

   Asosiy g'oya: hero'dagi telefon — rasm emas, ishlaydigan maket.
   Taymer real vaqt belgilariga asoslanadi (ilovadagidek — setInterval
   sanog'iga emas), telefonni ag'darish/burish esa mahsulotning
   signature mexanikasini brauzerda takrorlaydi.
   ═══════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(Math.floor(n)).padStart(2, '0');
  const mmss = s => `${pad(s / 60)}:${pad(s % 60)}`;

  /* ─────────────────  1. Scroll progress + chrome  ───────────────── */

  const bar = $('.progress');
  const brandbar = $('.brandbar');
  const rail = $('.rail');
  let ticking = false;

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if (bar) bar.style.setProperty('--p', p.toFixed(4));
    const past = window.scrollY > window.innerHeight * 0.65;
    brandbar && brandbar.classList.toggle('show', past);
    rail && rail.classList.toggle('show', past);
    ticking = false;
  };
  addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );
  onScroll();

  /* ─────────────────  2. Kursor ortidagi cho'g'  ─────────────────── */

  if (matchMedia('(pointer: fine)').matches && !reduced) {
    document.documentElement.classList.add('has-pointer');
    const spot = $('.spot');
    let tx = innerWidth / 2,
      ty = innerHeight / 2,
      cx = tx,
      cy = ty,
      raf = 0;
    addEventListener(
      'pointermove',
      e => {
        tx = e.clientX;
        ty = e.clientY;
        if (!raf) raf = requestAnimationFrame(loop);
      },
      { passive: true },
    );
    const loop = () => {
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      if (spot) {
        spot.style.setProperty('--sx', cx.toFixed(1) + 'px');
        spot.style.setProperty('--sy', cy.toFixed(1) + 'px');
      }
      raf =
        Math.abs(tx - cx) + Math.abs(ty - cy) > 0.6
          ? requestAnimationFrame(loop)
          : 0;
    };
  }

  /* ─────────────────  3. Reveal animatsiyasi  ────────────────────── */

  const io = new IntersectionObserver(
    entries =>
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  $$('.reveal').forEach(el => io.observe(el));

  /* ─────────────────  4. Bo'lim relsi (o'ng navigatsiya)  ─────────── */

  const navSections = $$('section[id]').filter(s => s.dataset.nav);
  const railLinks = new Map(
    $$('.rail a').map(a => [a.getAttribute('href').slice(1), a]),
  );
  if (navSections.length) {
    const navIO = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          const a = railLinks.get(e.target.id);
          if (!a) return;
          if (e.isIntersecting) {
            railLinks.forEach(l => l.setAttribute('aria-current', 'false'));
            a.setAttribute('aria-current', 'true');
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    navSections.forEach(s => navIO.observe(s));
  }

  /* ─────────────────  5. Bento — kursor yorug'ligi  ──────────────── */

  $$('.tile').forEach(t => {
    t.addEventListener(
      'pointermove',
      e => {
        const r = t.getBoundingClientRect();
        t.style.setProperty('--mx', `${e.clientX - r.left}px`);
        t.style.setProperty('--my', `${e.clientY - r.top}px`);
      },
      { passive: true },
    );
  });

  /* ═════════════  6. INTERAKTIV TELEFON — asosiy qism  ═════════════ */

  const stage = $('#stage');
  if (stage) {
    const device = $('.device', stage);
    const inner = $('.dev-inner', stage);
    const screen = $('.screen', stage);
    const ring = $('#ringFg');
    const elTimer = $('#tmr');
    const elXp = $('#xpv');
    const elAway = $('#awv');
    const elHabit = $('#habitFill');
    const elClock = $('#ckTime');
    const elClockSub = $('#ckSub');
    const elAwayBig = $('#awayBig');

    const GOAL = 25 * 60; // sessiya maqsadi, soniya
    const SPEED = 20; // demo tezligi: 1 real soniya = 20 sessiya soniyasi
    const C = 2 * Math.PI * 82; // halqa uzunligi (r = 82)
    if (ring) {
      ring.style.strokeDasharray = C.toFixed(2);
      ring.style.strokeDashoffset = C.toFixed(2);
    }

    let mode = 'on';
    let elapsed = 0; // sessiya soniyalari
    let away = 0; // telefonsiz o'tgan soniyalar
    let xp = 0;
    let last = performance.now();
    let touched = false; // foydalanuvchi aralashdimi
    let autoTimer = 0;

    const setMode = next => {
      if (mode === next) return;
      mode = next;
      stage.dataset.mode = next;
      $$('.seg button', stage).forEach(b =>
        b.setAttribute('aria-pressed', String(b.dataset.mode === next)),
      );
    };

    /* Foydalanuvchi aralashsa — avtomatik demo to'xtaydi */
    const markTouched = () => {
      if (touched) return;
      touched = true;
      clearTimeout(autoTimer);
    };

    /* ── Boshqaruv tugmalari ── */
    $$('.seg button', stage).forEach(b => {
      b.addEventListener('click', () => {
        markTouched();
        setMode(b.dataset.mode);
      });
    });

    $('#resetBtn')?.addEventListener('click', () => {
      markTouched();
      elapsed = 0;
      away = 0;
      xp = 0;
      screen && screen.classList.remove('done');
      setMode('on');
    });

    /* ── Klaviatura ── */
    addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      const k = e.key.toLowerCase();
      if (k === 'f') {
        markTouched();
        setMode(mode === 'away' ? 'on' : 'away');
      } else if (k === 'c') {
        markTouched();
        setMode(mode === 'clock' ? 'on' : 'clock');
      } else if (k === 'r') {
        markTouched();
        $('#resetBtn')?.click();
      }
    });

    /* ── Sudrab ag'darish (pointer drag) ── */
    let dragging = false,
      startX = 0,
      dx = 0;
    device?.addEventListener('pointerdown', e => {
      if (mode === 'clock') return;
      dragging = true;
      startX = e.clientX;
      dx = 0;
      device.classList.add('dragging');
      device.setPointerCapture?.(e.pointerId);
    });
    device?.addEventListener('pointermove', e => {
      if (!dragging) return;
      dx = e.clientX - startX;
      const base = mode === 'away' ? 180 : 0;
      inner.style.transform = `rotateY(${base + dx * 0.62}deg)`;
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      device.classList.remove('dragging');
      inner.style.transform = '';
      if (Math.abs(dx) > 55) {
        markTouched();
        setMode(mode === 'away' ? 'on' : 'away');
      }
      dx = 0;
    };
    device?.addEventListener('pointerup', endDrag);
    device?.addEventListener('pointercancel', endDrag);

    /* ── Avtomatik demo: hakam hech narsa bosmasa ham sehr ko'rinadi ── */
    const autoplay = () => {
      if (touched || reduced) return;
      const seq = [
        [0, 'away'],
        [4200, 'on'],
        [6000, 'clock'],
        [10500, 'on'],
      ];
      seq.forEach(([t, m]) => {
        setTimeout(() => !touched && setMode(m), t);
      });
      autoTimer = setTimeout(autoplay, 17000);
    };
    let started = false;
    const heroIO = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !started) {
            started = true;
            autoTimer = setTimeout(autoplay, 3200);
          }
        });
      },
      { threshold: 0.4 },
    );
    heroIO.observe(stage);

    /* ── Ramka: taymer timestamp asosida hisoblanadi ── */
    const frame = now => {
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;

      const step = dt * SPEED;
      elapsed += step;
      if (mode === 'away') away += step;
      // Away rejimida XP ikki barobar — mahsulotning asosiy qoidasi
      xp += step * (mode === 'away' ? 2 : 1) * 0.12;

      const p = Math.min(1, elapsed / GOAL);
      if (ring) ring.style.strokeDashoffset = (C * (1 - p)).toFixed(2);
      if (screen) screen.classList.toggle('done', p >= 1);
      if (elTimer) elTimer.textContent = mmss(elapsed);
      if (elXp) elXp.textContent = Math.floor(xp);
      if (elAway) elAway.textContent = mmss(away);
      if (elAwayBig) elAwayBig.textContent = mmss(away);
      if (elHabit) elHabit.style.width = (26 + p * 62).toFixed(1) + '%';

      if (elClock) {
        const d = new Date();
        elClock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
      if (elClockSub) elClockSub.textContent = `Chuqur ish · ${mmss(elapsed)}`;

      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ═══════════  7. Scrollytelling — yopishqoq telefon  ═══════════ */

  const sdev = $('#sdev');
  if (sdev) {
    const layers = $$('.sdev-screen img', sdev);
    const steps = $$('.step');
    const show = i => {
      layers.forEach((l, n) => l.classList.toggle('on', n === i));
      steps.forEach((s, n) => s.classList.toggle('active', n === i));
      sdev.dataset.rot =
        layers[i] && layers[i].classList.contains('land') ? '1' : '0';
    };
    show(0);
    if (steps.length) {
      const stepIO = new IntersectionObserver(
        entries => {
          entries.forEach(e => {
            if (e.isIntersecting) show(steps.indexOf(e.target));
          });
        },
        { rootMargin: '-48% 0px -48% 0px' },
      );
      steps.forEach(s => stepIO.observe(s));
    }
  }

  /* ═══════════  8. Metrikalarni sanab ko'rsatish  ═══════════════ */

  $$('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1300;
    let done = false;
    const cio = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (!e.isIntersecting || done) return;
          done = true;
          if (reduced) {
            el.textContent = target + suffix;
            return;
          }
          const t0 = performance.now();
          const tick = now => {
            const k = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - k, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (k < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 },
    );
    cio.observe(el);
  });

  /* ═══════════  9. Nusxa olish tugmalari  ═══════════════════════ */

  $$('.copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const val = btn.dataset.copy || '';
      try {
        await navigator.clipboard.writeText(val);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = val;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
        } catch {
          /* nusxa olish mumkin bo'lmasa — jim o'tamiz */
        }
        ta.remove();
      }
      const old = btn.querySelector('.copy-label').textContent;
      btn.querySelector('.copy-label').textContent = 'nusxa olindi';
      btn.classList.add('ok');
      setTimeout(() => {
        btn.querySelector('.copy-label').textContent = old;
        btn.classList.remove('ok');
      }, 1800);
    });
  });

  /* ═══════════  10. Yuklanmagan skrinshotni yashirish  ══════════ */

  $$('.shot img').forEach(img => {
    img.addEventListener('error', () => {
      const fig = img.closest('figure');
      if (fig) fig.style.display = 'none';
    });
  });

  /* Havolasi yo'q do'kon tugmalari bosilmasin */
  $$('[data-link]').forEach(a => {
    if (a.getAttribute('href') === '#') {
      a.style.opacity = '0.5';
      a.style.pointerEvents = 'none';
      const s = a.querySelector('small');
      if (s) s.textContent = 'tayyorlanmoqda';
    }
  });
})();
