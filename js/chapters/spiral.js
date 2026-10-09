// Chapter 2: the spiral as a clock. One coil tilted towards the viewer, an ember walking round it,
// and two boards: the length of the spiral and how long it lasts, and the temperature just ahead
// of the ember with the band where the active ingredient turns to vapour.
// Sums in coil.js: spiralLen (exact length of an Archimedean spiral), coilSums (burn speed and
// hours, anchored to the 5.8 to 10 hours and 1.7 to 2.5 g an hour measured by Zhang et al., Indoor
// Air 2010), heatAhead (conduction ahead of a moving front, cooled by the air), vapourP
// (Clausius-Clapeyron). The glow temperature is borrowed from incense sticks measured by thermal
// camera (610 to 640 °C, Sowriraajan et al., Fire Technology 2023): no coil measurement was found.
// US EPA, "Characteristics and Regulatory Status of Spatial Insect Repellents" (2009): the
// pesticide "is released behind the smoldering tip of the coil, as the temperature for
// volatilization is achieved", that is, from the warm strip next to the ember, not from the glow.
import { THREE } from '../kit.js';
import { COL, VIEW, BW, BH, B1, B2, board, panelBg, title, axes, line, dot, wrap, puffs, rng, makeCoil, makeStand, layout, fitNarrow, coilSums, heatAhead, vapourP, EVAP_BAND, T_GLOW, COIL, fmtH, fmt0, link, clamp } from '../coil.js';

const SC = 2.5 / 59;      // scene units per millimetre

export default {
  id: 'spiral',
  short: 'The spiral clock',
  title: 'Why a spiral: a night-long fuse in the palm of a hand',
  subtitle: 'The length of the spiral and the speed of the ember set the hours on the pack.',
  view: VIEW,
  learn: `<p>An ember creeps along a coil at about <b>1.4 mm a minute</b>. To last eight hours it needs a strip nearly <b>70 cm</b> long. A straight stick that long would be awkward, fragile and easy to knock over. Wind it into a <b>spiral</b> and the same strip fits in a disc under 12 cm across.</p>
    <p>You can work the length out. In this kind of spiral the strip moves inwards by the same step, the <b>pitch</b>, on every turn. Its length is very nearly the <b>area of the ring</b> it covers divided by the pitch: π × (outer radius² − inner radius²) ÷ pitch. Because two coils are pressed nested together, one coil's pitch is twice the strip width plus a small gap. Divide the length by the ember's speed and you get the hours.</p>
    <p>Now the clever part. The ember itself glows at roughly 600 °C, hot enough to destroy the insecticide. But heat leaks along the strip <b>ahead</b> of the ember. A few millimetres in front, the strip is at 150 to 300 °C: hot enough to turn the active ingredient into <b>vapour</b>, not hot enough to burn it. So most of it leaves just before the fire arrives. An incense stick's fragrance escapes the same way (${link('agarbatticlear', 'AgarbattiClear', 'smoulder')}), and warmth lifting molecules into the air is the story of ${link('perfumeclear', 'PerfumeClear')}.</p>
    <p>That is why the dose is so steady: each minute, the same short length of strip gives up its share.</p>
    <p class="tip"><b>Try it:</b> make the coil wider, then make the strip thinner, and watch the hours change. Then add a draught: the ember speeds up and the night gets shorter.</p>`,
  terms: [
    { t: 'Archimedean spiral', d: 'A spiral whose turns are evenly spaced: the radius changes by the same amount on every turn.' },
    { t: 'Pitch', d: 'The distance from one turn of a spiral to the next turn of the same strip.' },
    { t: 'Burn rate', d: 'How fast the ember moves along the strip, here about 1.4 mm a minute in still air.' },
    { t: 'Conduction', d: 'Heat flowing through a solid from its hot part to its cooler part.' },
    { t: 'Vapour pressure', d: 'How strongly a substance pushes its molecules into the air. It climbs steeply with temperature.' },
    { t: 'Evaporate, not burn', d: 'The active leaves the warm strip as vapour ahead of the ember, before the glow can destroy it.' },
  ],
  defaults: { dOut: 118, arm: 6.5, draught: 0, fast: 30 },
  controls: [
    { key: 'dOut', type: 'range', label: 'Coil diameter', min: 80, max: 140, step: 1, ends: ['8 cm', '14 cm'], fmt: (v) => (v / 10).toFixed(1) + ' cm' },
    { key: 'arm', type: 'range', label: 'Strip width', min: 5, max: 9, step: 0.1, ends: ['thin', 'thick'], fmt: (v) => v.toFixed(1) + ' mm' },
    { key: 'draught', type: 'range', label: 'Draught on the ember', min: 0, max: 1, step: 0.01, ends: ['still air', 'under a fan'], fmt: (v) => (v < 0.05 ? 'still' : v < 0.5 ? 'light' : 'breezy') },
    { key: 'fast', type: 'seg', label: 'Time', options: [{ v: 10, label: '10 min a second' }, { v: 30, label: '30 min a second' }, { v: 90, label: '90 min a second' }] },
    { key: 'go', type: 'buttons', label: 'Your move', items: [{ label: 'Light a fresh coil', act: (s, inst) => inst.reset() }] },
  ],
  quiz: [
    { q: 'A coil is 68 cm of strip and the ember moves 1.4 mm a minute. About how long does it last?', options: ['About 1 hour', 'About 4 hours', 'About 8 hours', 'About 24 hours'], answer: 2, why: '680 mm ÷ 1.4 mm a minute is about 486 minutes, a little over 8 hours.' },
    { q: 'How does the insecticide survive a 600 °C ember?', options: ['It does not: it all burns', 'It turns to vapour from the warm strip just ahead of the ember, before the glow reaches it', 'It is fireproof', 'It stays in the ash'], answer: 1, why: 'Heat conducts ahead of the ember. A few millimetres in front, the strip is hot enough to evaporate the active but not to destroy it.' },
    { q: 'You double the pitch of a spiral but keep the same inner and outer size. What happens to its length?', options: ['It doubles', 'It halves', 'It stays the same', 'It becomes four times longer'], answer: 1, why: 'Length is the ring\'s area divided by the pitch. The same ring with turns twice as far apart holds half as much strip.' },
  ],
  reel: [
    { ms: 5600, caption: 'Why a spiral? It folds nearly 70 cm of slow fuse into a disc 12 cm wide.', set: { dOut: 118, arm: 6.5, draught: 0, fast: 90 }, act: (s, inst) => inst.reset(), spin: 0 },
    { ms: 5600, caption: 'The ember creeps 1.4 mm a minute, so one coil lasts about eight hours.', set: { dOut: 118, arm: 6.5, draught: 0, fast: 90 }, act: (s, inst) => inst.reset(0.35), spin: 0 },
  ],

  build({ stage, s: s0 }) {
    const root = new THREE.Group(); stage.root.add(root);
    const model = new THREE.Group(); root.add(model);
    const rnd = rng(23);
    let S = { ...s0 }, Q = coilSums(s0), H = heatAhead(Q.v, s0.arm), th = 0, key = '', dkey = '', coil = null;
    const wrapG = new THREE.Group(); wrapG.position.set(-0.6, 3.1, 0); wrapG.rotation.x = 1.0; model.add(wrapG);
    const stand = makeStand(0.75, 1.1); stand.position.set(0, -0.72, 0); wrapG.add(stand);
    const build = () => {
      if (coil) { wrapG.remove(coil.g); coil.g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); }
      coil = makeCoil({ rIn: Q.rIn * SC, rOut: Q.rOut * SC, pitch: Q.pitch * SC, width: S.arm * SC, thick: COIL.thick * SC, color: COL.coil });
      wrapG.add(coil.g);
    };
    build();
    const smoke = puffs(model, 60, 0.045, 0xdfe6f2, rnd, { opacity: 0.5 });
    const vap = puffs(model, 50, 0.035, 0xc49bff, rnd, { opacity: 0.85 });
    const lEmber = stage.label('', [0, 0, 0], model, 'hot');
    const lVap = stage.label('vapour leaves here', [0, 0, 0], model);
    const lLen = stage.label('', [-0.6, 0.35, 1.6], model);

    const b1 = board(root, BW, BH, 632, 364, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Strip left to burn', `${(Q.L / 10).toFixed(0)} cm in ${Q.turns.toFixed(1)} turns`);
      const xm = Math.max(10, Math.ceil(Q.hours / 2) * 2), ym = Math.max(80, Math.ceil(Q.L / 200) * 20);
      const xt = []; for (let i = 0; i <= xm; i += xm > 12 ? 4 : 2) xt.push(i);
      const { X, Y, x0, y0 } = axes(g, w, h, { xMax: xm, yMax: ym, xTicks: xt, yTicks: [0, ym / 4, ym / 2, (3 * ym) / 4, ym], xFmt: (v) => v + ' h', yFmt: (v) => v.toFixed(0), yLabel: 'cm of strip' });
      line(g, [[0, Q.L / 10], [Q.hours, 0]], X, Y, COL.heat, 5);
      const t = Math.min(th, Q.hours); dot(g, X(t), Y((Q.L / 10) * (1 - t / Q.hours)), COL.hot, 9);
      g.font = 'bold 19px sans-serif'; g.fillStyle = COL.heat; g.fillText(`${Q.v.toFixed(2)} mm a minute: lasts ${fmtH(Q.hours)}`, x0 + 150, 96);
      g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.7)'; g.fillText(`π × (${Q.rOut.toFixed(0)}² − ${Q.rIn.toFixed(0)}²) ÷ ${Q.pitch.toFixed(0)} mm = ${fmt0(Q.approx)} mm`, x0 + 150, 122);
      void y0;
    }, B1);
    const b2 = board(root, BW, BH, 632, 364, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Heat ahead of the ember');
      const { X, Y, x0, x1, y0, y1 } = axes(g, w, h, { xMax: 14, yMax: 700, xTicks: [0, 2, 4, 6, 8, 10, 12, 14], yTicks: [0, 150, 300, 450, 600], xFmt: (v) => v + '', yFmt: (v) => v + '°', xLabel: 'mm ahead of the glow', yLabel: '°C in the strip' });
      const xa = H.xAt(EVAP_BAND[1]), xb = H.xAt(EVAP_BAND[0]);
      g.fillStyle = 'rgba(196,155,255,.22)'; g.fillRect(X(xa), y1, X(xb) - X(xa), y0 - y1);
      g.fillStyle = 'rgba(255,90,30,.25)'; g.fillRect(x0, y1, X(xa) - x0, y0 - y1);
      const pts = []; for (let i = 0; i <= 70; i++) { const x = (14 * i) / 70; pts.push([x, H.T(x)]); }
      line(g, pts, X, Y, COL.hot, 5);
      g.font = 'bold 18px sans-serif'; g.fillStyle = COL.vapour; g.fillText('active turns to vapour', X(xb) + 10, Y(380));
      g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.75)'; g.fillText(`150 to 300 °C: ${xa.toFixed(1)} to ${xb.toFixed(1)} mm ahead`, X(xb) + 10, Y(380) + 24);
      g.fillText(`glow: about ${T_GLOW} °C`, X(xb) + 10, Y(380) + 48);
      g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('too hot: destroyed', x0 + 6, y1 + 18); void x1;
    }, B2);

    const reset = (frac = 0) => { th = frac * Q.hours; smoke.clear(); vap.clear(); };
    const tip = new THREE.Vector3(), ahead = new THREE.Vector3();
    return {
      reset,
      update(dt, s, time) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        layout(stage, [b1, b2], model, { tallScale: 1.35, tallAt: [0.6, -0.3, 0] });
        const narrow = fitNarrow(stage, [lVap, lLen]);
        const k = `${s.dOut}|${s.arm}|${s.draught.toFixed(2)}`;
        if (k !== key) {
          const frac = Q.hours ? th / Q.hours : 0, geo = `${s.dOut}|${s.arm}` !== key.split('|').slice(0, 2).join('|');
          key = k; Q = coilSums(s); H = heatAhead(Q.v, s.arm); th = Math.min(frac, 1) * Q.hours; if (geo) build(); dkey = ''; b2.redraw();
        }
        th += (dt * s.fast) / 60; if (th > Q.hours + 0.6) reset();
        const frac = clamp(th / Q.hours, 0, 1), lit = frac < 0.995;
        coil.burn(frac, lit); coil.glow(time, lit);
        coil.ember.getWorldPosition(tip);
        const p = coil.pointAt(Math.min(1, frac + 0.012)); ahead.set(p.x, coil.thick, p.z); coil.g.localToWorld(ahead);
        smoke.step(dt, lit ? 12 : 0, () => [tip.x, tip.y + 0.05, tip.z], () => [0, 0.5, 0], 3.0, null, (q, d) => { const up = q.age * 0.5; q.p[1] += 0.5 * d; q.p[0] = tip.x + (up > 0.7 ? Math.sin(up * 4 + time * 1.3 + q.k * 0.6) * (up - 0.7) * 0.25 : 0); }, 1.4);
        vap.step(dt, lit ? 10 : 0, () => [ahead.x + (rnd() - 0.5) * 0.1, ahead.y + 0.03, ahead.z], () => [(rnd() - 0.5) * 0.5, 0.25 + rnd() * 0.3, (rnd() - 0.5) * 0.3 + 0.2], 2.6, null, null, 0.6);
        lEmber.position.set(tip.x, tip.y + 0.42, tip.z); lEmber.element.innerHTML = lit ? `<b>ember</b> · ${fmtH(Math.min(th, Q.hours))}` : 'burnt out';
        lVap.position.set(ahead.x + 0.1, ahead.y - 0.5, ahead.z + 0.3); lVap.visible = lit && !narrow;
        lLen.element.textContent = `${(Q.L / 10).toFixed(0)} cm of strip in a ${(s.dOut / 10).toFixed(1)} cm disc`;
        const dk = `${key}|${Math.round(frac * 120)}`;
        if (dk !== dkey) { dkey = dk; b1.redraw(); }
      },
      readout: () => {
        const left = Q.L * (1 - clamp(th / Q.hours, 0, 1));
        return `<div class="big">${(Q.L / 10).toFixed(0)} cm of strip: ${fmtH(Q.hours)}</div>
          <div class="row"><span>Turns, pitch</span><b>${Q.turns.toFixed(1)} turns, ${Q.pitch.toFixed(0)} mm</b></div>
          <div class="row"><span>Ember speed</span><b>${Q.v.toFixed(2)} mm a minute</b></div>
          <div class="row"><span>Burnt so far</span><b>${fmtH(Math.min(th, Q.hours))} · ${(left / 10).toFixed(0)} cm left</b></div>
          <div class="row"><span>Weight, burn rate</span><b>${Q.grams.toFixed(0)} g, ${Q.gph.toFixed(1)} g an hour</b></div>
          <div class="row"><span>Vapour pressure at 200 °C</span><b>${fmt0(vapourP(200) / vapourP(27) / 1000)} thousand × room</b></div>
          <small>Tested coils: 5.8 to 10 hours, 1.7 to 2.5 g an hour.</small>`;
      },
    };
  },
};
