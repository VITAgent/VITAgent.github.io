"use strict";
/* VITAgent site behaviour.
   1. Dot-matrix type (wordmark, monograms) rendered as SVG.
   2. Nav state; resource sets that show only public links.
   3. News from config.js; team and institutions from team.js.
   4. Dot-matrix display cycling through the loop (See, Seek, Reason, Evolve), synced with the step list.
   5. Product emblems; monograms that boot dot by dot; system diagram with travelling packets.
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

  /* ---------- Nav: raised once scrolled; current section marked ---------- */
  const top = document.getElementById("top");
  if (top) {
    const onScroll = () => top.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    const links = [...top.querySelectorAll('nav a[href^="#"]')];
    const secs = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    if (secs.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + e.target.id)));
      }), { rootMargin: "-40% 0px -55% 0px" });
      secs.forEach((s) => io.observe(s));
    }
  }

  /* ---------- Resource sets (DESIGN.md 3.3) ----------
     data-res="Paper=bench.paper,Code=bench.code". Available resources become links;
     unavailable ones are not shown and are summarised in one meta sentence. */
  const publicUrl = (key) => {
    const v = (V.links || {})[key];
    if (typeof v !== "string") return null;
    try { const u = new URL(v); return u.protocol === "https:" ? u.href : null; } catch { return null; }
  };
  const listJoin = (xs) => xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1];
  document.querySelectorAll("[data-res]").forEach((el) => {
    const items = el.dataset.res.split(",").map((p) => p.split("=")).filter((p) => p.length === 2);
    const on = items.filter(([, k]) => publicUrl(k)), off = items.filter(([, k]) => !publicUrl(k));
    let html = on.map(([label, k]) => `<a class="link" href="${esc(publicUrl(k))}">${esc(label)}</a>`).join("");
    if (off.length) {
      const names = off.map(([l]) => l.toLowerCase());
      const sentence = listJoin(names) + " coming soon";
      html += `<span class="meta">${esc(sentence[0].toUpperCase() + sentence.slice(1))}</span>`;
    }
    el.innerHTML = html;
  });

  /* ---------- News ---------- */
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const niceDate = (d) => { const m = /^(\d{4})[.\-/](\d{1,2})/.exec(String(d)); return m ? `${MONTHS[+m[2] - 1]} ${m[1]}` : String(d); };
  const news = document.getElementById("news-list");
  if (news) news.innerHTML = V.news.map((n, i) => `<li${i === 0 ? ' class="new"' : ""}><time>${esc(niceDate(n.date))}</time><span>${esc(n.text)}</span></li>`).join("");

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
    return `<li data-aff="${esc((m.affiliations || []).join(" "))}"><div class="mono-tile"${m.photo ? "" : " data-boot"}>${face}</div><b>${name}</b>${m.role ? `<span class="meta">${esc(m.role)}</span>` : ""}<ul class="affs">${affs}</ul></li>`;
  }).join("");
  const filter = document.getElementById("aff-filter");
  if (filter && team) {
    filter.innerHTML = `<li><button type="button" data-aff="" aria-pressed="true">All</button></li>` +
      instKeys.map((k) => `<li><button type="button" data-aff="${esc(k)}" aria-pressed="false">${mark(k)}${esc(T.institutions[k].name)}</button></li>`).join("");
    filter.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const k = b.dataset.aff;
      filter.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      team.querySelectorAll(":scope > li").forEach((li) => li.classList.toggle("dim", !!k && !li.dataset.aff.split(" ").includes(k)));
    });
  }

  /* ---------- Dot-matrix display: the four steps of the loop ---------- */
  const mx = document.getElementById("matrix");
  const loop = document.getElementById("steps");
  if (mx) {
    const ctx = mx.getContext("2d"), css = getComputedStyle(document.documentElement);
    const R = 15, N = 2 * R + 1, STEP_MS = 3600, names = ["See", "Seek", "Reason", "Evolve"], lines = ["surgical video", "surgical knowledge", "over evidence", "from its own trajectories"];
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
    function colors() { return [css.getPropertyValue("--dot-off").trim(), css.getPropertyValue("--brand").trim(), css.getPropertyValue("--signal").trim(), css.getPropertyValue("--faint").trim()]; }
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
      const nm = document.getElementById("step-name"), ln = document.getElementById("step-line");
      if (nm) nm.textContent = names[n];
      if (ln) ln.textContent = lines[n];
      loop?.querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-current", String(i === n)));
      if (still) draw(now);
    }
    loop?.addEventListener("click", (e) => { const b = e.target.closest("button[data-step]"); if (b) setStep(+b.dataset.step, performance.now()); });
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

  /* ---------- Product emblems: a small dot-matrix screen per product ----------
     Still by default; animates while the card is hovered or focused (DESIGN.md P3). */
  const EMB = {
    // Benchmark: bars rising to their scores, the best one in signal
    bench: (x, y, t) => {
      const H = [5, 9, 6, 12, 8], col = Math.floor((x + 7) / 3), inBar = (x + 7) % 3 < 2;
      if (y === 7) return 3;
      if (!inBar || col > 4) return 0;
      const grow = t ? Math.min(1, Math.max(0, t * 1.4 - col * 0.18)) : 1, h = Math.round(H[col] * grow);
      return y <= 6 && y > 6 - h ? (col === 3 ? 2 : 1) : 0;
    },
    // Environment: a bounded room with three tools; the agent walks between them
    gym: (() => {
      const tools = [[-4, -3], [4, -4], [2, 4]], path = [[-5, 4], ...tools, [-5, 4]];
      return (x, y, t) => {
        const k = (t * 0.9) % (path.length - 1), i = Math.floor(k), f = k - i;
        const ax = Math.round(path[i][0] + (path[i + 1][0] - path[i][0]) * f), ay = Math.round(path[i][1] + (path[i + 1][1] - path[i][1]) * f);
        if (x === ax && y === ay) return 2;
        for (const [tx, ty] of tools) if (Math.abs(x - tx) <= 1 && Math.abs(y - ty) <= 1 && !(x === tx && y === ty)) return 1;
        if (Math.abs(x) === 7 || Math.abs(y) === 7) return 3;
        return 0;
      };
    })(),
    // Knowledge base: an open book whose lines are read one by one
    wiki: (x, y, t) => {
      const ax = Math.abs(x);
      if (x === 0 && y >= -5 && y <= 6) return 1;                       // spine
      if (ax >= 1 && ax <= 6 && (y === -6 + (ax > 3 ? 0 : 1) || y === 6)) return 1; // page edges
      if (ax === 7 && y >= -5 && y <= 5) return 1;
      if (ax >= 2 && ax <= 5 && y >= -4 && y <= 4 && (y + 4) % 2 === 0) { // lines of text, read one by one
        const line = (y + 4) / 2 + (x > 0 ? 5 : 0), reading = Math.floor(t * 3) % 10;
        return t && line === reading ? 2 : 3;
      }
      return 0;
    },
    // Agent: a core with a tool call orbiting it
    agent: (x, y, t) => {
      const d = Math.abs(x) + Math.abs(y);
      if (d <= 2) return d === 2 ? 1 : (d === 0 ? 1 : 0);
      const r = Math.hypot(x, y), a = Math.atan2(y, x), o = t * 2.2 - Math.PI / 4;
      const ox = Math.round(Math.cos(o) * 5.5), oy = Math.round(Math.sin(o) * 5.5);
      if (x === ox && y === oy) return 2;
      if (Math.abs(r - 5.5) < 0.5) return 3;
      return 0;
    },
    // Self-evolution: a turning double helix
    evolve: (x, y, t) => {
      const f = (u) => 4.8 * Math.sin(u * 0.45 + t * 1.8 + 0.6);
      const lo = Math.min(f(x - 0.5), f(x + 0.5)) - 0.5, hi = Math.max(f(x - 0.5), f(x + 0.5)) + 0.5, front = Math.cos(x * 0.45 + t * 1.8 + 0.6) > 0;
      if (y >= lo && y <= hi) return front ? 1 : 3;
      if (-y >= lo && -y <= hi) return front ? 3 : 1;
      return 0;
    }
  };
  document.querySelectorAll("canvas[data-emblem]").forEach((cv) => {
    const scene = EMB[cv.dataset.emblem]; if (!scene) return;
    const ctx = cv.getContext("2d"), css = getComputedStyle(document.documentElement), R = 7, N = 15;
    let t = 0, raf = 0, last = 0, start = 0;
    function size() { const r = cv.getBoundingClientRect(), d = devicePixelRatio || 1; cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); }
    function draw() {
      const col = [css.getPropertyValue("--dot-off").trim(), css.getPropertyValue("--brand").trim(), css.getPropertyValue("--signal").trim(), css.getPropertyValue("--faint").trim()];
      const c = cv.width / N, rad = c * 0.34;
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const lv = scene(i - R, j - R, t);
        ctx.fillStyle = col[lv]; ctx.beginPath(); ctx.arc((i + 0.5) * c, (j + 0.5) * c, lv ? rad : rad * 0.8, 0, 7); ctx.fill();
      }
    }
    function loop(now) { if (now - last > 80) { t = (now - start) / 1000; draw(); last = now; } raf = requestAnimationFrame(loop); }
    const card = cv.closest(".card");
    const play = () => { if (still || raf) return; start = performance.now() - 1; raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; t = 0; draw(); };
    card?.addEventListener("mouseenter", play); card?.addEventListener("mouseleave", stop);
    card?.addEventListener("focusin", play); card?.addEventListener("focusout", stop);
    size(); draw();
    addEventListener("resize", () => { size(); draw(); });
  });

  /* ---------- Monograms boot dot by dot when they scroll into view ---------- */
  const boots = document.querySelectorAll("[data-boot]");
  if (boots.length && !still && "IntersectionObserver" in window) {
    boots.forEach((el) => el.querySelectorAll(".dot-on circle").forEach((c) => { c.style.transitionDelay = Math.round(Math.random() * 600) + "ms"; }));
    boots.forEach((el) => el.classList.add("boot"));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("booted"); io.unobserve(e.target); } }), { threshold: 0.6 });
    boots.forEach((el) => io.observe(el));
  }

  /* ---------- System map: how the products fit, drawn on the same dot grid ----------
     Regions are windows in a field of dots, outlined by lit dots. Edges are runs of dots with
     packets stepping along them. Hovering a product card highlights its region. */
  const sys = document.getElementById("system");
  if (sys) {
    const C = 14, COLS = 64, ROWS = 28, NS = "http://www.w3.org/2000/svg";
    sys.setAttribute("viewBox", `0 0 ${COLS * C} ${ROWS * C}`);
    // x0, y0, x1, y1 are inclusive cell coordinates
    const R = [
      { id: "bench",  x0: 2,  y0: 1,  x1: 37, y1: 4,  name: "SurgKnow-Bench",  meta: "evaluation on top of the Gym" },
      { id: "gym",    x0: 2,  y0: 8,  x1: 37, y1: 21, name: "SurgAgentGym",    meta: "environment" },
      { id: "video",  x0: 4,  y0: 12, x1: 18, y1: 19, name: "Surgical video",  meta: "perceive", minor: true },
      { id: "wiki",   x0: 21, y0: 12, x1: 35, y1: 19, name: "SurgWiki",        meta: "retrieve" },
      { id: "agent",  x0: 48, y0: 9,  x1: 61, y1: 16, name: "SurgAgent",       meta: "agent" },
      { id: "evolve", x0: 48, y0: 22, x1: 61, y1: 26, name: "SurgAgentEvolve", meta: "self-evolution" }
    ];
    const run = (pts) => { const out = []; for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.max(Math.abs(bx - ax), Math.abs(by - ay)); for (let k = 0; k < n; k++) out.push([ax + Math.sign(bx - ax) * k, ay + Math.sign(by - ay) * k]); } out.push(pts[pts.length - 1]); return out; };
    const E = [
      { cells: run([[47, 11], [38, 11]]), label: "actions", lx: 39, ly: 10.2, ends: ["agent", "gym"] },
      { cells: run([[38, 14], [47, 14]]), label: "observations", lx: 39, ly: 15.9, ends: ["agent", "gym", "video", "wiki"] },
      { cells: run([[12, 7], [12, 5]]), label: "", ends: ["bench", "gym"] },
      { cells: run([[27, 7], [27, 5]]), label: "evaluates", lx: 28.2, ly: 6.4, ends: ["bench", "gym"] },
      { cells: run([[20, 22], [20, 24], [47, 24]]), label: "trajectories", lx: 22, ly: 23.2, ends: ["gym", "evolve"], live: true },
      { cells: run([[55, 21], [55, 17]]), label: "next version", lx: 56.2, ly: 19.4, ends: ["evolve", "agent"], gap: true }
    ];
    const inside = (r, x, y) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
    const border = (r, x, y) => inside(r, x, y) && (x === r.x0 || x === r.x1 || y === r.y0 || y === r.y1);
    const onEdge = new Set(E.flatMap((e) => e.cells.map(([x, y]) => x + "," + y)));
    let bg = "", lines = "", labels = "";
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const cx = (x + 0.5) * C, cy = (y + 0.5) * C;
      const br = R.find((r) => border(r, x, y));
      if (br) { lines += `<circle class="rd${br.minor ? " minor" : ""}" data-r="${br.id}" cx="${cx}" cy="${cy}" r="2.6"/>`; continue; }
      if (onEdge.has(x + "," + y)) { lines += `<circle class="ed" cx="${cx}" cy="${cy}" r="1.9"/>`; continue; }
      if (R.some((r) => inside(r, x, y) && !r.minor && r.id !== "gym") || R.some((r) => r.minor && inside(r, x, y))) continue;
      if (inside(R[1], x, y)) continue; // the Gym is an open room
      bg += `<circle cx="${cx}" cy="${cy}" r="1.5"/>`;
    }
    R.forEach((r) => {
      labels += `<rect class="rbg" data-r="${r.id}" x="${(r.x0 + 0.5) * C}" y="${(r.y0 + 0.5) * C}" width="${(r.x1 - r.x0) * C}" height="${(r.y1 - r.y0) * C}" rx="3"/>`;
      labels += `<text class="rn${r.minor ? " minor" : ""}" x="${(r.x0 + 1.4) * C}" y="${(r.y0 + 2.1) * C}">${esc(r.name)}</text><text class="rm" x="${(r.x0 + 1.4) * C}" y="${(r.y0 + 3.3) * C}">${esc(r.meta)}</text>`;
    });
    E.forEach((e) => { if (e.label) labels += `<text class="el" x="${e.lx * C}" y="${e.ly * C}">${esc(e.label)}</text>`; });
    sys.innerHTML = `<g class="bgd">${bg}</g>${labels}<g>${lines}</g><g id="pk"></g>`;

    // packets: one every 4 cells, stepping along each edge
    const pk = sys.querySelector("#pk"), packets = [];
    E.forEach((e) => {
      for (let i = 0; i < e.cells.length; i += e.gap ? 3 : 4) {
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("r", "2.8"); c.setAttribute("class", "pk" + (e.live ? " live" : ""));
        pk.appendChild(c); packets.push({ c, e, i });
      }
    });
    const place = () => packets.forEach((p) => { const [x, y] = p.e.cells[p.i % p.e.cells.length]; p.c.setAttribute("cx", (x + 0.5) * C); p.c.setAttribute("cy", (y + 0.5) * C); });
    place();
    let vis = false, last = 0;
    new IntersectionObserver((es) => { vis = es[0].isIntersecting; }).observe(sys);
    const step = (now) => { if (vis && now - last > 160) { packets.forEach((p) => p.i++); place(); last = now; } requestAnimationFrame(step); };
    if (!still) requestAnimationFrame(step);

    // cards and regions
    const hl = (id, on) => { sys.querySelectorAll(`[data-r="${id}"]`).forEach((n) => n.classList.toggle("hl", on)); };
    document.querySelectorAll(".card[data-node]").forEach((card) => {
      const id = card.dataset.node;
      card.addEventListener("mouseenter", () => hl(id, true)); card.addEventListener("mouseleave", () => hl(id, false));
      card.addEventListener("focusin", () => hl(id, true)); card.addEventListener("focusout", () => hl(id, false));
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
      const line = css.getPropertyValue("--brand").trim(), sig = css.getPropertyValue("--signal").trim(), grid = css.getPropertyValue("--dot-off").trim();
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
