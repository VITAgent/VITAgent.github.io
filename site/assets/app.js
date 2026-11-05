"use strict";
/* VITAgent site behaviour.
   1. Dot-matrix type (wordmark, monograms) rendered as SVG.
   2. Links that switch on when config.js has a public URL.
   3. News from config.js; team and institutions from team.js.
   4. Dot-matrix display cycling through the loop (See, Seek, Reason, Evolve), synced with the step list.
   5. Monograms that boot dot by dot; system diagram with travelling packets.
   6. Vital trace. */
(() => {
  const V = window.VITAGENT || { links: {}, news: [] };
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- 5x7 dot-matrix font (8 rows: row 7 is the descender) ---------- */
  const F = {
    A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"], B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
    C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."], D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
    E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"], F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
    G: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".####"], H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    I: [".###.", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."], J: ["..###", "...#.", "...#.", "...#.", "#..#.", "#..#.", ".##.."],
    K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"], L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
    M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"], N: ["#...#", "#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#"],
    O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."], P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
    Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"], R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
    S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."], T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
    U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."], V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
    W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "#.#.#", ".#.#."], X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
    Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."], Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
    g: [".....", ".....", ".####", "#...#", "#...#", ".####", "....#", ".###."], e: [".....", ".....", ".###.", "#...#", "#####", "#....", ".###."],
    n: [".....", ".....", "####.", "#...#", "#...#", "#...#", "#...#"], t: [".#...", ".#...", "####.", ".#...", ".#...", ".#..#", "..##."],
    " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."]
  };
  const ROWS = 8;
  function dots(text, opts = {}) {
    const glyphs = [...text].map((c) => F[c] || F[c.toUpperCase()] || F[" "]);
    const gap = opts.gap ?? 1, w = glyphs.length * 5 + (glyphs.length - 1) * gap;
    const rows = opts.rows || ROWS, r = opts.r || 0.4;
    let lit = "", off = "";
    glyphs.forEach((g, i) => {
      const x0 = i * (5 + gap);
      for (let y = 0; y < rows; y++) for (let x = 0; x < 5 + (i < glyphs.length - 1 ? gap : 0); x++) {
        const on = x < 5 && g[y] && g[y][x] === "#";
        const c = `<circle cx="${x0 + x + 0.5}" cy="${y + 0.5}" r="${r}"/>`;
        if (on) lit += c; else if (opts.grid) off += c;
      }
    });
    return `<svg viewBox="0 0 ${w} ${rows}" role="img" aria-label="${esc(opts.label || text)}"><g class="dot-off">${off}</g><g class="dot-on">${lit}</g></svg>`;
  }
  document.querySelectorAll("[data-dots]").forEach((el) => {
    el.innerHTML = dots(el.dataset.dots, { grid: el.hasAttribute("data-grid"), rows: +el.dataset.rows || ROWS, label: el.dataset.label });
  });

  /* ---------- Links ---------- */
  document.querySelectorAll("[data-link]").forEach((el) => {
    const v = (V.links || {})[el.dataset.link];
    if (typeof v !== "string") return;
    let u; try { u = new URL(v); } catch { return; }
    if (u.protocol !== "https:") return;
    const a = document.createElement("a");
    a.href = u.href; a.className = el.className.replace("off", "on"); a.textContent = el.textContent;
    el.replaceWith(a);
  });

  /* ---------- News, team, partners ---------- */
  const news = document.getElementById("news-list");
  if (news) news.innerHTML = V.news.map((n, i) => `<li${i === 0 ? ' class="new"' : ""}><time>${esc(n.date)}</time><span>${esc(n.text)}</span></li>`).join("");
  /* ---------- Team (data in team.js) ---------- */
  const T = window.VITAGENT_TEAM || { institutions: {}, people: [] };
  const instKeys = Object.keys(T.institutions);
  // Each institution has a dot-matrix marker shape (set with `mark` in team.js), so affiliations are
  // told apart by shape rather than colour.
  const MARKS = {
    ring:    [".###.", "#...#", "#...#", "#...#", ".###."],
    plus:    ["..#..", "..#..", "#####", "..#..", "..#.."],
    diamond: ["..#..", ".#.#.", "#...#", ".#.#.", "..#.."],
    square:  ["#####", "#...#", "#.#.#", "#...#", "#####"],
    cross:   ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
    tri:     ["..#..", "..#..", ".#.#.", ".#.#.", "#####"],
    grid:    ["#.#.#", ".....", "#.#.#", ".....", "#.#.#"],
    bar:     [".....", ".....", "#####", ".....", "....."]
  };
  const fallback = Object.keys(MARKS);
  function mark(key) {
    const inst = T.institutions[key] || {}, m = MARKS[inst.mark] || MARKS[fallback[instKeys.indexOf(key) % fallback.length]];
    let lit = "", off = "";
    m.forEach((row, y) => [...row].forEach((ch, x) => {
      const c = `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.38"/>`;
      if (ch === "#") lit += c; else off += c;
    }));
    return `<svg class="mark" viewBox="0 0 5 5" aria-hidden="true"><g class="m-off">${off}</g><g class="m-on">${lit}</g></svg>`;
  }
  const team = document.getElementById("team-list");
  if (team) team.innerHTML = T.people.map((m) => {
    const ini = m.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    const name = m.url ? `<a href="${esc(m.url)}">${esc(m.name)}</a>` : esc(m.name);
    const face = m.photo ? `<img src="${esc(m.photo)}" alt="" loading="lazy">` : dots(ini, { rows: 7, grid: true, label: m.name });
    const affs = (m.affiliations || []).filter((k) => T.institutions[k]).map((k, i) =>
      `<li class="${i === 0 ? "primary" : ""}" title="${esc(T.institutions[k].name)}"><span class="sr">${esc(T.institutions[k].name)}</span>${mark(k)}</li>`).join("");
    return `<li data-aff="${esc((m.affiliations || []).join(" "))}"><div class="mono-tile"${m.photo ? "" : " data-boot"}>${face}</div><b>${name}</b>${m.role ? `<span>${esc(m.role)}</span>` : ""}<ul class="affs">${affs}</ul></li>`;
  }).join("");
  const filter = document.getElementById("aff-filter");
  if (filter && team) {
    const count = (k) => T.people.filter((p) => (p.affiliations || []).includes(k)).length;
    filter.innerHTML = `<li><button type="button" data-aff="" aria-pressed="true">All<i>${T.people.length}</i></button></li>` +
      instKeys.map((k) => `<li><button type="button" data-aff="${esc(k)}" aria-pressed="false">${mark(k)}${esc(T.institutions[k].name)}<i>${count(k)}</i></button></li>`).join("");
    filter.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const k = b.dataset.aff;
      filter.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      team.querySelectorAll(":scope > li").forEach((li) => li.classList.toggle("dim", !!k && !li.dataset.aff.split(" ").includes(k)));
    });
  }

  /* ---------- Dot-matrix display: the four steps of the loop ---------- */
  const mx = document.getElementById("matrix");
  const loop = document.getElementById("loop");
  if (mx) {
    const ctx = mx.getContext("2d"), css = getComputedStyle(document.documentElement);
    const R = 15, N = 2 * R + 1, STEP_MS = 3600, names = ["See", "Seek", "Reason", "Evolve"];
    const cells = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = i - R, y = j - R;
      if (x * x + y * y <= (R + 0.3) ** 2) cells.push({ x, y, delay: Math.random() * 420 });
    }
    // Levels: 0 off, 1 brand, 2 signal (live), 3 faint
    const near = (a, b, w) => Math.abs(a - b) < w;
    const scenes = [
      (x, y, t) => { // See: an eye that looks around
        const half = 7.2 * (1 - (x / 13.5) ** 2), px = 4 * Math.sin(t * 1.3), py = 1.2 * Math.sin(t * 0.7);
        if (Math.abs(x) <= 13.5 && near(Math.abs(y), half, 0.62)) return 1;
        const d = Math.hypot(x - px, y - py);
        if (Math.abs(y) < half - 0.4 && d <= 4.6) return d <= 1.6 ? 0 : (Math.hypot(x - px - 1.6, y - py + 1.6) < 0.8 ? 2 : 1);
        return 0;
      },
      (x, y, t) => { // Seek: a lens sweeping over lines of text; what it covers lights up
        const cx = -2 + 5 * Math.sin(t * 0.9), cy = -2 + 3 * Math.cos(t * 0.6), d = Math.hypot(x - cx, y - cy);
        if (near(d, 6.4, 0.75)) return 1;
        const ux = (x - cx) / Math.SQRT2 + (y - cy) / Math.SQRT2, uy = (x - cx) / Math.SQRT2 - (y - cy) / Math.SQRT2;
        if (ux > 7 && ux < 15 && Math.abs(uy) < 1.3) return 1;
        const line = (y + 11) % 4 === 0 && Math.abs(x) <= 11 && (x + 3 * y) % 7 !== 0;
        if (line) return d < 5.6 ? 2 : 3;
        return 0;
      },
      (() => { // Reason: a signal travels through a graph of evidence
        const P = [[-10, -4], [-4, -10], [-3, 1], [4, -5], [10, -1], [3, 8], [-8, 7]];
        const E = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [2, 5], [5, 4], [6, 2], [6, 5]];
        const path = [6, 2, 3, 4, 5, 2, 0, 1, 3];
        const seg = (x, y, a, b) => { const [ax, ay] = P[a], [bx, by] = P[b], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
          const u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L)); return Math.hypot(x - ax - u * dx, y - ay - u * dy); };
        return (x, y, t) => {
          const k = (t * 1.6) % (path.length - 1), i = Math.floor(k), f = k - i, a = P[path[i]], b = P[path[i + 1]];
          const sx = a[0] + (b[0] - a[0]) * f, sy = a[1] + (b[1] - a[1]) * f;
          if (Math.hypot(x - sx, y - sy) < 1.3) return 2;
          for (const [qx, qy] of P) if (Math.hypot(x - qx, y - qy) < 1.75) return 1;
          for (const [u, v] of E) if (seg(x, y, u, v) < 0.5) return 3;
          return 0;
        };
      })(),
      (x, y, t) => { // Evolve: a turning double helix (each strand drawn as a continuous run of dots)
        if (Math.abs(x) > 13) return 0;
        const A = 6.5, k = 0.3, w = t * 1.8, f = (u) => A * Math.sin(u * k + w);
        const lo = Math.min(f(x - 0.5), f(x + 0.5)) - 0.55, hi = Math.max(f(x - 0.5), f(x + 0.5)) + 0.55;
        const front = Math.cos(x * k + w) > 0;
        if (y >= lo && y <= hi) return front ? 1 : 3;
        if (-y >= lo && -y <= hi) return front ? 3 : 1;
        if (Math.round(x) % 4 === 0 && Math.abs(f(x)) > 2.5 && Math.abs(y) < Math.abs(f(x)) - 1.2) return 3;
        return 0;
      }
    ];
    let step = 0, prev = 0, changed = -1e9, t0 = performance.now(), lastStepAt = t0, lastDraw = 0;
    function size() { const r = mx.getBoundingClientRect(), d = devicePixelRatio || 1; mx.width = mx.height = Math.round(r.width * d); }
    function colors() { return [css.getPropertyValue("--dot-off").trim(), css.getPropertyValue("--drape").trim(), css.getPropertyValue("--signal").trim(), css.getPropertyValue("--faint").trim()]; }
    function draw(now) {
      const W = mx.width, c = W / N, rad = c * 0.36, col = colors(), t = (now - t0) / 1000, since = now - changed;
      ctx.clearRect(0, 0, W, W);
      for (const p of cells) {
        const sc = since < p.delay ? prev : step;
        const lv = scenes[sc](p.x, p.y, t);
        ctx.fillStyle = col[lv];
        ctx.beginPath(); ctx.arc((p.x + R + 0.5) * c, (p.y + R + 0.5) * c, lv ? rad : rad * 0.82, 0, 7); ctx.fill();
      }
    }
    function setStep(n, now) {
      prev = step; step = n; changed = now; lastStepAt = now;
      const lab = document.getElementById("matrix-label");
      if (lab) lab.textContent = `0${n + 1} ${names[n]}`;
      loop?.querySelectorAll("li").forEach((li, i) => {
        li.classList.toggle("active", i === n);
        const bar = li.querySelector("s"); if (bar) { bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; }
      });
      if (still) draw(now);
    }
    loop?.addEventListener("click", (e) => { const b = e.target.closest("button[data-step]"); if (b) setStep(+b.dataset.step, performance.now()); });
    loop?.style.setProperty("--step-ms", STEP_MS + "ms");
    if (still) loop?.classList.add("manual");
    size(); setStep(0, performance.now()); draw(performance.now());
    addEventListener("resize", () => { size(); draw(performance.now()); });
    let visible = true;
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(mx);
    function tick(now) {
      if (visible && now - lastDraw > 66) { // ~15 fps: stepwise, like an instrument display
        if (now - lastStepAt > STEP_MS) setStep((step + 1) % 4, now);
        draw(now); lastDraw = now;
      }
      requestAnimationFrame(tick);
    }
    if (!still) requestAnimationFrame(tick);
  }

  /* ---------- Monograms boot dot by dot when they scroll into view ---------- */
  const boots = document.querySelectorAll("[data-boot]");
  if (boots.length && !still && "IntersectionObserver" in window) {
    boots.forEach((el) => el.querySelectorAll(".dot-on circle").forEach((c) => { c.style.transitionDelay = Math.round(Math.random() * 600) + "ms"; }));
    boots.forEach((el) => el.classList.add("boot"));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("booted"); io.unobserve(e.target); } }), { threshold: 0.6 });
    boots.forEach((el) => io.observe(el));
  }

  /* ---------- System diagram: rows and nodes highlight each other ---------- */
  const sys = document.getElementById("system");
  if (sys) {
    if (still) sys.pauseAnimations?.();
    document.querySelectorAll(".art[data-node]").forEach((row) => {
      const node = sys.querySelector(`.node[data-node="${row.dataset.node}"]`);
      if (!node) return;
      const on = () => node.classList.add("hl"), off = () => node.classList.remove("hl");
      row.addEventListener("mouseenter", on); row.addEventListener("mouseleave", off);
      row.addEventListener("focusin", on); row.addEventListener("focusout", off);
    });
  }

  /* ---------- Vital trace ---------- */
  const cv = document.getElementById("vitals");
  if (cv) {
    const ctx = cv.getContext("2d"), css = getComputedStyle(document.documentElement);
    let W, H, P, cols, rows, head = 0, buf = [], n = 0, last = 0;
    function beat(t) {
      if (t < 0.08) return Math.sin(t / 0.08 * Math.PI) * 0.12;
      if (t > 0.16 && t < 0.2) return -(t - 0.16) / 0.04 * 0.16;
      if (t >= 0.2 && t < 0.25) return -0.16 + (t - 0.2) / 0.05 * 1.16;
      if (t >= 0.25 && t < 0.3) return 1 - (t - 0.25) / 0.05 * 1.3;
      if (t >= 0.3 && t < 0.34) return -0.3 + (t - 0.3) / 0.04 * 0.3;
      if (t > 0.5 && t < 0.66) return Math.sin((t - 0.5) / 0.16 * Math.PI) * 0.2;
      return 0;
    }
    const period = () => Math.max(40, Math.round(cols / 2.6));
    const level = (i) => Math.round(rows * 0.66) - Math.round(beat((i % period()) / period()) * rows * 0.56);
    function size() {
      const r = cv.getBoundingClientRect(), d = devicePixelRatio || 1;
      W = cv.width = Math.round(r.width * d); H = cv.height = Math.round(r.height * d);
      P = Math.round(5 * d); cols = Math.ceil(W / P); rows = Math.floor(H / P);
      buf = Array.from({ length: cols }, (_, i) => level(i)); head = cols - 1; n = cols;
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const line = css.getPropertyValue("--drape").trim(), sig = css.getPropertyValue("--signal").trim(), grid = css.getPropertyValue("--dot-off").trim();
      const rad = P * 0.36;
      ctx.fillStyle = grid;
      for (let y = 0; y < rows; y += 2) for (let x = 0; x < cols; x += 2) { ctx.beginPath(); ctx.arc(x * P + P / 2, y * P + P / 2, rad * 0.6, 0, 7); ctx.fill(); }
      for (let i = 0; i < cols; i++) {
        const age = (head - i + cols) % cols;
        if (!still && age > cols * 0.92) continue; // the gap ahead of the sweep, as on a monitor
        ctx.globalAlpha = still ? 1 : Math.max(0.18, 1 - age / cols);
        ctx.fillStyle = line;
        const a = Math.min(buf[i], buf[(i + 1) % cols]), b = Math.max(buf[i], buf[(i + 1) % cols]);
        for (let y = a; y <= b; y++) { ctx.beginPath(); ctx.arc(i * P + P / 2, y * P + P / 2, rad, 0, 7); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
      if (!still) { ctx.fillStyle = sig; ctx.beginPath(); ctx.arc(head * P + P / 2, buf[head] * P + P / 2, rad * 1.7, 0, 7); ctx.fill(); }
    }
    function tick(ts) {
      if (ts - last > 22) { last = ts; n++; head = (head + 1) % cols; buf[head] = level(n); draw(); }
      requestAnimationFrame(tick);
    }
    size(); draw();
    addEventListener("resize", () => { size(); draw(); });
    if (!still) requestAnimationFrame(tick);
  }
})();
