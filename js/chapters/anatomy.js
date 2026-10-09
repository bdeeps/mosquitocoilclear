// Chapter 1: what a mosquito coil is. The pressed pair of interlocked spirals, tilted towards the
// viewer so the shape reads (1 unit ≈ 2.9 cm), snapped apart, with the bent-metal stand, the ember
// and the ash. Ingredients are named by the job they do and nothing more: no proportions.
// Sizes: chamber-tested coils weighed 11.9 to 19.8 g and burned 5.8 to 10 hours (Zhang et al.,
// Indoor Air 20:176, 2010, Table 1); bases named there and in Liu et al., Environ. Health Perspect.
// 111:1454, 2003: sawdust, coconut shell or husk, charcoal powder.
// Label strengths: "Pesticide formulations registered for use in the country under the Insecticides
// Act, 1968 (as on 01.06.2023)", the list of the Central Insecticides Board and Registration Committee.
import { THREE, M } from '../kit.js';
import { COL, hex, VIEW, BW, BH, B1, B2, board, panelBg, title, bars, wrap, puffs, rng, makeCoil, makeStand, layout, fitNarrow, coilSums, ACTIVES, link, smooth } from '../coil.js';

const JOBS = [
  ['Fuel base', 'sawdust, coconut-shell powder or charcoal powder: it smoulders slowly', '#b98a56'],
  ['Binder', 'a starch that glues the powder into a firm strip', '#8fbf7a'],
  ['Active ingredient', 'a pyrethroid, a small fraction of one per cent: the part that acts on mosquitoes', '#c49bff'],
  ['Dye and fragrance', 'the green colour and the smell: no effect on mosquitoes', '#5ce1a9'],
];

export default {
  id: 'anatomy',
  short: 'What is in a coil',
  title: 'What a mosquito coil is',
  subtitle: 'Two spirals pressed as one, a metal stand, a glowing tip and a trail of ash.',
  view: VIEW,
  learn: `<p>A mosquito coil is a strip of pressed powder wound into a <b>spiral</b>. It comes out of the box as a flat disc, which is really <b>two coils nested together</b>. You hold the centres and gently pull, and they come apart into two identical spirals.</p>
    <p>One coil sits on a small bent-metal <b>stand</b>: a prong pushed through the slot at its centre, so the whole spiral hangs in the air. You light the outer end and blow out the flame. What is left is a small orange <b>ember</b> that creeps round the spiral all night, dropping grey <b>ash</b> as it goes. It is a <b>smoulder</b>, the same flameless burning as an incense stick (${link('agarbatticlear', 'AgarbattiClear', 'smoulder')} explains it fully).</p>
    <p>The strip has four kinds of ingredient, each with a job. A <b>fuel base</b> of sawdust, coconut-shell powder or charcoal powder keeps the ember alive. A <b>binder</b> holds it in shape. A <b>dye</b> and a fragrance make it green and scented. And the part that matters is the <b>active ingredient</b>: a synthetic <b>pyrethroid</b>, an insecticide modelled on a chemical from a daisy.</p>
    <p>There is very little of it. Indian labels show strengths from <b>0.005% to 0.1%</b> for the common coils, which is a few milligrams in a whole coil. The coil is mostly a slow, steady way to warm that tiny amount into the air.</p>
    <p class="tip"><b>Try it:</b> pull the pair apart with the slider, then switch the active ingredient and see how few milligrams a 13-gram coil carries.</p>`,
  terms: [
    { t: 'Mosquito coil', d: 'A spiral of pressed, slow-burning powder that carries a small amount of insecticide and smoulders for hours.' },
    { t: 'Smoulder', d: 'Burning without a flame: a glowing ember that creeps through a solid.' },
    { t: 'Active ingredient', d: 'The chemical in a product that does the job on the label. Everything else carries or delivers it.' },
    { t: 'Pyrethroid', d: 'A family of synthetic insecticides modelled on pyrethrins, the natural insect-killers in pyrethrum daisies.' },
    { t: 'Binder', d: 'An ingredient that glues powders together so they keep a shape.' },
    { t: 'Label strength', d: 'The percentage of active ingredient that the regulator has registered and the pack must print.' },
  ],
  defaults: { explode: 0, lit: true, active: 'dta' },
  controls: [
    { key: 'explode', type: 'range', label: 'Snap the pair apart', min: 0, max: 1, step: 0.01, ends: ['as packed', 'apart'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'active', type: 'seg', label: 'Active ingredient on the label', options: ACTIVES.map((a) => ({ v: a.id, label: a.name })) },
    { key: 'lit', type: 'toggle', label: 'Lit' },
  ],
  quiz: [
    { q: 'Why does a new mosquito coil look like a solid disc?', options: ['It is one thick coil', 'It is two spirals nested together, pressed as a pair', 'It is wrapped in paper', 'It has not been dried yet'], answer: 1, why: 'The factory stamps two interlocked spirals out of one sheet. You pull them apart and burn one at a time.' },
    { q: 'Which ingredient acts on the mosquito?', options: ['The green dye', 'The sawdust', 'The pyrethroid, a fraction of one per cent of the coil', 'The starch binder'], answer: 2, why: 'The fuel, binder and dye only make a slow ember. The pyrethroid is the insecticide, and there are just milligrams of it.' },
    { q: 'Why does the coil sit on a prong instead of lying on a plate?', options: ['To look taller', 'So air reaches the ember all round and nothing touching it steals its heat or catches fire', 'To make more ash', 'So it burns with a flame'], answer: 1, why: 'A smoulder needs air on its surface, and it dies where it touches cold metal. The prong holds the spiral clear of everything.' },
  ],
  reel: [
    { ms: 5400, caption: 'A mosquito coil comes as two spirals nested into one disc. Pull, and they snap apart.', set: { lit: false, active: 'dta' }, anim: { explode: [0, 1] }, spin: 0 },
    { ms: 5200, caption: 'It is sawdust or coconut-shell powder, a binder, dye, and a few milligrams of insecticide.', set: { lit: true, explode: 1, active: 'dta' }, anim: { explode: [1, 0.35] }, spin: 0 },
  ],

  build({ stage, s: s0 }) {
    const root = new THREE.Group(); stage.root.add(root);
    const model = new THREE.Group(); root.add(model);
    const rnd = rng(11);
    let S = { ...s0 };
    const TILT = 1.0, C0 = [-0.6, 3.3, 0];
    const mk = (color, phase) => { const w = new THREE.Group(); w.position.set(...C0); w.rotation.x = TILT; w.scale.setScalar(0.95); const c = makeCoil({ rIn: 0.33, rOut: 1.9, pitch: 0.52, width: 0.225, thick: 0.14, phase, color }); w.add(c.g); model.add(w); return { w, c }; };
    const A = mk(COL.coil, 0), B = mk('#4a8f57', Math.PI);
    const stand = makeStand(0.75, 0.9); stand.position.set(0, -0.72, 0); A.w.add(stand);
    A.c.burn(0.06, true); B.c.burn(0, false);
    const smoke = puffs(model, 60, 0.045, 0xdfe6f2, rnd, { opacity: 0.5 });
    const L = {
      a: stage.label('one coil', [-1.2, 0.25, -1.5], A.c.g),
      b: stage.label('its twin', [1.2, 0.25, 1.5], B.c.g),
      stand: stage.label('stand: a prong through the centre slot', [0, -0.75, 0.9], A.c.g),
      ember: stage.label('', [0, 0.5, 0], A.c.ember, 'hot'),
      ash: stage.label('ash', [0, 0.35, 0.3], A.c.ash),
    };

    const b1 = board(root, BW, BH, 632, 364, (g, w, h) => {
      panelBg(g, w, h); title(g, 'What is in it, by job');
      JOBS.forEach(([a, b, col], i) => {
        const y = 74 + i * 70; g.fillStyle = col; g.fillRect(20, y - 18, 8, 50);
        g.font = 'bold 22px sans-serif'; g.fillText(a, 40, y); g.font = '18px sans-serif'; g.fillStyle = 'rgba(255,255,255,.8)'; wrap(g, b, 40, y + 25, w - 62, 22);
      });
    }, B1);
    const b2 = board(root, BW, BH, 632, 364, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Strength on Indian labels', 'coils');
      bars(g, ACTIVES.map((a) => ({ label: a.name, value: a.pct, color: a.id === S.active ? COL.vapour : 'rgba(196,155,255,.4)', lcol: a.id === S.active ? '#fff' : 'rgba(255,255,255,.7)', text: a.pct + '%' })), { y: 58, w: w - 40, rowH: 52, labelW: 215, max: 0.125, font: 21 });
      g.font = '18px sans-serif'; g.fillStyle = 'rgba(255,255,255,.7)';
      wrap(g, 'Per cent of the coil by weight, from the list of products registered under the Insecticides Act (2023). Newer actives work at lower strengths.', 20, 290, w - 40, 23);
    }, B2);

    const sums = coilSums({});
    let key = '';
    const tip = new THREE.Vector3();
    return {
      update(dt, s, time) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        const { tall } = layout(stage, [b1, b2], model, { tallScale: 1.12, tallAt: [0.1, 0.6, 0] });
        const narrow = fitNarrow(stage, [L.stand, L.ash]);
        const k = smooth(s.explode);
        A.w.position.set(C0[0] - 1.5 * k, C0[1] - 1.3 * k, 0); B.w.position.set(C0[0] + 1.9 * k, C0[1] + 0.95 * k, 0);
        A.c.burn(0.06, s.lit); A.c.glow(time, s.lit);
        L.a.visible = L.b.visible = k > 0.5 && !narrow; L.stand.visible = k > 0.3 && !narrow; L.ash.visible = s.lit && !narrow;
        L.ember.element.innerHTML = s.lit ? '<b>ember</b>: a smoulder, no flame' : 'light this end';
        A.c.ember.getWorldPosition(tip);
        smoke.step(dt, s.lit ? 12 : 0, () => [tip.x, tip.y + 0.05, tip.z], () => [0, 0.5, 0], 3.0, null, (q, d) => { const up = q.age * 0.5; q.p[1] += 0.5 * d; q.p[0] = tip.x + (up > 0.7 ? Math.sin(up * 4 + time * 1.3 + q.k * 0.6) * (up - 0.7) * 0.25 : 0); }, 1.4);
        const kk = `${s.active}|${tall}`;
        if (kk !== key) { key = kk; b1.redraw(); b2.redraw(); }
      },
      readout: (s) => {
        const a = ACTIVES.find((x) => x.id === s.active), mg = sums.grams * a.pct * 10;
        return `<div class="big">${s.explode > 0.5 ? 'Two coils, snapped apart' : 'A pair, as packed'}</div>
          <div class="row"><span>One coil</span><b>about ${sums.grams.toFixed(0)} g, ${(sums.L / 10).toFixed(0)} cm of strip</b></div>
          <div class="row"><span>Active on the label</span><b>${a.name} ${a.pct}%</b></div>
          <div class="row"><span>Active in the whole coil</span><b>${mg >= 10 ? mg.toFixed(0) : mg.toFixed(1)} mg</b></div>
          <div class="row"><span>Burns for</span><b>about ${sums.hours.toFixed(0)} hours</b></div>
          <small>Tested coils weighed 12 to 20 g. Strengths are label figures.</small>`;
      },
    };
  },
};
