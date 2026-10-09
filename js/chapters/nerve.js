// Chapter 3: how a mosquito finds you, and what the vapour does to its nerves. A slab of nerve
// membrane with one sodium channel drawn large; sodium ions fall through when it opens. A board
// shows the nerve's voltage after one touch, from the Hodgkin-Huxley model in coil.js with a
// fraction of channels "modified" (slow to shut). A second board shows how far away each of a
// mosquito's senses picks you up.
// Sources:
//  Narahashi, Zhao, Ikeda, Salgado and Yeh, Pestic. Biochem. Physiol. 97:149 (2010): pyrethroids
//   keep sodium channels open; 100 nM allethrin modified 14% of channels in cockroach neurons,
//   100 µM only 4% in rat neurons ("slightly over 1,000-fold"); modifying 0.6% of channels is
//   enough to make a nerve fire repeatedly. Temperature: Song and Narahashi 1996 (abstract).
//  Ogoma, Moore and Maia, Parasites & Vectors 5:287 (2012): the effects of coils and emanators on
//   mosquitoes are deterrence, repellency and irritancy, feeding inhibition, knock-down and death.
//  van Breugel, Riffell, Fairhall and Dickinson, Current Biology 25:2123 (2015): a mosquito picks
//   up the CO2 plume at 10 to 50 m, sees a host shape at 5 to 15 m and feels body heat within about
//   a metre (distances as reported in the Caltech release and press coverage of the paper).
//  Cats: slow at one liver step (glucuronidation), so sensitive to concentrated pyrethroids
//   (National Pesticide Information Center, permethrin technical fact sheet). Fish and other water
//   life: "pyrethroids are highly toxic to aquatic organisms" (US EPA).
import { THREE, M } from '../kit.js';
import { COL, hex, VIEW, BW, BH, B1, B2, board, panelBg, title, axes, line, dot, bars, wrap, puffs, rng, makeMosquito, layout, fitNarrow, nerve, modified, K_NERVE, link, clamp } from '../coil.js';

const TEMP = { insect: 27, mammal: 37 }, MS = 90;
const fmtDose = (v) => (v >= 1e6 ? (v / 1e6).toFixed(1) + ' mM' : v >= 1000 ? (v / 1000).toFixed(v >= 1e4 ? 0 : 1) + ' µM' : v >= 10 ? v.toFixed(0) + ' nM' : v.toFixed(1) + ' nM');
// the smallest modified fraction at which each nerve fires repeatedly or locks open (found once)
const TH = {};
function threshold(animal) {
  if (TH[animal]) return TH[animal];
  let f = null;
  for (let i = 0; i <= 80 && f == null; i++) { const x = 1e-4 * Math.pow(1e4, i / 80), r = nerve({ f: x, tempC: TEMP[animal], ms: MS }); if (r.spikes > 1 || r.rest > -45) f = x; }
  f = f ?? 1; const dose = (f * K_NERVE[animal]) / (1 - Math.min(f, 0.999));
  return (TH[animal] = { f, dose });
}
function run(s) {
  const f = modified(s.dose, s.animal), r = nerve({ f, tempC: TEMP[s.animal], ms: MS }), th = threshold(s.animal);
  const state = r.rest > -45 ? 'block' : r.spikes > 1 ? 'burst' : f > th.f ? 'block' : 'normal';
  return { ...r, f, state, th };
}
const SAY = {
  normal: ['One touch, one spike', 'The channel opens for a thousandth of a second and shuts. Nothing unusual.'],
  burst: ['One touch, a burst of spikes', 'Held-open channels leak sodium after the spike and set it off again and again: the insect is agitated, turns away and fails to bite.'],
  block: ['Stuck open', 'So many channels stay open that the nerve cannot reset. It stops carrying signals: knock-down.'],
};

export default {
  id: 'nerve',
  short: 'Mosquito and nerve',
  title: 'How a mosquito finds you, and what the vapour does',
  subtitle: 'Breath, shape and warmth lead her in. A pyrethroid jams the tiny gates her nerves run on.',
  view: VIEW,
  learn: `<p>Only female mosquitoes bite: they need blood to make eggs. She finds you in stages. From <b>10 to 50 metres</b> away she picks up the <b>carbon dioxide</b> in your breath and flies upwind along it. At <b>5 to 15 metres</b> she starts steering towards dark shapes. In the last metre she feels your <b>body heat</b> and moisture, and skin smells help her choose where to land.</p>
    <p>Her nerves, like yours, send signals as tiny voltage spikes. Each spike is made by <b>sodium channels</b>: protein gates in the nerve's skin that snap open for about a thousandth of a second, let sodium rush in, and shut (${link('nervousclear', 'NervousClear', 'neuron')} shows a spike being made).</p>
    <p>A <b>pyrethroid</b> molecule wedges into that gate and <b>holds it open</b>. Sodium keeps leaking in after the spike should be over, and the nerve fires again and again from a single touch. At the faint dose a coil puts in the air, that is enough to make her restless: she avoids the room, leaves it, or cannot settle to bite. Scientists call these <b>spatial repellency</b> and <b>feeding inhibition</b>. At a higher dose so many gates jam that her nerves stop working: <b>knock-down</b>, then death.</p>
    <p><b>Why her and not you?</b> Three things stack up. Insect sodium channels grip pyrethroids about a <b>thousand times</b> more strongly than mammal ones. The effect is stronger in a cool body, and an insect is at room temperature while you are at 37 °C. And your liver has enzymes that break pyrethroids down quickly, in a body millions of times bigger. Not every animal is so well protected: <b>cats</b> are slow at one of those liver steps, and <b>fish</b> and other water life are very sensitive, so keep these products away from pets' bedding and fish tanks.</p>
    <p class="tip"><b>Try it:</b> raise the dose on the insect nerve until one touch becomes a burst. Then switch to the mammal nerve and see how far you must go.</p>`,
  terms: [
    { t: 'Sodium channel', d: 'A protein gate in a nerve\'s membrane. It opens briefly to let sodium in, which makes the voltage spike.' },
    { t: 'Spike', d: 'A nerve signal: the voltage jumps from about −65 mV to +40 mV and back in a few thousandths of a second.' },
    { t: 'Repetitive firing', d: 'A nerve giving a burst of spikes after one stimulus, because some of its sodium channels are being held open.' },
    { t: 'Spatial repellency', d: 'Mosquitoes avoiding or leaving a space because of a chemical in the air, without having to touch it.' },
    { t: 'Feeding inhibition', d: 'A mosquito failing to bite even though a host is right there.' },
    { t: 'Knock-down', d: 'An insect falling and unable to fly because its nerves have stopped working properly.' },
  ],
  defaults: { animal: 'insect', dose: 0.5 },
  controls: [
    { key: 'animal', type: 'seg', label: 'Whose nerve', options: [{ v: 'insect', label: 'Insect, 27 °C' }, { v: 'mammal', label: 'Mammal, 37 °C' }] },
    { key: 'dose', type: 'log', label: 'Pyrethroid reaching the nerve', min: 0.1, max: 3e6, ends: ['a trace', 'a flood'], fmt: fmtDose, hint: 'Nanomolar: billionths of a mole per litre, as measured on isolated nerve cells.' },
  ],
  quiz: [
    { q: 'What does a pyrethroid do to a nerve\'s sodium channels?', options: ['It blocks them shut', 'It holds them open, so the nerve fires again and again', 'It dissolves them', 'It turns them into potassium channels'], answer: 1, why: 'A modified channel is slow to shut. The leftover sodium current re-triggers the nerve, giving a burst from one stimulus.' },
    { q: 'From how far can a mosquito pick up the carbon dioxide you breathe out?', options: ['A few centimetres', 'About 1 metre', '10 to 50 metres', '10 kilometres'], answer: 2, why: 'Experiments at Caltech put it at 10 to 50 m for the CO2 plume, 5 to 15 m for seeing a shape, and under a metre for body heat.' },
    { q: 'Which is NOT a reason a coil\'s dose troubles a mosquito far more than a person?', options: ['Insect sodium channels bind pyrethroids about a thousand times more strongly', 'The effect is stronger at an insect\'s cooler body temperature', 'Mammal livers break pyrethroids down quickly', 'Mosquitoes have no nerves'], answer: 3, why: 'Mosquitoes have nerves that work on the same sodium channels. The first three are the real reasons.' },
  ],
  reel: [
    { ms: 5600, caption: 'She tracks your breath from up to 50 metres, your shape from 15, your warmth in the last metre.', set: { animal: 'insect', dose: 0.3, board: 1 }, spin: 0 },
    { ms: 5800, caption: 'A pyrethroid holds her nerves\' sodium gates open: one touch becomes a burst of signals.', set: { animal: 'insect', board: 0 }, anim: { dose: [0.3, 2.6, true] }, spin: 0 },
  ],

  build({ stage, s: s0 }) {
    const root = new THREE.Group(); stage.root.add(root);
    const model = new THREE.Group(); model.position.set(-0.5, 0, 0); root.add(model);
    const rnd = rng(5);
    let S = { ...s0 }, R = run(s0), key = '', tms = 0, dkey = '';

    // ---- a slab of nerve membrane with one sodium channel, magnified enormously
    const MY = 3.05, memMat = M.clear(0xe9c46a, 0.32);
    [-1, 1].forEach((sd) => { const m = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.55, 1.6), memMat); m.position.set(sd * 1.5, MY, 0); model.add(m); });
    const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 8, 6), M.matte(0xd9a441), 120);
    { const o = new THREE.Object3D(); let i = 0; for (const sd of [-1, 1]) for (let a = 0; a < 6; a++) for (let b = 0; b < 5; b++) for (const t of [1, -1]) { o.position.set(sd * (0.75 + a * 0.3), MY + t * 0.3, -0.62 + b * 0.31); o.updateMatrix(); heads.setMatrixAt(i++, o.matrix); } heads.count = i; }
    model.add(heads);
    const chanMat = M.matte(0x5fa8d3), mkLobe = (x) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.75, 6, 14), chanMat); m.position.set(x, MY, 0); m.castShadow = true; model.add(m); return m; };
    const lobeL = mkLobe(-0.4), lobeR = mkLobe(0.4);
    const gate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.09, 0.5), M.matte(0x2f6a8f)); model.add(gate);
    const wedge = new THREE.Mesh(new THREE.OctahedronGeometry(0.2), new THREE.MeshBasicMaterial({ color: hex(COL.vapour), toneMapped: false, transparent: true })); wedge.scale.set(0.7, 1.5, 0.7); model.add(wedge);
    const ions = puffs(model, 90, 0.07, 0xffd166, rnd);
    const out = puffs(model, 40, 0.07, 0xffd166, rnd);
    const lOut = stage.label('outside: sodium waiting', [-1.5, MY + 1.25, 0], model);
    const lIn = stage.label('inside the nerve', [-1.9, MY - 1.0, 0], model);
    const lCh = stage.label('', [0.2, MY + 0.95, 0.4], model, 'hot');
    const lW = stage.label('pyrethroid', [0.95, MY - 0.55, 0.5], model);
    // ---- the animal it belongs to
    const mos = makeMosquito(2.6); mos.position.set(-1.0, 1.0, 0.4); model.add(mos);
    const lM = stage.label('', [-1.0, 0.2, 0.6], model);

    const b1 = board(root, BW, BH, 632, 364, (g, w, h) => {
      panelBg(g, w, h); title(g, 'The nerve, after one touch', S.animal === 'insect' ? 'insect, 27 °C' : 'mammal, 37 °C');
      const { X, Y, x0, y1 } = axes(g, w, h, { xMax: MS, yMin: -90, yMax: 60, xTicks: [0, 20, 40, 60, 80], yTicks: [-80, -40, 0, 40], xFmt: (v) => v + ' ms', yFmt: (v) => v + '', yLabel: 'millivolts inside' });
      line(g, R.pts, X, Y, R.state === 'normal' ? COL.ok : R.state === 'burst' ? COL.heat : COL.bad, 4);
      const i = Math.min(R.pts.length - 1, Math.round(tms)); dot(g, X(R.pts[i][0]), Y(R.pts[i][1]), '#fff', 6);
      g.font = 'bold 20px sans-serif'; g.fillStyle = R.state === 'normal' ? COL.ok : R.state === 'burst' ? COL.heat : COL.bad; g.fillText(SAY[R.state][0], x0 + 150, y1 + 4);
      g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('touch', X(5) - 18, Y(-84));
    }, B1);
    const b2 = board(root, BW, BH, 632, 364, (g, w, h) => {
      panelBg(g, w, h); title(g, 'How she finds you');
      const rows = [['Breath: carbon dioxide', 10, 50, COL.co2], ['Sight: a dark shape', 5, 15, COL.gold], ['Body heat and moisture', 0.1, 1, COL.hot]];
      const x0 = 262, x1 = w - 30, X = (m) => x0 + (Math.log10(m / 0.1) / 3) * (x1 - x0);
      g.font = '17px sans-serif'; [0.1, 1, 10, 100].forEach((m) => { g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(X(m), 62, 1, 172); g.fillStyle = 'rgba(255,255,255,.7)'; const t = m < 1 ? '10 cm' : m + ' m'; g.fillText(t, X(m) - g.measureText(t).width / 2, 256); });
      rows.forEach(([n, a, b, c], i) => { const y = 76 + i * 56; g.font = 'bold 19px sans-serif'; g.fillStyle = c; g.fillText(n, 20, y + 22); g.fillRect(X(a), y, X(b) - X(a), 30); g.font = '17px sans-serif'; g.fillStyle = '#fff'; const t = a < 1 ? 'under 1 m' : `${a} to ${b} m`, tw = g.measureText(t).width; g.fillText(t, X(b) + 8 + tw > x1 ? X(a) - 8 - tw : X(b) + 8, y + 21); });
      g.font = '18px sans-serif'; g.fillStyle = 'rgba(255,255,255,.72)'; wrap(g, 'Distance from you, each step ten times closer. Skin smells help her pick a landing spot. Measured in a wind tunnel at Caltech, 2015.', 20, 292, w - 40, 23);
    }, B2);

    return {
      update(dt, s, time) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        layout(stage, [b1, b2], model, { tallScale: 1.5, tallAt: [-0.2, 0.9, 0], scale: 1.2, primary: s.board || 0 });
        const narrow = fitNarrow(stage, [lOut, lIn, lW]);
        const k = `${s.animal}|${s.dose.toPrecision(3)}`;
        if (k !== key) { key = k; R = run(s); dkey = ''; b2.redraw(); }
        // play the 90 ms trace over about 4.5 s, on a loop (index into the points, 0.1 ms apart)
        tms += dt * 200; if (tms > R.pts.length + 120) tms = 0;
        const i = Math.min(R.pts.length - 1, Math.round(tms)), V = R.pts[i][1];
        const open = clamp((V + 52) / 50, 0, 1), jam = R.state === 'block' ? 0.7 : R.state === 'burst' ? 0.25 : 0, o = Math.max(open, jam * (0.7 + 0.3 * Math.sin(time * 9)));
        lobeL.position.x = -0.4 - 0.13 * o; lobeR.position.x = 0.4 + 0.13 * o;
        gate.position.set(-0.1 - 0.3 * o, MY - 0.62, 0); gate.rotation.z = -1.1 * o;
        const vis = clamp(Math.log10(Math.max(R.f, 1e-5) / 1e-4) / 2, 0, 1);
        wedge.visible = vis > 0.02; wedge.material.opacity = 0.35 + 0.65 * vis; wedge.position.set(0.74 + 0.1 * (1 - vis), MY - 0.1, 0.25); wedge.rotation.y = time * 0.6;
        lW.visible = wedge.visible && !narrow;
        ions.step(dt, 70 * o, () => [(rnd() - 0.5) * 0.12, MY + 0.7 + rnd() * 0.3, (rnd() - 0.5) * 0.3], () => [(rnd() - 0.5) * 0.5, -2.2, (rnd() - 0.5) * 0.5], 0.9, null, null, 0.3);
        out.step(dt, 14, () => [-2.2 + rnd() * 4.4, MY + 0.6 + rnd() * 0.9, (rnd() - 0.5) * 1.3], () => [(rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.2, (rnd() - 0.5) * 0.2], 2.6, null, null, 0.2);
        lCh.element.innerHTML = `<b>sodium channel</b>: ${o > 0.5 ? 'open' : o > 0.12 ? 'held ajar' : 'shut'}`;
        // the animal
        mos.visible = s.animal === 'insect';
        if (R.state === 'block') { mos.rotation.set(Math.PI, 0, 0.2); mos.position.set(-1.0, 0.45, 0.4); }
        else if (R.state === 'burst') { mos.rotation.set(0.3 * Math.sin(time * 23), 0, 0.3 * Math.sin(time * 17)); mos.position.set(-1.0 + 0.5 * Math.sin(time * 3.1), 1.4 + 0.35 * Math.sin(time * 5.3), 0.4 + 0.3 * Math.sin(time * 4.1)); }
        else { mos.rotation.set(0, 0, 0); mos.position.set(-1.0, 1.1 + 0.06 * Math.sin(time * 2), 0.4); }
        mos.userData.wings.forEach((wg, j) => { wg.rotation.x = -Math.PI / 2 + (j ? -1 : 1) * (0.5 + (R.state === 'block' ? 0 : 0.5 * Math.sin(time * 60))); });
        lM.element.textContent = s.animal === 'mammal' ? 'a mammal nerve cell: warmer, and its channels grip far less' : R.state === 'block' ? 'knocked down' : R.state === 'burst' ? 'agitated: leaves, cannot settle to bite' : 'calm: hunting as usual';
        const dk = `${key}|${Math.round(tms / 6)}`;
        if (dk !== dkey) { dkey = dk; b1.redraw(); }
      },
      readout: (s) => {
        const ti = threshold('insect'), tm = threshold('mammal');
        return `<div class="big">${SAY[R.state][0]}</div>
          <div class="row"><span>Channels held open</span><b>${R.f < 0.0001 ? 'under 0.01' : (R.f * 100).toFixed(R.f < 0.1 ? 2 : 0)}%</b></div>
          <div class="row"><span>Spikes from one touch</span><b>${R.state === 'block' ? 'nerve locked' : R.spikes}</b></div>
          <div class="row"><span>Insect nerve disturbed from</span><b>${fmtDose(ti.dose)}</b></div>
          <div class="row"><span>Mammal nerve disturbed from</span><b>${fmtDose(tm.dose)}</b></div>
          <small>A model built on lab measurements of single nerve cells${s.animal === 'mammal' ? '. A whole mammal also clears the chemical in its liver' : ''}.</small>`;
      },
    };
  },
};
