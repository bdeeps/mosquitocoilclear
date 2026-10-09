// Chapter 4: the room. One well-mixed room (1 unit ≈ 0.7 m) with a bed, a coil on the floor, a
// window, a grey haze that follows the computed PM2.5 and violet dots that follow the vapour.
// Model: roomRun() in coil.js, the same sum AgarbattiClear uses:  dC/dt = E ÷ V − (a + k) C.
//   Smoke E: PM2.5 from whole coils in chamber tests: 62.8 to 127 mg an hour for ordinary coils,
//     12.6 mg an hour for a charcoal-base "smokeless" coil (Zhang, Jiang, Tong, Wang, Han and Zhang,
//     Indoor Air 20:176, 2010, Table 2).
//   Vapour E: grams burnt an hour × label strength × 0.6 (the share assumed to leave as vapour).
//   a: 0.3 air changes an hour shut tight, 5 or more wide open. k = 0.2 per hour.
// Yardsticks (24-hour mean PM2.5): WHO 2021 guideline 15 µg/m³; India's NAAQS (CPCB 2009) 60.
// Liu, Zhang, Hashim, Jalaludin, Hashim and Goldstein, Environ. Health Perspect. 111:1454 (2003):
//   "burning one mosquito coil would release the same amount of PM2.5 mass as burning 75-137
//   cigarettes"; formaldehyde "as high as" 51 cigarettes; predicted room levels "could substantially
//   exceed health-based air quality standards or guidelines".
// The model does not turn vapour into "bites prevented": no dose-response is assumed. It shows
// only that the same air change removes the same share of both.
import { THREE, M } from '../kit.js';
import { COL, hex, VIEW, BW, BH, B1, B2, board, panelBg, title, axes, line, dot, dashH, puffs, rng, makeCoil, makeStand, flowArrow, layout, fitNarrow, roomRun, coilSums, ACTIVES, WHO_24, NAAQS_24, ACH_SHUT, ACH_OPEN, VAPOUR_SHARE, SMOKE, fmt0, fmtC, fmtH, link, clamp } from '../coil.js';

const HOURS = 12, BURN = 8;

export default {
  id: 'room',
  short: 'In the room',
  title: 'In the room: vapour, smoke and a window',
  subtitle: 'The same fresh air that clears the smoke also thins the protection.',
  view: VIEW,
  learn: `<p>A burning coil puts two things into a room. One is the <b>vapour</b> of the active ingredient, which is the point. The other is <b>smoke</b>: fine particles, called <b>PM2.5</b>, and gases from the smouldering base, which nobody wants. The model treats the room as one stirred box and does a simple sum for each: what the coil adds, minus what <b>air changes</b> carry out and what settles.</p>
    <p>The smoke numbers are large. Chamber tests found ordinary coils give off <b>63 to 127 mg</b> of PM2.5 an hour, for about eight hours. In a shut 30 m³ bedroom that pushes fine dust into the <b>thousands</b> of micrograms per cubic metre. The World Health Organization's guideline for a day's average is <b>15</b>; India's standard is 60.</p>
    <p>You may have heard that "one coil equals 100 cigarettes". The real finding, from a 2003 study, is that one whole coil gives off as much PM2.5 <b>mass</b> as 75 to 137 cigarettes, and as much formaldehyde as up to 51. That is a fair measure of how much fine dust enters the room. It does <b>not</b> mean a night beside a coil is the same as smoking that many: you breathe only a share of the room's air, and coil smoke and tobacco smoke are different mixtures.</p>
    <p>Now open the window. Every air change sweeps out the same fraction of <b>everything</b> in the air, so the smoke and the vapour fall together. There is no setting that clears one and keeps the other. The honest trade is this: a shut room gives the most vapour and the most smoke; an airy room gives less of both. Labels ask for a ventilated room, and a coil that smokes less (a charcoal base gave about a fifth to a tenth of the particles in one test) changes the sum without touching the vapour. (${link('agarbatticlear', 'AgarbattiClear', 'room')} does the same room sum for incense, and ${link('combustionclear', 'CombustionClear', 'limits')} explains the deadlier danger of any fire in a sealed room: carbon monoxide.)</p>
    <p class="tip"><b>Try it:</b> slide the fresh air from shut to wide open and watch both curves drop by the same share. Then switch to the low-smoke coil.</p>`,
  terms: [
    { t: 'PM2.5', d: 'The mass of particles finer than 2.5 micrometres in a cubic metre of air, in micrograms (µg/m³).' },
    { t: 'Air changes per hour', d: 'How many room-fulls of fresh air replace the old air each hour. About 0.3 with everything shut, 5 or more with windows wide open.' },
    { t: 'Emission rate', d: 'How much of something a source gives off each hour.' },
    { t: 'Well-mixed room', d: 'A model that treats the air in a room as evenly stirred. Real rooms have more of everything near the coil.' },
    { t: 'WHO guideline', d: 'The World Health Organization\'s 2021 advice: PM2.5 should average no more than 15 µg/m³ over a day.' },
    { t: 'Steady level', d: 'The concentration at which what the coil adds each hour equals what the air removes.' },
  ],
  defaults: { ach: 0.5, V: 30, pm: 90, active: 'dta', fast: 60 },
  controls: [
    { key: 'ach', type: 'log', label: 'Fresh air', min: 0.2, max: 10, ends: ['shut tight', 'windows wide open'], fmt: (v) => v.toFixed(1) + ' air changes an hour' },
    { key: 'V', type: 'range', label: 'Room size', min: 10, max: 80, step: 1, ends: ['small room', 'big hall'], fmt: (v) => v.toFixed(0) + ' m³' },
    { key: 'pm', type: 'range', label: 'How smoky the coil is', min: 12, max: 130, step: 1, ends: ['charcoal base', 'smokiest tested'], fmt: (v) => v.toFixed(0) + ' mg of PM2.5 an hour', hint: 'Measured: ordinary coils 63 to 127, one charcoal-base coil 12.6.' },
    { key: 'active', type: 'seg', label: 'Active on the label', options: ACTIVES.map((a) => ({ v: a.id, label: a.name })) },
    { key: 'fast', type: 'seg', label: 'Time', options: [{ v: 30, label: '30 min a second' }, { v: 60, label: '1 h a second' }, { v: 120, label: '2 h a second' }] },
    { key: 'go', type: 'buttons', label: 'Your move', items: [{ label: 'Light a fresh coil', act: (s, inst) => inst.reset() }, { label: 'Low-smoke coil', act: (s) => { s.pm = 13; } }, { label: 'Ordinary coil', act: (s) => { s.pm = 90; } }] },
  ],
  quiz: [
    { q: 'You open the window wide. What happens to the insecticide vapour in the room?', options: ['It stays the same: only smoke leaves', 'It falls by the same share as the smoke', 'It rises', 'It turns into smoke'], answer: 1, why: 'Fresh air carries out the same fraction of everything mixed into the room air. Smoke and vapour fall together.' },
    { q: 'What does "one coil gives off as much PM2.5 as 75 to 137 cigarettes" mean?', options: ['Sleeping near a coil is exactly like smoking 100 cigarettes', 'The total mass of fine particles the coil emits matches that many cigarettes', 'The coil contains tobacco', 'Nothing: it is made up'], answer: 1, why: 'It compares the mass of fine particles given off. How much reaches your lungs depends on the room, the air changes and the time.' },
    { q: 'Which change cuts the smoke without cutting the vapour?', options: ['Opening the door', 'A bigger room', 'A coil with a base that smokes less', 'A fan blowing the air out'], answer: 2, why: 'Air changes and room size dilute both. A lower-smoke base lowers only the particle emission; the active still evaporates as before.' },
  ],
  reel: [
    { ms: 5800, caption: 'In a shut bedroom one coil lifts fine dust into the thousands of micrograms per cubic metre. The WHO day guide is 15.', set: { ach: 0.3, V: 30, pm: 90, active: 'dta', fast: 120 }, act: (s, inst) => inst.reset(), spin: 0 },
    { ms: 5800, caption: 'Open the window and the smoke falls. So does the vapour, by exactly the same share.', set: { V: 30, pm: 90, active: 'dta', fast: 60 }, anim: { ach: [0.3, 6, true] }, act: (s, inst) => inst.reset(0.4), spin: 0 },
  ],

  build({ stage, s: s0 }) {
    const root = new THREE.Group(); stage.root.add(root);
    const model = new THREE.Group(); model.position.set(-0.35, 0, 0); root.add(model);
    const rnd = rng(31), Q = coilSums({});
    const runs = (s, ach = s.ach) => {
      const a = ACTIVES.find((x) => x.id === s.active), Ev = Q.gph * a.pct * 10 * VAPOUR_SHARE;      // mg of vapour an hour
      return { pm: roomRun({ E: s.pm, V: s.V, ach, burnH: BURN, hours: HOURS }), vap: roomRun({ E: Ev, V: s.V, ach, burnH: BURN, hours: HOURS }), Ev, a };
    };
    let S = { ...s0 }, R = runs(s0), Rref = runs(s0, ACH_SHUT), key = '', th = 0, dkey = '';

    // ---- the room
    const W = 5.0, H = 3.5, D = 3.2, room = new THREE.Group(); model.add(room);
    const wallMat = M.matte(0x39414f), floor = new THREE.Mesh(new THREE.BoxGeometry(W, 0.1, D), M.matte(0x5a4a3c)); floor.position.set(0, 0.05, 0); floor.receiveShadow = true; room.add(floor);
    const mkWall = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), wallMat); m.position.set(x, y, -D / 2); m.receiveShadow = true; room.add(m); };
    const WX = 1.2, WW = 1.5, WY = 1.3, WH = 1.5;
    mkWall(W, WY, 0, WY / 2 + 0.1); mkWall(W, H - WY - WH, 0, WY + WH + (H - WY - WH) / 2 + 0.1);
    mkWall(WX - WW / 2 + W / 2, WH, (-W / 2 + WX - WW / 2) / 2, WY + WH / 2 + 0.1); mkWall(W / 2 - WX - WW / 2, WH, (W / 2 + WX + WW / 2) / 2, WY + WH / 2 + 0.1);
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.08, H, D), wallMat); side.position.set(-W / 2, H / 2 + 0.1, 0); room.add(side);
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(WW, WH), new THREE.MeshBasicMaterial({ color: 0x1d2d52, toneMapped: false })); sky.position.set(WX, WY + WH / 2 + 0.1, -D / 2 - 0.06); room.add(sky);
    const moon = new THREE.Mesh(new THREE.CircleGeometry(0.16, 20), new THREE.MeshBasicMaterial({ color: 0xf4efd8, toneMapped: false })); moon.position.set(WX + 0.35, WY + WH - 0.3, -D / 2 - 0.05); room.add(moon);
    const glass = M.clear(0xcfe8ff, 0.28), frameMat = M.matte(0xd8d2c4);
    const mkSash = () => { const g = new THREE.Group(), p = new THREE.Mesh(new THREE.BoxGeometry(WW / 2, WH, 0.03), glass); g.add(p); [[0, WH / 2, WW / 2, 0.06], [0, -WH / 2, WW / 2, 0.06], [-WW / 4, 0, 0.06, WH], [WW / 4, 0, 0.06, WH]].forEach(([x, y, w, h]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), frameMat); b.position.set(x, y, 0); g.add(b); }); room.add(g); return g; };
    const sashL = mkSash(), sashR = mkSash();
    // a bed with a sleeper
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 1.2), M.matte(0x7a5a3a)); bed.position.set(-0.9, 0.62, -0.8); bed.castShadow = true;
    const mat = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.14, 1.1), M.matte(0xd9d4c7)); mat.position.set(-0.9, 0.8, -0.8);
    [[-2.1, -1.3], [0.3, -1.3], [-2.1, -0.3], [0.3, -0.3]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), M.matte(0x5a3f28)); l.position.set(x, 0.35, z); room.add(l); });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 1.3, 6, 12), M.matte(0x3f6f8f)); body.rotation.z = Math.PI / 2; body.position.set(-0.75, 1.05, -0.8); body.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), M.matte(0x8f6a4f)); head.position.set(-1.85, 1.07, -0.8);
    room.add(bed, mat, body, head);
    // the coil on the floor, well clear of the bed
    const stand = makeStand(0.26, 0.4); stand.position.set(1.35, 0.1, 0.75); room.add(stand);
    const coil = makeCoil({ rIn: 0.08, rOut: 0.42, pitch: 0.115, width: 0.05, thick: 0.035, seg: 260 }); coil.g.position.set(1.35, 0.36, 0.75); room.add(coil.g);
    const haze = puffs(model, 420, 0.06, 0xdfe6f2, rnd, { opacity: 0.4 });
    const vapD = puffs(model, 160, 0.045, hex(COL.vapour), rnd, { opacity: 0.85 });
    const plume = puffs(model, 50, 0.04, 0xf3f6fb, rnd, { opacity: 0.55 });
    const aIn = flowArrow(hex(COL.cold), 0.04, 0.22), aOut = flowArrow(hex(COL.smoke), 0.04, 0.22); model.add(aIn, aOut);
    const lNow = stage.label('', [0.2, H + 0.45, 0], model, 'hot');
    const lWin = stage.label('', [WX, WY - 0.25, -D / 2 + 0.3], model);
    const lCoil = stage.label('coil, clear of the bed', [1.35, 0.75, 0.75], room);

    const b1 = board(root, BW, BH, 632, 364, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Smoke: fine dust (PM2.5)');
      const top = Math.max(10000, R.pm.peak * 1.4, Rref.pm.peak * 1.4);
      const { X, Y, x0, x1, y0, y1 } = axes(g, w, h, { xMin: 0, xMax: HOURS, yMin: 1, yMax: top, yLog: true, xTicks: [0, 2, 4, 6, 8, 10, 12], yTicks: [1, 10, 100, 1000, 10000], xFmt: (v) => v + ' h', yFmt: (v) => fmt0(v), yLabel: 'µg per m³', x0: 84 });
      dashH(g, x0, x1, Y(WHO_24), 'WHO, day\'s average: 15', COL.ok); dashH(g, x0, x1, Y(NAAQS_24), 'India: 60', COL.gold);
      line(g, Rref.pm.pts.filter((p) => p[1] >= 1), X, Y, 'rgba(255,122,89,.75)', 3, [8, 6]);
      line(g, R.pm.pts.filter((p) => p[1] >= 1 || p[0] < 1), X, Y, COL.smoke, 5);
      g.font = 'bold 17px sans-serif'; g.fillStyle = COL.hot; g.fillText('dashed: room shut tight', x0 + 170, y1 + 4);
      const c = R.pm.at(th); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(th), y1); g.lineTo(X(th), y0); g.stroke();
      if (c >= 1) dot(g, X(th), Y(c), COL.hot, 8);
      g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('coil ends', X(BURN) - 34, y0 - 8);
    }, B1);
    const b2 = board(root, BW, BH, 632, 364, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Vapour: the active', R.a.name + ' ' + R.a.pct + '%');
      const top = Math.max(1e-3, Rref.vap.peak * 1.25, R.vap.peak * 1.25), stepY = top / 4;
      const { X, Y, x0, y0, y1 } = axes(g, w, h, { xMax: HOURS, yMax: top, xTicks: [0, 2, 4, 6, 8, 10, 12], yTicks: [0, stepY, 2 * stepY, 3 * stepY, top], xFmt: (v) => v + ' h', yFmt: (v) => fmtC(v), yLabel: 'µg per m³', x0: 84 });
      line(g, Rref.vap.pts, X, Y, 'rgba(255,122,89,.75)', 3, [8, 6]);
      line(g, R.vap.pts, X, Y, COL.vapour, 5);
      const c = R.vap.at(th); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(th), y1); g.lineTo(X(th), y0); g.stroke(); dot(g, X(th), Y(c), COL.vapour, 8);
      const pc = (R.vap.steady / Rref.vap.steady) * 100;
      g.font = 'bold 18px sans-serif'; g.fillStyle = COL.vapour; g.fillText(`${pc.toFixed(0)}% of the shut-room level: smoke is at ${pc.toFixed(0)}% too`, x0 + 12, y1 + 4);
    }, B2);

    const reset = (frac = 0) => { th = frac * HOURS; haze.clear(); vapD.clear(); };
    return {
      reset,
      update(dt, s, time) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        layout(stage, [b1, b2], model, { tallScale: 1.4, tallAt: [-0.2, 1.4, 0] });
        const narrow = fitNarrow(stage, [lWin, lCoil]);
        const k = `${s.active}|${Math.round(s.pm)}|${s.V}|${s.ach.toFixed(2)}`;
        if (k !== key) { key = k; R = runs(s); Rref = runs(s, ACH_SHUT); dkey = ''; b2.redraw(); }
        th += (dt * s.fast) / 60; if (th > HOURS) reset();
        const c = R.pm.at(th), cv = R.vap.at(th), burning = th < BURN, frac = clamp(th / BURN, 0, 1);
        const sc = Math.pow(s.V / 30, 1 / 3); room.scale.setScalar(clamp(sc, 0.75, 1.22) * 1.18);
        const RS = room.scale.x;
        const open = clamp(Math.log(s.ach / 0.3) / Math.log(10 / 0.3), 0, 1);
        sashL.position.set(WX - WW / 4 - open * WW * 0.42, WY + WH / 2 + 0.1, -D / 2 + 0.06); sashR.position.set(WX + WW / 4 + open * WW * 0.42, WY + WH / 2 + 0.1, -D / 2 + 0.1);
        coil.burn(frac, burning); coil.glow(time, burning);
        const dens = clamp(Math.log10(Math.max(c, 1) / 10) / Math.log10(5000 / 10), 0, 1), life = 4;
        const inRoom = () => [(-W / 2 + 0.2 + rnd() * (W - 0.4)) * RS, (0.2 + rnd() * (H - 0.3)) * RS, (-D / 2 + 0.2 + rnd() * (D - 0.4)) * RS];
        const drift = () => [(rnd() - 0.5) * 0.18 + open * 0.25, (rnd() - 0.5) * 0.1, (rnd() - 0.5) * 0.1 - open * 0.2];
        haze.step(dt, dens * 420 / life, inRoom, drift, life, null, null, 0.9);
        const vd = clamp(cv / Math.max(1e-9, Rref.vap.steady), 0, 1);
        vapD.step(dt, vd * 160 / life, inRoom, drift, life, null, null, 0.3);
        const tp = coil.tip(), tx = (1.35 + tp.x) * RS, ty = 0.42 * RS, tz = (0.75 + tp.z) * RS;
        plume.step(dt, burning ? 12 * clamp(s.pm / 90, 0.15, 1.4) : 0, () => [tx, ty, tz], () => [(rnd() - 0.5) * 0.12, 0.55, (rnd() - 0.5) * 0.1], 2.4, null, null, 1.3);
        aIn.aim([(WX - 0.3) * RS, (WY + 0.45) * RS, (-D / 2 - 1.0) * RS], [0, 0, 1], open > 0.12 ? 0.5 + open * 0.9 : 0);
        aOut.aim([(WX + 0.3) * RS, (WY + WH - 0.3) * RS, (-D / 2 + 0.5) * RS], [0, 0.1, -1], open > 0.12 ? 0.5 + open * 0.9 : 0);
        lNow.position.set(0.2 * RS, (H + 0.45) * RS, 0);
        lNow.element.innerHTML = narrow ? `<b>${fmtH(th)}</b>` : `<b>${fmtH(th)}</b> · smoke ${fmtC(c)} · vapour ${fmtC(cv)} µg/m³${burning ? '' : ' · coil finished'}`;
        lWin.position.set(WX * RS, (WY + WH + 0.32) * RS, (-D / 2 + 0.1) * RS);
        lWin.element.textContent = s.ach < 0.45 ? 'window shut' : s.ach < 1.5 ? 'window ajar' : s.ach < 4 ? 'window open' : 'windows wide open'; lWin.visible = !narrow;
        const dk = `${key}|${Math.round(th * 20)}`;
        if (dk !== dkey) { dkey = dk; b1.redraw(); b2.redraw(); }
        void ACH_OPEN; void SMOKE;
      },
      readout: () => {
        const c = R.pm.at(th), cv = R.vap.at(th), pc = (R.vap.steady / Rref.vap.steady) * 100, col = R.pm.day > NAAQS_24 ? COL.bad : R.pm.day > WHO_24 ? COL.heat : COL.ok;
        return `<div class="big">After ${fmtH(th)}</div>
          <div class="row"><span>Smoke (PM2.5) now</span><b>${fmtC(c)} µg/m³</b></div>
          <div class="row"><span>Vapour now</span><b>${fmtC(cv)} µg/m³</b></div>
          <div class="row"><span>Both, against a shut room</span><b>${pc.toFixed(0)}%</b></div>
          <div class="row"><span>Smoke, mean while it burns</span><b>${fmt0(R.pm.night)} µg/m³</b></div>
          <div class="row"><span>Added to the day's mean</span><b style="color:${col}">${fmt0(R.pm.day)} (WHO: 15)</b></div>
          <div class="row"><span>Active given off</span><b>${R.Ev.toFixed(2)} mg an hour</b></div>
          <small>A well-mixed room: more of both near the coil. The vapour share is an assumption.</small>`;
      },
    };
  },
};
