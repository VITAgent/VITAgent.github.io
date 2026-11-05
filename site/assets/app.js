"use strict";
/* VITAgent site behaviour.
   1. Dot-matrix type (wordmark, monograms) rendered as SVG.
   2. Links that switch on when config.js has a public URL.
   3. News, team, partners from config.js.
   4. Scope viewport: a procedural surgical field that resolves from coarse to fine pixels, once.
   5. Vital trace: the one continuously moving element. */
(() => {
  const V = window.VITAGENT || { links: {}, news: [], team: [], partners: [] };
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
  const team = document.getElementById("team-list");
  if (team) team.innerHTML = V.team.map((m) => {
    const ini = m.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    const name = m.url ? `<a href="${esc(m.url)}">${esc(m.name)}</a>` : esc(m.name);
    return `<li><div class="mono-tile">${dots(ini, { rows: 7, grid: true, label: m.name })}</div><b>${name}</b>${m.role ? `<span>${esc(m.role)}</span>` : ""}</li>`;
  }).join("");
  const partners = document.getElementById("partner-list");
  if (partners) partners.innerHTML = V.partners.map((p) => `<li>${esc(p)}</li>`).join("");

  /* ---------- Shared noise ---------- */
  function noise2(seed) {
    const h = (x, y) => { let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + seed; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967295; };
    const s = (t) => t * t * (3 - 2 * t);
    return (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = s(x - xi), yf = s(y - yi);
      const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
      return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
    };
  }

  /* ---------- Scope viewport ---------- */
  const scope = document.getElementById("scope");
  if (scope) {
    const N = 256, src = document.createElement("canvas"); src.width = src.height = N;
    const sx = src.getContext("2d"), img = sx.createImageData(N, N), nz = noise2(7), nz2 = noise2(31);
    const fbm = (x, y) => { let v = 0, a = 0.5, f = 1; for (let o = 0; o < 5; o++) { v += a * nz(x * f, y * f); f *= 2; a *= 0.5; } return v; };
    const mix = (a, b, t) => a + (b - a) * t;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const u = x / N, v = y / N, t = fbm(u * 4, v * 4), fat = Math.max(0, nz2(u * 3 + 2, v * 3) - 0.55) * 2.6;
      const fold = Math.abs(Math.sin((u * 3 + t * 2.2) * Math.PI)) ** 6;
      let r = mix(118, 196, t), g = mix(58, 112, t), b = mix(62, 108, t);
      r = mix(r, 214, fat * 0.8); g = mix(g, 182, fat * 0.8); b = mix(b, 112, fat * 0.8);
      const shade = 1 - fold * 0.35, spec = Math.max(0, fbm(u * 9 + 5, v * 9) - 0.7) * 3.3;
      const i = (y * N + x) * 4;
      img.data[i] = Math.min(255, r * shade + spec * 255); img.data[i + 1] = Math.min(255, g * shade + spec * 235); img.data[i + 2] = Math.min(255, b * shade + spec * 235); img.data[i + 3] = 255;
    }
    sx.putImageData(img, 0, 0);
    function tool(ax, ay, bx, by, w) { // a metallic instrument shaft entering from the rim
      const gr = sx.createLinearGradient(ax - w, ay, ax + w, ay + w);
      gr.addColorStop(0, "#5c666b"); gr.addColorStop(0.5, "#d9e0e3"); gr.addColorStop(1, "#4a5357");
      sx.strokeStyle = gr; sx.lineWidth = w; sx.lineCap = "butt";
      sx.beginPath(); sx.moveTo(ax, ay); sx.lineTo(bx, by); sx.stroke();
      const ang = Math.atan2(by - ay, bx - ax);
      sx.fillStyle = "#3b4246";
      for (const s of [-0.28, 0.28]) {
        sx.beginPath(); sx.moveTo(bx, by);
        sx.lineTo(bx + Math.cos(ang + s) * w * 2.1, by + Math.sin(ang + s) * w * 2.1);
        sx.lineTo(bx + Math.cos(ang + s * 0.4) * w * 2.3, by + Math.sin(ang + s * 0.4) * w * 2.3);
        sx.closePath(); sx.fill();
      }
    }
    tool(N * 1.05, N * 0.18, N * 0.6, N * 0.46, 16);
    tool(-N * 0.05, N * 0.95, N * 0.38, N * 0.6, 13);
    const vg = sx.createRadialGradient(N / 2, N / 2, N * 0.15, N / 2, N / 2, N * 0.52);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.75)");
    sx.fillStyle = vg; sx.fillRect(0, 0, N, N);

    const ctx = scope.getContext("2d"), small = document.createElement("canvas"), smx = small.getContext("2d");
    const steps = [6, 9, 14, 20, 28, 40, 56, 80, 112];
    function paint(res) {
      const d = scope.width;
      small.width = small.height = res;
      smx.imageSmoothingEnabled = true; smx.drawImage(src, 0, 0, res, res);
      ctx.clearRect(0, 0, d, d);
      ctx.save(); ctx.beginPath(); ctx.arc(d / 2, d / 2, d / 2, 0, Math.PI * 2); ctx.clip();
      ctx.imageSmoothingEnabled = false; ctx.drawImage(small, 0, 0, d, d);
      ctx.restore();
      scope.dataset.res = res;
      const lab = document.getElementById("scope-res");
      if (lab) lab.textContent = `${res} × ${res}`;
    }
    function size() { const r = scope.getBoundingClientRect(), dpr = devicePixelRatio || 1; scope.width = scope.height = Math.round(r.width * dpr); }
    let running = false;
    function resolve() {
      if (running) return; running = true;
      let i = 0;
      const go = () => { paint(steps[i]); if (++i < steps.length) setTimeout(go, 140 + i * 25); else running = false; };
      go();
    }
    size();
    if (still) paint(steps[steps.length - 1]); else resolve();
    addEventListener("resize", () => { size(); paint(+scope.dataset.res || steps[steps.length - 1]); });
    scope.closest(".scope")?.addEventListener("pointerenter", () => { if (!still) resolve(); });
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
