// Scenes: smooth, scroll-driven 3D for the home page, plus a 3D reveal and pointer tilt on every page.
// One animation loop runs only while a scene is on screen. Each frame reads positions first, then writes
// transform and opacity only, and eases toward the scroll position so motion never jumps.
// Visitors who turn motion off keep the plain, still layouts the CSS gives by default.
(() => {
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Phones and tablets: follow the finger more tightly, skip idle floating (it keeps the phone busy between
  // scrolls), and ignore the address bar sliding in and out (it changes the height, not the layout).
  const touch = matchMedia("(pointer: coarse)").matches;
  const root = document.documentElement;
  let headH = 74;
  const setHead = () => {
    headH = document.querySelector(".site-header")?.offsetHeight || 74;
    root.style.setProperty("--head", `${headH}px`);
  };
  setHead();

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const mix = (a, b, t) => a + (b - a) * t;
  // Keyframes: [{ at: 0, x: 1, ... }, { at: .5, x: 2, ... }] -> function of progress, eased between frames.
  const keyframes = (frames) => (p) => {
    let i = 0;
    while (i < frames.length - 2 && p > frames[i + 1].at) i++;
    const a = frames[i], b = frames[i + 1];
    const t = smooth(clamp((p - a.at) / (b.at - a.at || 1)));
    const out = {};
    for (const key in a) if (key !== "at") out[key] = mix(a[key], b[key], t);
    return out;
  };

  // The height scenes are measured against. On phones it stays put while the address bar moves.
  let viewH = innerHeight, viewW = innerWidth;
  const scenes = [];
  let running = false, last = 0;
  const tick = (now) => {
    const dt = Math.min(.05, (now - last) / 1000 || .016);
    last = now;
    const follow = 1 - Math.exp(-dt * (touch ? 15 : 8.5));
    const H = viewH;
    for (const s of scenes) {
      const r = s.el.getBoundingClientRect();
      s.visible = r.bottom > -60 && r.top < H + 60;
      if (s.visible) s.target = clamp((headH - r.top) / Math.max(1, r.height - (H - headH)));
    }
    let busy = false;
    for (const s of scenes) {
      if (!s.visible) continue;
      const gap = s.target - s.p;
      const moving = Math.abs(gap) > .00015;
      if (s.fresh) { s.p = s.target; s.fresh = false; s.dirty = true; }
      if (moving || s.dirty || s.live) {
        // A big jump (a link, the back button, a hard fling) snaps straight there rather than replaying the whole scene.
        s.p = !moving ? s.target : Math.abs(gap) > .35 ? s.target : s.p + gap * follow;
        s.draw(s.p, now / 1000);
        s.dirty = false;
        busy = true;
      }
    }
    if (busy) requestAnimationFrame(tick);
    else running = false;
  };
  const kick = () => {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(tick);
  };
  const add = (scene) => {
    scene.p = 0;
    scene.target = 0;
    scene.dirty = true;
    scene.fresh = true;
    scene.measure?.();
    scenes.push(scene);
  };

  // Scene 1: the build. A sample site floats, comes apart into its layers, then faces you, assembled.
  const build = document.querySelector("[data-build]");
  if (build && !calm) {
    const $ = (sel) => build.querySelector(sel);
    const obj = $("[data-build-obj]");
    const layers = [...build.querySelectorAll("[data-build-layer]")];
    const copy = $("[data-build-copy]");
    const stepsBox = $("[data-build-steps]");
    const steps = [...stepsBox.children];
    const end = $("[data-build-end]");
    const hint = $("[data-build-hint]");
    const shadow = $("[data-build-shadow]");
    const stage = $(".build__stage");
    build.classList.add("is-3d");
    let narrow = false, W = 1, Hs = 1, ow = 1, pose, startY = .24;
    let px = 0, py = 0, tx = 0, ty = 0, hot = -1;
    const wide = keyframes([
      { at: 0, ox: .2, oy: 0, rx: 12, ry: -22, rz: 0, s: .94, gap: 0 },
      { at: .12, ox: .2, oy: 0, rx: 12, ry: -22, rz: 0, s: .94, gap: 0 },
      { at: .3, ox: .14, oy: .03, rx: 56, ry: 0, rz: -30, s: .8, gap: 1 },
      { at: .66, ox: .14, oy: .03, rx: 58, ry: 0, rz: -46, s: .8, gap: 1.2 },
      { at: .84, ox: 0, oy: -.04, rx: 0, ry: 0, rz: 0, s: 1.04, gap: 0 },
      { at: 1, ox: 0, oy: -.04, rx: 0, ry: 0, rz: 0, s: 1.04, gap: 0 },
    ]);
    const tallFrames = [
      { at: 0, ox: 0, oy: .24, rx: 16, ry: -16, rz: 0, s: .82, gap: 0 },
      { at: .12, ox: 0, oy: .24, rx: 16, ry: -16, rz: 0, s: .82, gap: 0 },
      { at: .3, ox: 0, oy: -.06, rx: 56, ry: 0, rz: -30, s: .86, gap: 1 },
      { at: .66, ox: 0, oy: -.06, rx: 58, ry: 0, rz: -46, s: .86, gap: 1.2 },
      { at: .84, ox: 0, oy: -.08, rx: 0, ry: 0, rz: 0, s: 1, gap: 0 },
      { at: 1, ox: 0, oy: -.08, rx: 0, ry: 0, rz: 0, s: 1, gap: 0 },
    ];
    add({
      el: build,
      live: !touch,
      measure() {
        narrow = innerWidth <= 860;
        W = stage.clientWidth;
        Hs = stage.clientHeight;
        ow = obj.offsetWidth;
        if (narrow) {
          // Start just below the buttons, however tall the phone is.
          const below = copy.offsetTop + copy.offsetHeight + 18 + ow * (2 / 3) * .82 / 2;
          startY = (below - Hs / 2) / Hs;
          tallFrames[0].oy = tallFrames[1].oy = startY;
        }
        pose = narrow ? keyframes(tallFrames) : wide;
      },
      draw(p, t) {
        const k = pose(p);
        tx += (px - tx) * .08;
        ty += (py - ty) * .08;
        const still = 1 - smooth(clamp((p - .1) / .12));
        const bob = touch ? 0 : Math.sin(t * 1.1) * 7 * still;
        const x = k.ox * W, y = k.oy * Hs + bob;
        const rx = k.rx - ty * 7 * still, ry = k.ry + tx * 10 * still;
        obj.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${k.rz.toFixed(2)}deg) scale(${k.s.toFixed(3)})`;
        const gap = k.gap * ow * .12;
        layers.forEach((layer, i) => { layer.style.transform = `translate3d(0, 0, ${(i * gap).toFixed(1)}px)`; });
        shadow.style.transform = `translate3d(${x.toFixed(1)}px, ${(y + ow * .36 * k.s).toFixed(1)}px, 0) scale(${(k.s * (1 - k.gap * .15)).toFixed(3)}, ${(1 - k.gap * .35).toFixed(3)})`;
        shadow.style.opacity = (1 - k.gap * .4).toFixed(3);
        const out = smooth(clamp((p - .07) / .1));
        copy.style.opacity = (1 - out).toFixed(3);
        copy.style.transform = narrow ? `translate3d(0, ${(-30 * out).toFixed(1)}px, 0)` : `translate3d(0, calc(-50% - ${(40 * out).toFixed(1)}px), 0)`;
        copy.style.visibility = out > .98 ? "hidden" : "";
        const show = smooth(clamp((p - .22) / .06)) * (1 - smooth(clamp((p - .7) / .06)));
        stepsBox.style.opacity = show.toFixed(3);
        const now = show > .05 ? clamp(Math.floor((p - .25) / .105), 0, 3) : -1;
        if (now !== hot) {
          hot = now;
          steps.forEach((li, i) => li.classList.toggle("is-on", i === now));
          layers.forEach((layer, i) => layer.classList.toggle("is-hot", i === now));
        }
        end.style.opacity = smooth(clamp((p - .84) / .07)).toFixed(3);
        end.style.transform = `translate3d(0, ${(20 * (1 - smooth(clamp((p - .84) / .07)))).toFixed(1)}px, 0)`;
        hint.style.opacity = (1 - clamp(p / .05)).toFixed(3);
      },
    });
    build.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX / innerWidth - .5;
      py = e.clientY / innerHeight - .5;
      kick();
    }, { passive: true });
    build.addEventListener("pointerleave", () => { px = 0; py = 0; kick(); }, { passive: true });
  }

  // Phones: the aisle and the AI store become rows you swipe sideways. The swipe itself is the browser's own
  // (smooth, with snapping); the script only turns and fades each piece by where it sits, once per frame.
  const swipeRow = (row, onMove) => {
    let queued = false;
    const run = () => { queued = false; onMove(row.scrollLeft); };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(run); } };
    row.addEventListener("scroll", queue, { passive: true });
    row.addEventListener("scrollend", queue, { passive: true });
    addEventListener("pageshow", queue);
    addEventListener("resize", queue, { passive: true });
    addEventListener("load", queue);
    queue();
    return queue;
  };
  // Tapping a side piece brings it to the middle instead of opening it.
  const centerOnTap = (row, items, isCentered) => {
    items.forEach((item, i) => item.addEventListener("click", (e) => {
      if (isCentered(i)) return;
      e.preventDefault();
      row.scrollTo({ left: item.offsetLeft - (row.clientWidth - item.offsetWidth) / 2, behavior: "smooth" });
    }));
  };

  // Scene 2: the design store. The camera walks down an aisle; each design swings toward you as you pass.
  const aisle = document.querySelector("[data-aisle]");
  if (aisle && !calm && touch) {
    const row = aisle.querySelector("[data-aisle-world]");
    const items = [...aisle.querySelectorAll("[data-aisle-item]")];
    const field = (name) => aisle.querySelector(`[data-aisle-${name}]`);
    aisle.classList.add("is-swipe");
    let front = -1;
    swipeRow(row, (left) => {
      const mid = left + row.clientWidth / 2;
      let best = 0, bestD = Infinity;
      items.forEach((item, i) => {
        const c = item.offsetLeft + item.offsetWidth / 2;
        const u = (c - mid) / item.offsetWidth;
        if (Math.abs(u) < bestD) { bestD = Math.abs(u); best = i; }
        if (Math.abs(u) > 2.2) return;
        const k = clamp(u, -1.4, 1.4);
        item.style.transform = `perspective(900px) translate3d(${(-k * 14).toFixed(1)}px, 0, ${(-Math.abs(k) * 120).toFixed(1)}px) rotateY(${(-k * 38).toFixed(2)}deg)`;
        item.style.opacity = (1 - Math.min(.55, Math.abs(k) * .4)).toFixed(3);
      });
      if (best === front) return;
      front = best;
      items.forEach((item, i) => item.classList.toggle("is-front", i === best));
      const d = items[best].dataset;
      field("name").textContent = d.name;
      field("style").textContent = d.style;
      field("type").textContent = d.type;
      field("order").href = `/book.html?template=${d.slug}`;
      field("look").href = `/samples/${d.slug}.html`;
      field("num").textContent = String(best + 1).padStart(2, "0");
    });
    centerOnTap(row, items, (i) => i === front);
  } else if (aisle && !calm) {
    const world = aisle.querySelector("[data-aisle-world]");
    const floor = aisle.querySelector(".aisle__floor");
    const items = [...aisle.querySelectorAll("[data-aisle-item]")];
    const field = (name) => aisle.querySelector(`[data-aisle-${name}]`);
    const n = items.length;
    aisle.classList.add("is-3d");
    aisle.style.setProperty("--n", n);
    items.forEach((item) => { item.tabIndex = -1; item.setAttribute("aria-hidden", "true"); });
    let cw = 400, D = 540, X = 300, narrow = false, front = -1;
    add({
      el: aisle,
      measure() {
        const W = aisle.clientWidth;
        narrow = W <= 860;
        cw = narrow ? Math.min(W * .7, 340) : clamp(W * .3, 260, 440);
        D = cw * (narrow ? 1.5 : 1.35);
        X = narrow ? cw * .34 : Math.min(W * .26, cw * 1.02);
        aisle.style.setProperty("--cw", `${Math.round(cw)}px`);
      },
      draw(p) {
        const cam = p * (n - 1) * D;
        const swing = narrow ? 24 : 36;
        items.forEach((item, i) => {
          const side = i % 2 ? 1 : -1;
          const d = cam - i * D;
          const f = smooth(clamp(1 - Math.abs(d) / D));
          const x = side * X * (1 - .62 * f) + (d > 0 ? side * d * (narrow ? 1.4 : .9) : 0);
          const rot = -side * swing * (1 - .85 * f);
          const z = d + f * 70;
          const far = clamp((d + (narrow ? 3.6 : 5) * D) / (1.4 * D));
          const near = d > 0 ? 1 - clamp(d / ((narrow ? .45 : .85) * D)) : 1;
          const o = far * near;
          item.style.opacity = o.toFixed(3);
          item.style.visibility = o < .01 ? "hidden" : "";
          if (o >= .01) item.style.transform = `translate3d(${x.toFixed(1)}px, ${(f * -10).toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${rot.toFixed(2)}deg)`;
        });
        // Move the floor itself (cheap) rather than its pattern (repaints the whole floor every frame).
        floor.style.transform = `translate3d(0, ${(cw * .48).toFixed(1)}px, ${(900 + (cam % 120)).toFixed(1)}px) rotateX(-90deg)`;
        const now = clamp(Math.round(cam / D), 0, n - 1);
        if (now === front) return;
        front = now;
        items.forEach((item, i) => item.classList.toggle("is-front", i === now));
        const d = items[now].dataset;
        field("name").textContent = d.name;
        field("style").textContent = d.style;
        field("type").textContent = d.type;
        field("order").href = `/book.html?template=${d.slug}`;
        field("look").href = `/samples/${d.slug}.html`;
        field("num").textContent = String(now + 1).padStart(2, "0");
      },
    });
  }

  // Scene 3: the AI store. One service at a time flies in, turns on its pedestal, then makes way for the next.
  const store = document.querySelector("[data-aistore]");
  if (store && !calm && touch) {
    const row = store.querySelector(".aistore__cards");
    const boxes = [...store.querySelectorAll("[data-ai-box]")];
    const cards = [...store.querySelectorAll("[data-ai-card]")];
    store.classList.add("is-swipe");
    let on = -1;
    swipeRow(row, (left) => {
      const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
      const P = clamp(left / Math.max(1, step), 0, cards.length - 1);
      const W = store.clientWidth;
      // The box turns with your finger: swipe to the next service and its box rolls in as the last one rolls out.
      boxes.forEach((box, i) => {
        const u = P - i;
        if (Math.abs(u) >= 1) { box.style.setProperty("--o", "0"); box.style.visibility = "hidden"; return; }
        box.style.visibility = "";
        box.style.setProperty("--o", (1 - smooth(Math.abs(u))).toFixed(3));
        box.style.transform = `translate3d(${(-u * W * .42).toFixed(1)}px, 0, ${(-Math.abs(u) * 160).toFixed(1)}px) rotateX(-16deg) rotateY(${(-24 - u * 90).toFixed(2)}deg)`;
      });
      const now = Math.round(P);
      if (now === on) return;
      on = now;
      cards.forEach((card, i) => card.classList.toggle("is-on", i === now));
    });
    centerOnTap(row, cards, (i) => i === on);
  } else if (store && !calm) {
    const boxes = [...store.querySelectorAll("[data-ai-box]")];
    const cards = [...store.querySelectorAll("[data-ai-card]")];
    const n = boxes.length;
    store.classList.add("is-3d");
    store.style.setProperty("--n", n);
    let narrow = false, W = 1;
    add({
      el: store,
      live: !touch,
      measure() {
        narrow = innerWidth <= 860;
        W = store.clientWidth;
      },
      draw(p, t) {
        const P = p * (n - 1) + .5;
        boxes.forEach((box, i) => {
          const u = P - i;
          if (u < -.25 || u > 1.05) { box.style.setProperty("--o", "0"); box.style.visibility = "hidden"; return; }
          box.style.visibility = "";
          // The next box comes in from the right as this one drifts off to the left, so the pedestal is never empty.
          const enter = i === 0 && u < .5 ? 1 : smooth(clamp((u + .2) / .35));
          const leave = i === n - 1 && u > .5 ? 0 : smooth(clamp((u - .62) / .35));
          const hold = clamp((u - .15) / .7);
          // In from far right and below, turning; out to the far left, still turning. Never toward the camera.
          const ang = -28 + hold * 56 - (1 - enter) * 200 + leave * 180;
          const z = -(1 - enter) * 900 - leave * 700;
          const x = (1 - enter) * W * (narrow ? .3 : .16) - leave * W * (narrow ? .3 : .16);
          const y = (1 - enter) * 60 - leave * 40 + (touch ? 0 : Math.sin(t * 1.3 + i) * 8);
          // Fade the faces, not the box: opacity on the box would flatten the cube.
          box.style.setProperty("--o", (enter * (1 - leave)).toFixed(3));
          box.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(-16deg) rotateY(${ang.toFixed(2)}deg)`;
        });
        cards.forEach((card, i) => {
          const u = P - i;
          const inn = i === 0 ? 1 : smooth(clamp((u + .15) / .15));
          const out = i === n - 1 ? 1 : 1 - smooth(clamp((u - .7) / .15));
          const o = inn * out;
          const shift = (1 - inn) * 34 - (1 - out) * 34;
          card.style.opacity = o.toFixed(3);
          card.style.visibility = o < .01 ? "hidden" : "";
          card.style.transform = narrow ? `translate3d(0, ${shift.toFixed(1)}px, 0)` : `translate3d(0, calc(-40% + ${shift.toFixed(1)}px), 0)`;
          card.classList.toggle("is-on", o > .5);
        });
      },
    });
  }

  if (scenes.length) {
    addEventListener("scroll", kick, { passive: true });
    addEventListener("resize", () => {
      // A phone's address bar showing or hiding only changes the height: keep the scenes as they are.
      if (touch && innerWidth === viewW && Math.abs(innerHeight - viewH) < 160) return;
      viewW = innerWidth;
      viewH = innerHeight;
      setHead();
      scenes.forEach((s) => { s.measure?.(); s.dirty = true; });
      kick();
    }, { passive: true });
    // Images arriving can change sizes; measure again once everything has loaded.
    addEventListener("load", () => { scenes.forEach((s) => { s.measure?.(); s.dirty = true; }); kick(); });
    // Coming back with the back button, or to a tab left in the background: redraw where the page really is.
    addEventListener("pageshow", () => { scenes.forEach((s) => { s.measure?.(); s.fresh = true; }); kick(); });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) { scenes.forEach((s) => { s.fresh = true; }); kick(); } });
    kick();
  } else {
    addEventListener("resize", setHead, { passive: true });
  }

  // The small looping 3D tiles play only while they are on screen.
  const sell = document.querySelector(".sell3d");
  if (sell && !calm && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => sell.classList.toggle("is-playing", entry.isIntersecting)).observe(sell);
  }

  if (calm || !("IntersectionObserver" in window)) return;

  // Every page: content rises into place in 3D as it scrolls in. Forms and the 3D scenes are left alone.
  const skip = "[data-build], [data-aisle], [data-aistore], .sell3d, .site-header, .site-footer";
  const candidates = document.querySelectorAll("main section .wrap > *, main .price-strip > *, main .buy-steps > li, main .aias__steps > li, main .value__grid > *, main .start-window__grid > *, main .section__title, main .row, main .frame, main .jargon__list > div, main .steps__list > li, main .package, main .tpl");
  const picked = [];
  candidates.forEach((el) => {
    if (el.closest(skip) || el.closest(".rv") || el.querySelector(".rv")) return;
    if (el.matches("form, input, select, textarea") || el.querySelector("form, input, select, textarea")) return;
    if (el.matches(".price-strip, .buy-steps, .value__grid, .start-window__grid, .aias__steps, .packages, .jargon__list, .steps__list")) return;
    // Parts that start hidden (a preview that appears after a code is entered, a "no results" note) show plainly.
    if (!el.offsetParent) return;
    el.classList.add("rv");
    picked.push(el);
  });
  const seen = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      seen.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -6% 0px" });
  picked.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("rv"));
    el.style.setProperty("--rv-d", `${Math.min(siblings.indexOf(el), 5) * .08}s`);
    seen.observe(el);
  });
  // Anything still hidden after a jump (a link to #something, or print) shows at once.
  addEventListener("hashchange", () => picked.forEach((el) => el.classList.add("is-in")));
  addEventListener("beforeprint", () => picked.forEach((el) => el.classList.add("is-in")));

  // Cards tilt toward the mouse, like objects you can pick up.
  if (!matchMedia("(pointer: fine)").matches) return;
  document.querySelectorAll(".start-card, .price-strip > a, .value__card, .aistore:not(.is-3d) .aistore__card, .gallery-card, .tpl-card, .package").forEach((card) => {
    card.classList.add("tilt");
    card.addEventListener("pointermove", (e) => {
      if (card.classList.contains("rv") && !card.classList.contains("is-in")) return;
      const box = card.getBoundingClientRect();
      const x = (e.clientX - box.left) / box.width - .5;
      const y = (e.clientY - box.top) / box.height - .5;
      card.classList.add("is-tilting");
      card.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateZ(6px)`;
    }, { passive: true });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-tilting");
      card.style.transform = "";
    }, { passive: true });
  });
})();
