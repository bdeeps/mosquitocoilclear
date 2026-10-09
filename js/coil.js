// Shared parts for MosquitoCoilClear: the sums (spiral length, burn time, heat ahead of the ember,
// vapour pressure, the room, the nerve, resistance), chart boards, particles, the 3D coil and stand,
// and the layout rules every chapter follows. Scenes: +x right, +y up; each chapter says what one
// unit is. Nothing here is a recipe: the coil is described by the job each part does, and the only
// strengths given are the ones regulators print on finished-product labels.
import { THREE, M, box, beam, sphere, arrow, clamp, lerp, smooth } from './kit.js';

export { THREE, M, box, beam, sphere, clamp, lerp, smooth };
export const TAU = Math.PI * 2;

// ---------------------------------------------------------------- colours and formats
export const COL = { hot: '#ff7a59', heat: '#ffb547', cold: '#6fb6ff', ok: '#5ce1a9', bad: '#ff5d5d', text: '#e8eef8', smoke: '#cfd6e2', vapour: '#c49bff', coil: '#3f7d4a', coil2: '#2f6a8f', ash: '#b9b6b0', gold: '#f2c14e', pink: '#f59ee6', co2: '#8ef0ff', metal: '#b9bec8' };
export const hex = (c) => new THREE.Color(c).getHex();
export const fmt0 = (v) => Math.round(v).toLocaleString('en-IN');
export const fmtC = (v) => (v >= 100 ? fmt0(v) : v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v.toFixed(2));
export const fmtH = (h) => { const m = Math.round(h * 60); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`; };
export const link = (slug, name, hash = '') => `<a href="https://glassbox.how/${slug}/${hash ? '#' + hash : ''}">${name}</a>`;

// ================================================================ THE SUMS
// ---------------------------------------------------------------- 1. the spiral
// One arm of a coil is an Archimedean spiral: the radius shrinks by one "pitch" for every full
// turn, r(θ) = rOut − b θ with b = pitch ÷ 2π. Its exact length between two radii is
//   L = [ r √(r² + b²) + b² ln(r + √(r² + b²)) ] ÷ 2b, taken from rIn to rOut,
// which is very nearly  π (rOut² − rIn²) ÷ pitch: the area of the ring divided by the spacing.
// In a pressed pair the two arms are interleaved, so one arm's pitch is twice (arm width + gap).
export function spiralLen(rIn, rOut, pitch) {
  const b = pitch / TAU, F = (r) => (r * Math.hypot(r, b) + b * b * Math.log(r + Math.hypot(r, b))) / (2 * b);
  return F(rOut) - F(rIn);
}
export const spiralTurns = (rIn, rOut, pitch) => (rOut - rIn) / pitch;
// Typical size, measured figures: coils in chamber tests weighed 11.9 to 19.8 g and burned at 1.7 to
// 2.5 g an hour for 5.8 to 10 hours (Zhang, Jiang, Tong, Wang, Han and Zhang, "Using charcoal as base
// material reduces mosquito coil emissions of toxins", Indoor Air 20:176, 2010, Table 1).
// The default coil here: 118 mm across, arm 6.5 mm wide and 4 mm thick with a 0.5 mm gap (pitch 14 mm),
// starting 9 mm from the centre: about 68 cm of path. Burnt in 8 hours that is 1.4 mm a minute.
export const COIL = { dOut: 118, rIn: 9, arm: 6.5, gap: 0.5, thick: 4, density: 0.75 /* g/cm³, pressed biomass: gives 13 g */ };
export const BURN_MM_MIN = 1.42;        // still air; the default coil then lasts 8 hours
export function coilSums({ dOut = COIL.dOut, arm = COIL.arm, draught = 0 } = {}) {
  const pitch = 2 * (arm + COIL.gap), rOut = dOut / 2 - arm / 2, rIn = COIL.rIn;
  const L = spiralLen(rIn, rOut, pitch), turns = spiralTurns(rIn, rOut, pitch);          // mm
  // A draught feeds the ember more oxygen, so it runs faster (AgarbattiClear works this out from the
  // oxygen supply; here it is a plain factor: up to about half as fast again in a light breeze).
  // A thicker arm has more to burn per millimetre and loses less heat for its size, so the front
  // creeps a little slower: speed taken as ∝ 1/√(arm width), anchored at 6.5 mm.
  const v = BURN_MM_MIN * (1 + 0.5 * draught) * Math.sqrt(COIL.arm / arm);               // mm/min
  const hours = L / v / 60, grams = (L * arm * COIL.thick / 1000) * COIL.density;
  return { pitch, rIn, rOut, L, turns, v, hours, grams, gph: grams / hours, approx: Math.PI * (rOut * rOut - rIn * rIn) / pitch };
}

// ---------------------------------------------------------------- 2. heat ahead of the ember
// The ember is a smoulder (AgarbattiClear owns the full heat balance). Ahead of a front moving at
// speed v, the unburnt coil is warmed by conduction and cooled by the air. The steady answer is an
// exponential:  T(x) = T_room + (T_glow − T_room) e^(−x/λ),
//   1/λ = v/2α + √( (v/2α)² + hP/kA )
// with α the thermal diffusivity (1.5e-7 m²/s) and k the conductivity (0.15 W/mK) of pressed
// biomass, h = 15 W/m²K for still air round a thin strip, P and A the arm's perimeter and section.
// T_glow: no measurement of a coil's tip was found; the 610 to 640 °C measured by thermal camera
// on Indian incense sticks (Sowriraajan et al., Fire Technology 2023, quoted in AgarbattiClear) is
// used for the same kind of smoulder. So λ is about 2.7 mm: the coil is at room temperature a
// centimetre from the glow, and passes through 150 to 300 °C a few millimetres from it.
export const T_GLOW = 625, T_ROOM = 27;
export function heatAhead(vMmMin = BURN_MM_MIN, arm = COIL.arm) {
  const v = vMmMin / 60000, a = 1.5e-7, k = 0.15, h = 15, P = 2 * (arm + COIL.thick) / 1000, A = arm * COIL.thick / 1e6;
  const s = v / (2 * a), lam = 1000 / (s + Math.sqrt(s * s + (h * P) / (k * A)));        // mm
  const T = (x) => T_ROOM + (T_GLOW - T_ROOM) * Math.exp(-Math.max(0, x) / lam);
  const xAt = (C) => lam * Math.log((T_GLOW - T_ROOM) / (C - T_ROOM));
  return { lam, T, xAt };
}
// How readily an active leaves as vapour: the Clausius-Clapeyron line through two published points
// for transfluthrin (vapour pressure 9e-4 Pa at 20 °C; boils at 135 °C under 0.1 mbar = 10 Pa:
// WHO specification data, recalled, not re-read for this box). That gives a heat of vaporisation
// near 80 kJ/mol, ordinary for a molecule this size. The same law drives a perfume (PerfumeClear).
export const vapourP = (C) => 9e-4 * Math.exp(9684 * (1 / 293.15 - 1 / (C + 273.15)));   // Pa
export const EVAP_BAND = [150, 300];   // °C: vapour pressure from about 20 Pa to 10 kPa: leaves in seconds, well below the glow

// ---------------------------------------------------------------- 3. the room
// One well-mixed room, the same sum AgarbattiClear uses so the two boxes agree:
//   dC/dt = E ÷ V − (a + k) C      while the coil burns, then E = 0.
// E for smoke: fine particles (PM2.5) measured in chamber tests of whole coils:
//   ordinary sawdust or coconut-base coils 62.8 to 127 mg an hour; one charcoal-base "smokeless"
//   coil 12.6 mg an hour (Zhang et al., Indoor Air 2010, Table 2; the earlier Liu, Zhang et al.,
//   Environ. Health Perspect. 111:1454, 2003 found 63 to 117 mg an hour).
// E for the active: grams burnt an hour × label strength × the share that leaves as vapour instead
//   of being destroyed. That share is an ASSUMPTION here (0.6): published "vaporisation ratios"
//   vary with the coil (Abe, Oouchi and Fujita, Botyu-Kagaku 41:29, 1976, not read in full).
// a = air changes an hour: 0.3 shut tight, 5 or more with windows wide open. k = 0.2 per hour for
// particles settling (He, Morawska and Gilbert 2005, as in AgarbattiClear); the vapour is given
// the same k, standing in for what sticks to walls and cloth.
// Yardsticks for the 24-hour mean of PM2.5: WHO 2021 guideline 15 µg/m³; India's NAAQS (CPCB 2009) 60.
export const K_DEP = 0.2, WHO_24 = 15, NAAQS_24 = 60, ACH_SHUT = 0.3, ACH_OPEN = 5, VAPOUR_SHARE = 0.6;
export const SMOKE = { ordinary: [62.8, 127], typical: 90, charcoal: 12.6 };            // mg of PM2.5 an hour
export function roomRun({ E = 90, V = 30, ach = 0.5, burnH = 8, hours = 12, n = 240 }) {   // E in mg/h → µg/m³
  const L = ach + K_DEP, A = (E / (V * L)) * 1000;
  const at = (t) => { const up = A * (1 - Math.exp(-L * Math.min(t, burnH))); return t <= burnH ? up : up * Math.exp(-L * (t - burnH)); };
  const pts = []; for (let i = 0; i <= n; i++) { const t = (hours * i) / n; pts.push([t, at(t)]); }
  const total = E * burnH, night = (1 / burnH) * (A * burnH - (A / L) * (1 - Math.exp(-L * burnH)));   // mean while it burns
  return { at, pts, steady: A, peak: at(burnH), total, night, day: (total / (V * L)) * 1000 / 24, half: Math.log(2) / L };
}
// Label strengths of coils registered in India: "Pesticide formulations registered for use in the
// country under the Insecticides Act, 1968 (as on 01.06.2023)", the CIB&RC list.
export const ACTIVES = [
  { id: 'dta', name: 'd-trans allethrin', pct: 0.1 },
  { id: 'pra', name: 'Prallethrin', pct: 0.04 },
  { id: 'tra', name: 'Transfluthrin', pct: 0.03 },
  { id: 'met', name: 'Metofluthrin', pct: 0.005 },
];

// ---------------------------------------------------------------- 4. the nerve
// A Hodgkin-Huxley nerve membrane (the 1952 squid-axon equations, NervousClear's spike) with one
// change: a fraction f of the sodium channels is "modified". A modified channel opens normally but
// does not inactivate and is slow to shut, leaving a tail of sodium current after each spike
// (Narahashi's picture of how pyrethroids act). f comes from the dose by simple binding,
//   f = c ÷ (c + K),
// with K set from measurements on isolated nerve cells: 100 nM of allethrin modified 14% of the
// channels in cockroach neurons, while 100 µM modified only 4% in rat neurons, "slightly over
// 1,000-fold" apart (Narahashi, Zhao, Ikeda, Salgado and Yeh, Pestic. Biochem. Physiol. 97:149, 2010).
// Warmth shortens the tail: the charge carried falls to 0.22 of its value for each 10 °C (Song and
// Narahashi 1996, abstract), so  τ_tail = 60 ms × 0.22^((T − 20)/10).  The 60 ms is tuned so that an
// insect nerve at 27 °C fires repeatedly once roughly half a per cent of channels are modified; the
// measured figure is that 0.6% is enough.
export const K_NERVE = { insect: 614, mammal: 2.4e6 };     // nM
export const modified = (nM, animal) => nM / (nM + K_NERVE[animal]);
export function nerve({ f = 0, tempC = 27, ms = 90, dt = 0.01 }) {
  const gNa = 120, gK = 36, gL = 0.3, ENa = 50, EK = -77, EL = -54.4;
  let V = -65, m = 0.053, h = 0.596, n = 0.318, q = 0, spikes = 0, up = false, tail = 0, cnt = 0;
  const tauTail = 60 * Math.pow(0.22, (tempC - 20) / 10), pts = [], steps = Math.round(ms / dt);
  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    const am = 0.1 * (V + 40) / ((1 - Math.exp(-(V + 40) / 10)) || 1e-9), bm = 4 * Math.exp(-(V + 65) / 18);
    const ah = 0.07 * Math.exp(-(V + 65) / 20), bh = 1 / (1 + Math.exp(-(V + 35) / 10));
    const an = 0.01 * (V + 55) / ((1 - Math.exp(-(V + 55) / 10)) || 1e-9), bn = 0.125 * Math.exp(-(V + 65) / 80);
    const m3 = m * m * m;
    q += dt * (m3 > q ? (m3 - q) / 0.3 : -q / tauTail);
    const I = t >= 5 && t < 6 ? 15 : 0;
    const dV = I - gNa * ((1 - f) * m3 * h + f * q) * (V - ENa) - gK * n ** 4 * (V - EK) - gL * (V - EL);
    m += dt * (am * (1 - m) - bm * m); h += dt * (ah * (1 - h) - bh * h); n += dt * (an * (1 - n) - bn * n);
    V += dt * dV;
    if (V > 0 && !up) { up = true; spikes++; } if (V < -30) up = false;
    if (t > ms - 20) { tail += V; cnt++; }
    if (i % 10 === 0) pts.push([t, V]);
  }
  const rest = tail / cnt;
  const state = rest > -45 ? 'block' : spikes > 1 ? 'burst' : rest > -62 ? 'edgy' : 'normal';
  return { pts, spikes, rest, tauTail, state };
}

// ---------------------------------------------------------------- 5. resistance
// One gene, two versions: S (the ordinary sodium channel) and R (a "knock-down resistance", kdr,
// version that pyrethroids grip less well). Each generation a share `use` of mosquitoes meets a
// pyrethroid dose that kills most SS, some RS and few RR; R carries a small cost when there is no
// insecticide. Textbook selection:  p' = p (p wRR + (1 − p) wRS) ÷ w̄.
// The survival figures are illustrative round numbers, not measurements: SS 0.2, RS 0.5, RR 0.9
// when exposed; without exposure 1, 0.97, 0.94. About 12 generations a year in warm weather.
export function resistance({ use = 0.5, p0 = 0.01, gens = 60 }) {
  const w = (ex, nx) => use * ex + (1 - use) * nx, wSS = w(0.2, 1), wRS = w(0.5, 0.97), wRR = w(0.9, 0.94);
  let p = p0; const pts = [[0, p]]; let g50 = null;
  for (let g = 1; g <= gens; g++) {
    const q = 1 - p, wbar = p * p * wRR + 2 * p * q * wRS + q * q * wSS;
    p = clamp((p * (p * wRR + q * wRS)) / wbar, 0, 1); pts.push([g, p]);
    if (g50 == null && p >= 0.5) g50 = g;
  }
  const kill = (pp) => { const q = 1 - pp; return 1 - (pp * pp * 0.9 + 2 * pp * q * 0.5 + q * q * 0.2); };
  return { pts, g50, end: p, kill0: kill(p0), killEnd: kill(p), kill };
}

// ================================================================ BOARDS (live charts in 3D)
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.9)'; g.fillRect(0, 0, w, h); }
export function board(root, w, h, pxW, pxH, draw, pos) {
  const c = document.createElement('canvas'); c.width = pxW; c.height = pxH;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = () => { draw(g, pxW, pxH); tex.needsUpdate = true; };
  redraw();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  m.position.set(...pos); root.add(m);
  return { tex, redraw, canvas: c, mesh: m };
}
export function axes(g, w, h, { x0 = 84, x1 = w - 26, y0 = h - 62, y1 = 72, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, xLabel = '', yLabel = '', xLog = false, yLog = false }) {
  const fx = xLog ? Math.log : (v) => v, fy = yLog ? Math.log : (v) => v;
  const X = (x) => x0 + ((fx(Math.max(x, xLog ? xMin : -1e99)) - fx(xMin)) / (fx(xMax) - fx(xMin))) * (x1 - x0);
  const Y = (y) => y0 - ((fy(Math.max(y, yLog ? yMin : -1e99)) - fy(yMin)) / (fy(yMax) - fy(yMin))) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.7)'; g.font = '20px sans-serif';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 25); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 8 - g.measureText(s).width, Y(t) + 6); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.8)'; g.font = '19px sans-serif';
  if (xLabel) g.fillText(xLabel, x1 - g.measureText(xLabel).width, y0 + 50);
  if (yLabel) g.fillText(yLabel, x0 + 8, y1 - 8);
  return { X, Y, x0, x1, y0, y1 };
}
export function title(g, text, sub = '') {
  g.fillStyle = COL.text; g.font = 'bold 26px sans-serif'; g.fillText(text, 20, 36);
  if (sub) { const x = 34 + g.measureText(text).width; g.font = '19px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText(sub, x, 34); }
}
export function line(g, pts, X, Y, col, wdt = 4, dash = null) {
  if (pts.length < 2) return;
  g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.lineJoin = 'round'; g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
  g.stroke(); g.setLineDash([]);
}
export function dot(g, x, y, col, r = 9) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export function dashH(g, X0, X1, y, text = '', col = 'rgba(255,255,255,.55)') {
  g.strokeStyle = col; g.setLineDash([8, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(X0, y); g.lineTo(X1, y); g.stroke(); g.setLineDash([]);
  if (text) { g.font = 'bold 18px sans-serif'; g.fillStyle = col; g.fillText(text, X1 - g.measureText(text).width - 4, y - 6); }
}
// Horizontal bars with labels: rows [{ label, value, color, text }].
export function bars(g, rows, { x = 20, y = 60, w = 600, rowH = 46, labelW = 210, max = null, font = 17, log = null } = {}) {
  const mx = max ?? Math.max(1e-12, ...rows.map((r) => Math.abs(r.value))) * 1.12, span = w - labelW - 20;
  const len = (v) => (log ? clamp(Math.log(Math.max(v, log[0]) / log[0]) / Math.log(log[1] / log[0]), 0, 1) : clamp(Math.abs(v) / mx, 0, 1)) * span;
  rows.forEach((r, i) => {
    const yy = y + i * rowH, L = len(r.value);
    g.font = `bold ${font}px sans-serif`; g.fillStyle = r.lcol || r.color; g.fillText(r.label, x, yy + rowH * 0.5 + 2);
    g.globalAlpha = 0.9; g.fillStyle = r.color; g.fillRect(x + labelW, yy + 6, Math.max(2, L), rowH - 16); g.globalAlpha = 1;
    g.font = `${font - 1}px sans-serif`; const t = r.text ?? String(r.value), tw = g.measureText(t).width;
    const inside = x + labelW + L + 8 + tw > x + w; g.fillStyle = inside ? '#111' : '#fff';
    g.fillText(t, inside ? x + labelW + L - tw - 8 : x + labelW + L + 8, yy + rowH * 0.5 + 2);
  });
  return { len, x0: x + labelW };
}
export function wrap(g, text, x, y, maxW, lh) {
  let ln = '';
  for (const wd of text.split(' ')) { if (g.measureText(ln + wd).width > maxW && ln) { g.fillText(ln.trim(), x, y); y += lh; ln = ''; } ln += wd + ' '; }
  if (ln.trim()) { g.fillText(ln.trim(), x, y); y += lh; }
  return y;
}

// ================================================================ PARTICLES
export function rng(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export function dots(n, r, color = 0xffffff, { seg = 8, opacity = 1 } = {}) {
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), mat, n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false;
  const o = new THREE.Object3D(), col = new THREE.Color(color);
  for (let i = 0; i < n; i++) { mesh.setColorAt(i, col); o.position.set(0, -99, 0); o.scale.setScalar(0.0001); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); }
  mesh.place = (i, x, y, z, s = 1) => { o.position.set(x, y, z); o.scale.setScalar(Math.max(0.0001, s)); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); };
  mesh.tint = (i, c) => mesh.setColorAt(i, c);
  mesh.done = () => { mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; };
  return mesh;
}
// Puffs born at a source that drift: step(dt, rate, at, vel, life, tint, move, grow).
export function puffs(parent, n, r, color, rnd, opts = {}) {
  const d = dots(n, r, color, opts); parent.add(d);
  const P = Array.from({ length: n }, () => ({ life: 0, max: 1, age: 0, p: [0, -99, 0], v: [0, 0, 0], k: 0 }));
  let acc = 0;
  return {
    mesh: d, P,
    step(dt, rate, at, vel, life = 1.2, tint = null, move = null, grow = 0) {
      acc += rate * dt;
      for (let i = 0; i < n; i++) {
        const q = P[i];
        if (q.life <= 0 && acc >= 1) { acc -= 1; q.life = q.max = life * (0.8 + 0.4 * rnd()); q.age = 0; q.k = rnd(); q.p = at(q); q.v = vel(q); if (tint) d.tint(i, tint(q)); }
        if (q.life > 0) { q.life -= dt; q.age += dt; if (move) move(q, dt); else { q.p[0] += q.v[0] * dt; q.p[1] += q.v[1] * dt; q.p[2] += q.v[2] * dt; } }
        const k = clamp(q.life / q.max, 0, 1);
        d.place(i, q.p[0], q.p[1], q.p[2], q.life > 0 ? (0.4 + grow * (1 - k)) * Math.min(1, k * 5, (1 - k) * 12 + 0.25) : 0.0001);
      }
      if (acc > 30) acc = 30;
      d.done();
    },
    clear() { P.forEach((q) => { q.life = 0; }); acc = 0; },
  };
}
const UP = new THREE.Vector3(0, 1, 0), tmpV = new THREE.Vector3();
export function flowArrow(color, r = 0.045, head = 0.26) {
  const a = arrow(color, 1, head, r);
  a.traverse((o) => { if (o.material) { o.material.depthTest = false; o.renderOrder = 10; } });
  a.aim = (from, dir, len) => {
    a.position.set(...from); tmpV.set(...dir); if (tmpV.lengthSq() < 1e-9) tmpV.set(0, 1, 0);
    a.quaternion.setFromUnitVectors(UP, tmpV.normalize()); a.set(Math.max(0.001, len)); if (len < 0.05) a.visible = false;
  };
  return a;
}

// ================================================================ THE COIL
// One arm of a coil lying flat in the x-z plane with its centre at the origin, built as a strip of
// rectangular section along the spiral. Sizes in scene units (the caller picks the scale).
//   o: { rIn, rOut, pitch, width, thick, phase (angle of the outer end), color }
// The outer end is where it is lit; burn(k) hides the first k of the path and returns the point
// the ember has reached. pointAt(k) gives position and travel direction anywhere along the path.
export function makeCoil(o = {}) {
  const { rIn = 0.45, rOut = 2.75, pitch = 0.75, width = 0.32, thick = 0.2, phase = 0, color = COL.coil, seg = 420, hub = true } = o;
  const b = pitch / TAU, thMax = (rOut - rIn) / b, g = new THREE.Group();
  const P = (k) => { const th = k * thMax, r = rOut - b * th, a = phase - th; return { r, a, x: r * Math.cos(a), z: r * Math.sin(a) }; };
  const pos = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const { r, a } = P(i / seg), c = Math.cos(a), s = Math.sin(a), r0 = r - width / 2, r1 = r + width / 2;
    pos.push(r0 * c, 0, r0 * s, r1 * c, 0, r1 * s, r0 * c, thick, r0 * s, r1 * c, thick, r1 * s);
    if (i < seg) { const q = i * 4, n = q + 4; idx.push(q + 2, n + 2, q + 3, q + 3, n + 2, n + 3, q, q + 1, n, q + 1, n + 1, n, q, n, q + 2, q + 2, n, n + 2, q + 1, q + 3, n + 1, q + 3, n + 3, n + 1); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
  const flat = geo.toNonIndexed(); flat.computeVertexNormals(); geo.dispose();
  const mat = M.matte(hex(color), { side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(flat, mat); mesh.castShadow = mesh.receiveShadow = true; g.add(mesh);
  // the centre: a flat tongue with a slot that sits on the stand's prong
  let hubMesh = null;
  if (hub) {
    const e = P(1); hubMesh = new THREE.Mesh(new THREE.CylinderGeometry(width * 0.95, width * 0.95, thick, 24), mat);
    hubMesh.position.set(e.x * 0.55, thick / 2, e.z * 0.55); hubMesh.scale.set(1.25, 1, 0.9); hubMesh.rotation.y = -e.a; hubMesh.castShadow = true; g.add(hubMesh);
  }
  const emberMat = new THREE.MeshBasicMaterial({ color: 0xff5a1e, toneMapped: false });
  const ember = new THREE.Mesh(new THREE.BoxGeometry(width * 1.04, thick * 1.06, width * 0.7), emberMat); g.add(ember);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(width * 1.5, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.22, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })); g.add(halo);
  const ash = new THREE.Mesh(new THREE.BoxGeometry(width * 0.8, thick * 0.7, width * 1.5), M.matte(hex(COL.ash))); ash.castShadow = true; g.add(ash);
  const light = new THREE.PointLight(0xff6a2a, 0.9, width * 30, 2); g.add(light);
  let kNow = 0;
  const api = {
    g, mesh, hub: hubMesh, ember, ash, halo, light, mat, thick, width, length: spiralLen(rIn, rOut, pitch),
    pointAt(k) { const p = P(clamp(k, 0, 1)); return { x: p.x, z: p.z, a: p.a, r: p.r, tx: Math.sin(p.a), tz: -Math.cos(p.a) }; },
    burn(k, lit = true) {
      kNow = clamp(k, 0, 0.995);
      const i0 = Math.floor(kNow * seg); flat.setDrawRange(i0 * 24, (seg - i0) * 24);
      const p = api.pointAt(kNow); ember.position.set(p.x, thick / 2, p.z); ember.rotation.y = -p.a; halo.position.set(p.x, thick * 0.8, p.z); light.position.set(p.x, thick * 1.6, p.z);
      // the ash hangs on behind the ember for a little way, then falls
      const q = api.pointAt(Math.max(0, kNow - 0.012)); ash.position.set(q.x, thick * 0.4, q.z); ash.rotation.y = -q.a;
      ember.visible = halo.visible = lit; light.visible = lit; ash.visible = lit && kNow > 0.004;
      return p;
    },
    glow(time = 0, lit = true) { const f = 0.85 + 0.15 * Math.sin(time * 3.1); emberMat.color.setRGB(1, 0.36 * f, 0.1 * f); halo.material.opacity = lit ? 0.16 + 0.1 * f : 0; light.intensity = lit ? 0.7 + 0.5 * f : 0; },
    tip: () => api.pointAt(kNow),
  };
  api.burn(0, false);
  return api;
}
// The stand: a strip of thin sheet metal with one prong bent up. The coil's centre slot sits on the
// prong, so the whole spiral hangs in air and the ember never touches anything.
export function makeStand(h = 0.9, s = 1) {
  const g = new THREE.Group(), mt = M.metal(0xc3c8d0, { roughness: 0.4 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.5 * s, 0.03 * s, 0.42 * s), mt); base.position.y = 0.015 * s; base.castShadow = base.receiveShadow = true;
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.42 * s, 0.03 * s, 1.1 * s), mt); foot.position.y = 0.015 * s; foot.receiveShadow = true;
  const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.012 * s, 0.07 * s, h, 4), mt); prong.position.y = h / 2; prong.scale.z = 0.25; prong.castShadow = true;
  g.add(base, foot, prong);
  return g;
}
// A mosquito, drawn simply: body, head, two wings, six legs suggested by three lines. Faces +x.
export function makeMosquito(s = 1, color = 0x2a2623) {
  const g = new THREE.Group(), mt = M.matte(color), wing = M.clear(0xdfe8f5, 0.35);
  const ab = new THREE.Mesh(new THREE.CapsuleGeometry(0.035 * s, 0.26 * s, 4, 8), mt); ab.rotation.z = Math.PI / 2 + 0.25; ab.position.set(-0.14 * s, -0.03 * s, 0);
  const th = new THREE.Mesh(new THREE.SphereGeometry(0.07 * s, 10, 8), mt), hd = new THREE.Mesh(new THREE.SphereGeometry(0.04 * s, 8, 6), mt); hd.position.set(0.1 * s, -0.01 * s, 0);
  const pr = beam([0.12 * s, -0.02 * s, 0], [0.3 * s, -0.1 * s, 0], 0.008 * s, mt, 5);
  const w1 = new THREE.Mesh(new THREE.CircleGeometry(0.16 * s, 12), wing), w2 = w1.clone();
  w1.scale.set(1.5, 0.4, 1); w2.scale.set(1.5, 0.4, 1); w1.rotation.set(-Math.PI / 2 + 0.5, 0, 0.5); w2.rotation.set(-Math.PI / 2 - 0.5, 0, 0.5); w1.position.set(-0.12 * s, 0.08 * s, 0.08 * s); w2.position.set(-0.12 * s, 0.08 * s, -0.08 * s);
  g.add(ab, th, hd, pr, w1, w2);
  [-1, 0, 1].forEach((i) => [1, -1].forEach((sd) => { g.add(beam([i * 0.04 * s, -0.04 * s, 0], [i * 0.1 * s, 0.06 * s, sd * 0.14 * s], 0.006 * s, mt, 4), beam([i * 0.1 * s, 0.06 * s, sd * 0.14 * s], [i * 0.16 * s, -0.2 * s, sd * 0.2 * s], 0.006 * s, mt, 4)); }));
  g.userData.wings = [w1, w2];
  return g;
}

// ================================================================ LAYOUT
// The readout covers the upper left of the stage, so models stay low on the left or stand in the
// middle, and the two chart boards stack on the right.
export const VIEW = { pos: [2.2, 5.0, 11.6], target: [2.2, 4.2, 0] };
export const REEL_VIEW = { pos: [1.9, 3.9, 12.4], target: [1.9, 3.4, 0] };   // square and 16:9 recordings
export const TALL = { pos: [-0.2, 6.0, 8.4], target: [-0.2, 5.7, 0] };       // the portrait reel
export const BW = 5.0, BH = 2.88, B1 = [5.85, 6.0, 0], B2 = [5.85, 2.95, 0];
export const inReel = () => document.body.classList.contains('gb-reel');
export function fitNarrow(stage, minor = []) {
  const narrow = stage.host.clientWidth < 560 && !inReel();
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  const y = narrow ? -0.2 : 0;
  if (!stage.shift || stage.shift[1] !== y) stage.setShift(0, y);
  return narrow;
}
// Boards sit to the right of the model. In a tall (portrait) reel only the main board is kept, large,
// across the top, and the model (a group) is enlarged to fill the frame below it; a phone keeps one
// board, low on the right.
export function layout(stage, boards, model = null, { primary = 0, tallX = -0.2, tallScale = 1.3, tallAt = null, scale = 1 } = {}) {
  const r = inReel(), tall = r && stage.camera.aspect < 0.9, wide = r && !tall;
  const narrow = stage.host.clientWidth < 560 && !r;
  boards.forEach((b, i) => {
    if (!b.home) b.home = b.mesh.position.clone();
    b.mesh.visible = !(narrow || tall) || i === primary;
    if (tall) { b.mesh.position.set(tallX, 11.45, 0); b.mesh.scale.setScalar(1.42); }
    else if (narrow && i === primary) { b.mesh.position.set(5.9, 2.3, 0); b.mesh.scale.setScalar(1); }
    else { b.mesh.position.copy(b.home); b.mesh.scale.setScalar(1); }
  });
  if (model) {
    if (!model.userData.home) model.userData.home = model.position.clone();
    if (tall) { model.scale.setScalar(tallScale); model.position.fromArray(tallAt || [tallX, 0, 0]); }
    else { model.scale.setScalar(scale); model.position.copy(model.userData.home); }
  }
  if (tall && stage.home?.pos !== TALL.pos) stage.setView(TALL.pos, TALL.target, 0.01);
  if (wide && stage.home?.pos !== REEL_VIEW.pos) { stage.controls.autoRotate = false; stage.setView(REEL_VIEW.pos, REEL_VIEW.target, 0.01); }
  return { tall, narrow, wide };
}
