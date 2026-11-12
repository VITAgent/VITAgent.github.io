"use strict";
/* VITAgent site behaviour.
   1. Dot-matrix type (wordmark, monograms) rendered as SVG.
   2. Nav state; resource sets that show only public links.
   3. News from config.js; team and institutions from team.js.
   4. Dot-matrix display cycling through the pathway (Understand, Solve, Evolve).
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
    a: [".....", ".....", ".###.", "....#", ".####", "#...#", ".####"], c: [".....", ".....", ".###.", "#....", "#....", "#...#", ".###."],
    f: ["..##.", ".#..#", ".#...", "###..", ".#...", ".#...", ".#..."], i: ["..#..", ".....", ".##..", "..#..", "..#..", "..#..", ".###."],
    j: ["...#.", ".....", "..##.", "...#.", "...#.", "...#.", "#..#.", ".##.."], k: ["#....", "#....", "#..#.", "#.#..", "##...", "#.#..", "#..#."],
    m: [".....", ".....", "##.#.", "#.#.#", "#.#.#", "#...#", "#...#"], o: [".....", ".....", ".###.", "#...#", "#...#", "#...#", ".###."],
    r: [".....", ".....", "#.##.", "##..#", "#....", "#....", "#...."], s: [".....", ".....", ".####", "#....", ".###.", "....#", "####."],
    v: [".....", ".....", "#...#", "#...#", "#...#", ".#.#.", "..#.."], w: [".....", ".....", "#...#", "#...#", "#.#.#", "#.#.#", ".#.#."],
    y: [".....", ".....", "#...#", "#...#", "#...#", ".####", "....#", ".###."],
    b: ["#....", "#....", "####.", "#...#", "#...#", "#...#", "####."], d: ["....#", "....#", ".####", "#...#", "#...#", "#...#", ".####"],
    h: ["#....", "#....", "####.", "#...#", "#...#", "#...#", "#...#"], l: [".##..", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."],
    p: [".....", ".....", "####.", "#...#", "#...#", "####.", "#....", "#...."], u: [".....", ".....", "#...#", "#...#", "#...#", "#..##", ".##.#"],
    1: ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."], 2: [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
    3: [".###.", "#...#", "....#", "..##.", "....#", "#...#", ".###."],
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
      let mine = "";
      for (let y = 0; y < rows; y++) for (let x = 0; x < 5 + (i < glyphs.length - 1 ? gap : 0); x++) {
        const on = x < 5 && g[y] && g[y][x] === "#";
        const c = `<circle cx="${x0 + x + 0.5}" cy="${y + 0.5}" r="${r}"/>`;
        if (on) mine += c; else if (opts.grid) off += c;
      }
      lit += `<g class="gl" data-i="${i}">${mine}</g>`; // one group per letter, so single letters can be styled
    });
    return `<svg viewBox="0 0 ${w} ${rows}" role="img" aria-label="${esc(opts.label || text)}"><g class="dot-off">${off}</g><g class="dot-on">${lit}</g></svg>`;
  }
  // Section titles are set on the same dot-matrix display as the wordmark; the text stays for screen readers.
  document.querySelectorAll("h2.title").forEach((h) => {
    const text = h.textContent.trim();
    h.innerHTML = `<span class="sr">${esc(text)}</span><span class="dm dm-title" data-dots="${esc(text)}" data-grid data-boot aria-hidden="true"></span>`;
  });
  document.querySelectorAll("[data-dots]").forEach((el) => {
    el.innerHTML = dots(el.dataset.dots, { grid: el.hasAttribute("data-grid"), rows: +el.dataset.rows || ROWS, label: el.dataset.label });
  });

  /* ---------- Nav: raised once scrolled; current section marked ---------- */
  const sectionRail = document.querySelector(".section-rail");
  if (sectionRail) {
    const compact = matchMedia("(max-width: 1199px)");
    const setRail = () => { sectionRail.open = !compact.matches; };
    setRail();
    compact.addEventListener("change", setRail);
  }
  const top = document.getElementById("top");
  if (top) {
    const onScroll = () => top.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    const links = [...document.querySelectorAll('[data-section-nav] a[href^="#"]')];
    const secs = links.map((a) => {
      const target = document.querySelector(a.getAttribute("href"));
      return target?.closest(".home-panel") || target;
    });
    // Match the sticky header's actual height, including wrapped navigation or zoom.
    if (document.documentElement.classList.contains("home-story")) {
      const measureHeader = () => document.documentElement.style.setProperty("--home-header", `${top.offsetHeight}px`);
      measureHeader();
      new ResizeObserver(measureHeader).observe(top);
    }
    if (secs.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a, i) => {
          if (secs[i] === e.target) a.setAttribute("aria-current", "location");
          else a.removeAttribute("aria-current");
        });
      }), { rootMargin: "-40% 0px -55% 0px" });
      secs.filter(Boolean).forEach((s) => io.observe(s));
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

  /* ---------- Pathway gauge: from general to surgical competence ----------
     One dot per step of the track; dots up to the current position are lit, the head blinks. */
  const gauge = document.getElementById("gauge");
  if (gauge) {
    const W = 1152, GAP = 12, n = Math.floor(W / GAP), at = +gauge.dataset.progress || 0;
    const head = Math.round((n - 1) * at), stations = [0, Math.round(n / 3), Math.round(2 * n / 3)];
    let dotsSvg = "";
    for (let i = 0; i < n; i++) {
      const st = stations.includes(i), cls = i < head ? "lit" : i === head ? "head" : "off";
      dotsSvg += `<circle class="${cls}${st ? " st" : ""}" cx="${i * GAP + GAP / 2}" cy="12" r="${st ? 5 : 2.6}"/>`;
    }
    gauge.setAttribute("viewBox", `0 0 ${W} 24`);
    gauge.innerHTML = dotsSvg;
  }

  /* ---------- Footer: contact from config.js, current year ---------- */
  const mail = typeof V.contact === "string" && /^[^\s@]+@[^\s@]+$/.test(V.contact) ? V.contact : null;
  document.querySelectorAll("[data-contact]").forEach((row) => {
    if (!mail) return;
    const a = row.querySelector("[data-contact-link]"); a.href = "mailto:" + mail; a.textContent = mail; row.hidden = false;
  });
  document.querySelectorAll("[data-year]").forEach((y) => { y.textContent = new Date().getFullYear(); });

  /* ---------- News ---------- */
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const niceDate = (d) => { const m = /^(\d{4})[.\-/](\d{1,2})/.exec(String(d)); return m ? `${MONTHS[+m[2] - 1]} ${m[1]}` : String(d); };
  const news = document.getElementById("news-list");
  if (news) news.innerHTML = V.news.map((n, i) => {
    const url = publicUrl(n.resource);
    const more = url ? ` <a class="link" href="${esc(url)}">${esc(n.label || "Read more")}</a>` : "";
    return `<li${i === 0 ? ' class="new"' : ""}><time>${esc(niceDate(n.date))}</time><span>${esc(n.text)}${more}</span></li>`;
  }).join("");

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
    const R = 15, N = 2 * R + 1, STEP_MS = 3600, names = ["Understand", "Solve", "Evolve"], lines = ["Can a general model understand surgery?", "Can an agent solve it with tools?", "Can it evolve toward competence?"];
    const cells = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = i - R, y = j - R;
      if (x * x + y * y <= (R + 0.3) ** 2) cells.push({ x, y, delay: Math.random() * 420 });
    }
    // Levels: 0 off, 1 brand, 2 signal (live), 3 faint
    const near = (a, b, w) => Math.abs(a - b) < w;
    const scenes = [
      (x, y, t) => { // Understand: an eye that looks around
        const half = 7.2 * (1 - (x / 13.5) ** 2), px = 4 * Math.sin(t * 1.3), py = 1.2 * Math.sin(t * 0.7);
        if (Math.abs(x) <= 13.5 && near(Math.abs(y), half, 0.62)) return 1;
        const d = Math.hypot(x - px, y - py);
        if (Math.abs(y) < half - 0.4 && d <= 4.6) return d <= 1.6 ? 0 : (Math.hypot(x - px - 1.6, y - py + 1.6) < 0.8 ? 2 : 1);
        return 0;
      },
      (() => { // Solve: the agent calls its tools one after another; each call goes out, the tool works, the result comes back
        const T = [[-9, -8], [9, -8], [9, 8], [-9, 8]], CALL = 1.3;
        const onSpoke = (x, y, [tx, ty]) => { const L = Math.hypot(tx, ty), u = (x * tx + y * ty) / (L * L); if (u < 0.22 || u > 0.78) return false; return Math.hypot(x - u * tx, y - u * ty) < 0.5; };
        return (x, y, t) => {
          const k = Math.floor(t / CALL) % T.length, f = (t / CALL) % 1, [tx, ty] = T[k];
          const g = f < 0.4 ? f / 0.4 : f < 0.6 ? 1 : 1 - (f - 0.6) / 0.4; // out, work, back
          const px = Math.round(tx * g * 0.78), py = Math.round(ty * g * 0.78);
          if (f < 0.4 || f > 0.6) { if (x === px && y === py) return 2; }
          for (let i = 0; i < T.length; i++) {
            const [qx, qy] = T[i], dx = Math.abs(x - qx), dy = Math.abs(y - qy);
            if (dx <= 2 && dy <= 2) {
              if (i === k && f >= 0.4 && f <= 0.6) return 2;               // the tool at work
              if (dx === 2 || dy === 2) return 1;
              return i === k && f > 0.6 && dx + dy === 0 ? 2 : 0;
            }
          }
          const d = Math.abs(x) + Math.abs(y);
          if (d <= 3) return d === 3 || d === 0 ? 1 : 0;                    // the agent
          for (const q of T) if (onSpoke(x, y, q) && (Math.abs(x) + Math.abs(y)) % 2 === 0) return 3;
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
        if (now - lastStepAt > STEP_MS) setStep((step + 1) % scenes.length, now);
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
    function loop(now) { if (now - last > 80) { t = Math.max(0.001, (now - start) / 1000); draw(); last = now; } raf = requestAnimationFrame(loop); }
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

  /* ---------- System map ----------
     Products are tinted regions (the Gym is an outlined room that contains SurgWiki).
     Dots appear only on the relations: dotted lines with packets stepping along them.
     Hovering a product card highlights its region. */
  const sys = document.getElementById("system");
  if (sys) {
    const NS = "http://www.w3.org/2000/svg";
    const compactSystem = matchMedia("(max-width: 640px)");
    const drawSystem = () => {
      const compact = compactSystem.matches;
      sys.setAttribute("viewBox", compact ? "0 0 360 650" : "0 0 900 404");
      const R = compact ? [
        { id: "bench", x: 0, y: 0, w: 360, h: 60, name: "SurgKnow-Bench" },
        { id: "gym", x: 0, y: 108, w: 360, h: 220, name: "SurgAgentGym", room: true },
        { id: "video", x: 12, y: 188, w: 164, h: 116, name: "Surgical video", minor: true },
        { id: "wiki", x: 184, y: 188, w: 164, h: 116, name: "SurgWiki" },
        { id: "agent", x: 0, y: 418, w: 220, h: 80, name: "SurgAgent" },
        { id: "evolve", x: 140, y: 562, w: 220, h: 84, name: "SurgAgentEvolve" }
      ] : [
        { id: "bench",  x: 0,   y: 0,   w: 520, h: 68,  name: "SurgKnow-Bench" },
        { id: "gym",    x: 0,   y: 120, w: 520, h: 228, name: "SurgAgentGym", room: true },
        { id: "video",  x: 24,  y: 200, w: 224, h: 124, name: "Surgical video", minor: true },
        { id: "wiki",   x: 272, y: 200, w: 224, h: 124, name: "SurgWiki" },
        { id: "agent",  x: 680, y: 144, w: 220, h: 96,  name: "SurgAgent" },
        { id: "evolve", x: 680, y: 320, w: 220, h: 84,  name: "SurgAgentEvolve" }
      ];
      const E = compact ? [
        { d: "M72 418 V328", label: "actions", lx: 4, ly: 378 },
        { d: "M164 328 V418", label: "observations", lx: 176, ly: 378 },
        { d: "M180 108 V60", label: "" },
        { d: "M328 328 V562", label: "trajectories", lx: 242, ly: 470, live: true },
        { d: "M140 604 H56 V498", label: "next version", lx: 68, ly: 548 }
      ] : [
        { d: "M680 176 H520", label: "actions", lx: 552, ly: 164 },
        { d: "M520 212 H680", label: "observations", lx: 552, ly: 236 },
        { d: "M260 120 V68", label: "" },
        { d: "M260 348 V362 H680", label: "trajectories", lx: 290, ly: 388, live: true },
        { d: "M790 320 V240", label: "next version", lx: 804, ly: 284 }
      ];
      // Dot textures for the regions: the same dot language as the rest of the page, kept fine enough to read through.
      let html = `<defs>` +
        `<pattern id="pd" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="1.25" class="pd"/></pattern>` +
        `<pattern id="pdm" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="1.25" class="pdm"/></pattern>` +
        `<pattern id="pdh" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="1.5" class="pdh"/></pattern></defs>`;
      R.forEach((r) => {
        html += `<g class="reg${r.room ? " room" : ""}${r.minor ? " minor" : ""}" data-r="${r.id}"><rect class="base" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="6"/><rect class="tex" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="6"/>` +
          `<text class="rn" x="${r.x + 20}" y="${r.y + 34}">${esc(r.name)}</text></g>`;
      });
      E.forEach((e, i) => { html += `<path id="sx${i}" class="edge" d="${e.d}"/>` + (e.label ? `<text class="el" x="${e.lx}" y="${e.ly}">${esc(e.label)}</text>` : ""); });
      sys.innerHTML = html + `<g id="pk"></g>`;

      const pk = sys.querySelector("#pk"), packets = [], GAP = 10;
      E.forEach((e, i) => {
        const path = sys.querySelector("#sx" + i), L = path.getTotalLength(), n = Math.floor(L / GAP / 5) * 5; // a multiple of the packet spacing, so packets never bunch up at the wrap
        for (let k = 0; k < n; k += 5) {
          const c = document.createElementNS(NS, "circle");
          c.setAttribute("r", "3.6"); c.setAttribute("class", "pk" + (e.live ? " live" : ""));
          pk.appendChild(c); packets.push({ c, path, n, k });
        }
      });
      const place = () => packets.forEach((p) => { const pt = p.path.getPointAtLength((p.k % p.n) * GAP); p.c.setAttribute("cx", pt.x); p.c.setAttribute("cy", pt.y); });
      place();
      return { packets, place };
    };
    let geometry = drawSystem();
    compactSystem.addEventListener("change", () => { geometry = drawSystem(); });
    let vis = false, last = 0;
    new IntersectionObserver((es) => { vis = es[0].isIntersecting; }).observe(sys);
    const step = (now) => { if (vis && now - last > 140) { geometry.packets.forEach((p) => p.k++); geometry.place(); last = now; } requestAnimationFrame(step); };
    if (!still) requestAnimationFrame(step);

    const hl = (id, on) => sys.querySelector(`.reg[data-r="${id}"]`)?.classList.toggle("hl", on);
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
