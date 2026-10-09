// Chapter 6: health, rules and resistance. A cloud of mosquitoes coloured by which version of the
// sodium-channel gene they carry, evolving generation by generation under the selection model in
// coil.js (illustrative survival figures, textbook population genetics), with India's reported
// disease figures on a second board.
// Sources (read at the source unless marked):
//  NCVBDC (National Center for Vector Borne Diseases Control, Ministry of Health): malaria, India:
//   2000: 2,031,790 cases; 2015: 1,169,261; 2023: 227,564 (83 deaths); 2024: 255,500 (86 deaths).
//   Dengue: 2021: 193,245 cases (346 deaths); 2023: 289,235 (485); 2024: 233,519 (297).
//  Liu et al., Environ. Health Perspect. 111:1454 (2003) and Zhang et al., Indoor Air 20:176 (2010):
//   particles, formaldehyde and other carbonyls, PAHs from coils.
//  Chen, Wong, Shiu, Chiou and Lee, J. Epidemiol. 18:19 (2008): hospital case-control study, Taiwan,
//   147 lung cancer patients: adjusted odds ratio 3.78 (1.55 to 6.90) for burning coils more than
//   three days a week (figures from a search summary of the abstract). An association.
//  Krieger, Dinoff and Zhang, Environ. Health Perspect. 111:1439 (2003): some coils sold abroad
//   carried the synergist S-2 (octachlorodipropyl ether), which can form bis(chloromethyl) ether, a
//   potent lung carcinogen, when it smoulders; such coils are unregistered in the United States.
//  Insecticides Act, 1968 (in force 1971): every insecticide product must be registered by the
//   Central Insecticides Board and Registration Committee. BIS: IS 13438:1992, "Allethrin - Mosquito
//   coils - Specification".
//  Resistance: Singh et al., Malaria Journal 8:154 (2009): first kdr mutation in Indian Anopheles
//   culicifacies, Surat. Kushwah et al., PLoS Negl. Trop. Dis. 9:e3332 (2015): first kdr mutations
//   in Indian Aedes aegypti, Delhi. Raghavendra et al., J. Vector Borne Dis. (2022, the ICMR study of
//   2017-19): An. culicifacies resistant to deltamethrin in 17 of 44 districts tested (search summary).
//  Fire: Delhi Police, March 2023, as reported by news agencies: six people died in a shut room in
//   Shastri Park after a coil fell on a mattress.
import { THREE, M } from '../kit.js';
import { COL, hex, VIEW, BW, BH, B1, B2, board, panelBg, title, axes, line, dot, bars, wrap, dots, rng, makeCoil, makeStand, layout, fitNarrow, resistance, fmt0, link, clamp } from '../coil.js';

const GENS = 72, PER_YEAR = 12, N = 220;
const GCOL = { SS: new THREE.Color(0x5ce1a9), RS: new THREE.Color(0xffb547), RR: new THREE.Color(0xff5d5d), dead: new THREE.Color(0x555b66) };

export default {
  id: 'health',
  short: 'Health, rules, resistance',
  title: 'Smoke, rules, and mosquitoes that learn',
  subtitle: 'What is known about the smoke, what the law requires, and why an insecticide can stop working.',
  view: VIEW,
  learn: `<p><b>Why bother at all?</b> Because mosquitoes carry disease. India reported about <b>2.6 lakh malaria cases</b> and <b>2.3 lakh dengue cases</b> in 2024, with chikungunya on top, and the numbers climb every monsoon. Malaria is far lower than it was: over 20 lakh cases in 2000.</p>
    <p><b>The smoke, plainly.</b> Coil smoke is smoke. Measured studies find fine particles, formaldehyde and other irritant gases, and traces of the same tarry compounds as any smouldering plant matter. Fine particles from any source are known to harm lungs and hearts, which is why air guidelines exist. On coils in particular, a hospital study in Taiwan found that lung cancer patients were more likely to have burned coils often. That is an <b>association</b> from one small study: a reason for care, not proof of cause. Babies, older people and anyone with asthma have the most reason to prefer clear air. (How lungs deal with particles is in ${link('lungsclear', 'LungsClear')}; the room sums for smoke are in ${link('agarbatticlear', 'AgarbattiClear', 'room')}.)</p>
    <p><b>The rules.</b> In India a coil is an insecticide product under the <b>Insecticides Act, 1968</b>. It must be registered by the <b>Central Insecticides Board and Registration Committee</b>, and its pack must show the active ingredient, its strength and a registration number. The Bureau of Indian Standards has a coil standard too (IS 13438). Unregistered coils and "mosquito agarbattis" do get sold, sometimes with chemicals never approved for the purpose, and state agriculture departments have seized them. No registration number means nobody has checked what is inside.</p>
    <p><b>Using one sensibly</b> is short: follow the label, keep some fresh air moving, and treat it as the small fire it is. Use the metal stand on a plate or tile, well away from bedding, curtains and paper, and out of reach of children and pets. Coils that fall onto mattresses have caused deadly fires.</p>
    <p><b>Resistance.</b> In any big mosquito population a few carry a slightly different sodium channel that pyrethroids grip less well. Scientists call it <b>kdr</b>, knock-down resistance. Where pyrethroids are used heavily, those few survive and breed, and within a few years they are the majority. This has been found in India's malaria mosquito (Surat, 2009) and dengue mosquito (Delhi, 2015). It is the best reason not to lean on one chemical alone: nets, screens and dry buckets do not breed resistance.</p>
    <p class="tip"><b>Try it:</b> set pyrethroid use high and watch the red, resistant mosquitoes take over. Then lower it and see how long the takeover is put off.</p>`,
  terms: [
    { t: 'Association', d: 'Two things found together in a study. It is a clue, not proof that one causes the other.' },
    { t: 'CIB&RC', d: 'The Central Insecticides Board and Registration Committee, which registers every insecticide product sold in India.' },
    { t: 'Registration number', d: 'The number on a legal pack that shows the product and its strength were examined and approved.' },
    { t: 'Resistance', d: 'A population of pests changing over generations so that a chemical no longer controls it.' },
    { t: 'kdr', d: 'Knock-down resistance: a small change in the sodium channel that makes pyrethroids bind less well.' },
    { t: 'Selection', d: 'Survivors breed and the dead do not, so whatever helped survival becomes more common.' },
  ],
  defaults: { use: 0.6, p0: 0.01, fast: 6 },
  controls: [
    { key: 'use', type: 'range', label: 'Share of mosquitoes that meet a pyrethroid', min: 0, max: 1, step: 0.01, ends: ['none', 'all, every generation'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'p0', type: 'log', label: 'Resistant gene at the start', min: 0.001, max: 0.1, ends: ['1 in 1,000', '1 in 10'], fmt: (v) => (v * 100).toFixed(v < 0.01 ? 1 : 0) + '% of copies' },
    { key: 'fast', type: 'seg', label: 'Time', options: [{ v: 3, label: '3 generations a second' }, { v: 6, label: '6 a second' }, { v: 12, label: '12 a second' }] },
    { key: 'go', type: 'buttons', label: 'Your move', items: [{ label: 'Start again', act: (s, inst) => inst.reset() }] },
  ],
  quiz: [
    { q: 'How does a mosquito population become resistant to a pyrethroid?', options: ['Each mosquito gets used to it, like building a habit', 'The few that happen to carry a resistant gene survive and breed, so the gene spreads', 'The chemical gets weaker in the bottle', 'Mosquitoes teach their young to avoid it'], answer: 1, why: 'It is selection across generations. No single mosquito changes; the mix of genes in the population does.' },
    { q: 'What should a legal mosquito coil pack in India show?', options: ['Only a brand name', 'The active ingredient, its strength and a registration number', 'A doctor\'s signature', 'Nothing in particular'], answer: 1, why: 'Under the Insecticides Act every such product is registered by the CIB&RC, and the label carries the active, its percentage and the registration number.' },
    { q: 'A study finds lung cancer patients burned coils more often than other people. What does that show?', options: ['Coils certainly cause cancer', 'An association: a reason for care, but not proof of cause', 'Coils are certainly harmless', 'Cancer makes people buy coils'], answer: 1, why: 'Such studies cannot rule out every other difference between the groups. They flag a possible risk; they do not prove it.' },
  ],
  reel: [
    { ms: 5800, caption: 'Lean on one insecticide and resistant mosquitoes take over: so back the coil with nets, screens and dry buckets.', set: { use: 0.8, p0: 0.01, fast: 12 }, act: (s, inst) => inst.reset(), spin: 0 },
  ],

  build({ stage, s: s0 }) {
    const root = new THREE.Group(); stage.root.add(root);
    const model = new THREE.Group(); model.position.set(-0.6, 0, 0); root.add(model);
    const rnd = rng(91);
    let S = { ...s0 }, R = resistance({ use: s0.use, p0: s0.p0, gens: GENS }), key = '', gen = 0, dkey = '';
    // a glass case of mosquitoes over a lit coil
    const CW = 4.6, CH = 4.4, CD = 2.2, CY = 1.2;
    const bx = new THREE.BoxGeometry(CW, CH, CD), caseM = new THREE.Mesh(bx, M.clear(0xcfe8ff, 0.07)); caseM.position.set(0, CY + CH / 2, 0);
    const ed = new THREE.LineSegments(new THREE.EdgesGeometry(bx), new THREE.LineBasicMaterial({ color: 0x8fa3c4, transparent: true, opacity: 0.6 })); ed.position.copy(caseM.position);
    const base = new THREE.Mesh(new THREE.BoxGeometry(CW + 0.3, 0.12, CD + 0.3), M.matte(0x39414f)); base.position.set(0, CY - 0.06, 0); base.receiveShadow = true;
    model.add(caseM, ed, base);
    const stand = makeStand(0.4, 0.6); stand.position.set(0, CY + 0.02, 0.4); const coil = makeCoil({ rIn: 0.13, rOut: 0.7, pitch: 0.19, width: 0.085, thick: 0.055, seg: 280 }); coil.g.position.set(0, CY + 0.42, 0.4); coil.g.rotation.x = 0.55; coil.burn(0.2, true); model.add(stand, coil.g);
    const D = dots(N, 0.075, 0xffffff, { seg: 8 }); model.add(D);
    const Q = Array.from({ length: N }, () => ({ u: rnd(), v: rnd(), x: (rnd() - 0.5) * (CW - 0.4), y: rnd(), z: (rnd() - 0.5) * (CD - 0.4), ph: rnd() * 6.28, fall: 0 }));
    const lCase = stage.label('', [0, CY - 0.45, 1.3], model, 'hot');
    const lKey = stage.label('<span style="color:#5ce1a9">●</span> ordinary &nbsp;<span style="color:#ffb547">●</span> one resistant copy &nbsp;<span style="color:#ff5d5d">●</span> two', [0, CY - 0.95, 1.3], model);

    const b1 = board(root, BW, BH, 632, 364, (g, w, h) => {
      panelBg(g, w, h); title(g, 'The resistant gene spreads');
      const { X, Y, x0, y0, y1 } = axes(g, w, h, { xMax: GENS / PER_YEAR, yMax: 100, xTicks: [0, 1, 2, 3, 4, 5, 6], yTicks: [0, 25, 50, 75, 100], xFmt: (v) => v + ' y', yFmt: (v) => v + '%', yLabel: 'per cent' });
      line(g, R.pts.map(([gg, p]) => [gg / PER_YEAR, R.kill(p) * 100]), X, Y, COL.ok, 4, [8, 6]);
      line(g, R.pts.map(([gg, p]) => [gg / PER_YEAR, p * 100]), X, Y, COL.bad, 5);
      const i = Math.min(GENS, Math.floor(gen)), p = R.pts[i][1];
      g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(gen / PER_YEAR), y1); g.lineTo(X(gen / PER_YEAR), y0); g.stroke(); dot(g, X(gen / PER_YEAR), Y(p * 100), COL.bad, 8);
      g.font = 'bold 17px sans-serif'; g.fillStyle = COL.bad; g.fillText('resistant gene, share of copies', x0 + 230, Y(62)); g.fillStyle = COL.ok; g.fillText('dashed: killed by a standard dose', x0 + 230, Y(62) + 24);
    }, B1);
    const b2 = board(root, BW, BH, 632, 364, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Reported in India', 'cases a year');
      bars(g, [
        { label: 'Malaria, 2000', value: 2031790, color: 'rgba(111,182,255,.55)', text: '20.3 lakh' },
        { label: 'Malaria, 2015', value: 1169261, color: 'rgba(111,182,255,.75)', text: '11.7 lakh' },
        { label: 'Malaria, 2024', value: 255500, color: COL.cold, text: '2.56 lakh · 86 deaths' },
        { label: 'Dengue, 2021', value: 193245, color: 'rgba(255,181,71,.6)', text: '1.93 lakh' },
        { label: 'Dengue, 2023', value: 289235, color: 'rgba(255,181,71,.8)', text: '2.89 lakh · 485 deaths' },
        { label: 'Dengue, 2024', value: 233519, color: COL.heat, text: '2.34 lakh · 297 deaths' },
      ], { y: 52, w: w - 40, rowH: 41, labelW: 168, max: 2250000, font: 19 });
      g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.7)'; wrap(g, 'National Center for Vector Borne Diseases Control. Reported cases: the true numbers are higher. 1 lakh = 100,000.', 20, 316, w - 40, 22);
    }, B2);

    const reset = (frac = 0) => { gen = frac * GENS; };
    const tmp = new THREE.Color();
    return {
      reset,
      update(dt, s, time) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        layout(stage, [b1, b2], model, { tallScale: 1.3, tallAt: [-0.2, 0.6, 0] });
        const narrow = fitNarrow(stage, [lKey]);
        const k = `${s.use.toFixed(2)}|${s.p0.toPrecision(3)}`;
        if (k !== key) { key = k; R = resistance({ use: s.use, p0: s.p0, gens: GENS }); dkey = ''; }
        gen += dt * s.fast; if (gen > GENS + s.fast * 1.5) reset();
        const i = Math.min(GENS, Math.floor(gen)), p = R.pts[i][1], q = 1 - p;
        coil.glow(time, s.use > 0.01); coil.ember.visible = coil.halo.visible = s.use > 0.01;
        Q.forEach((m, j) => {
          const gt = m.u < p * p ? 'RR' : m.u < p * p + 2 * p * q ? 'RS' : 'SS', surv = gt === 'RR' ? 0.9 : gt === 'RS' ? 0.5 : 0.2;
          const dead = m.v < s.use * (1 - surv);
          m.fall += ((dead ? 1 : 0) - m.fall) * Math.min(1, dt * 4);
          const fy = CY + 1.0 + m.y * (CH - 1.25) + 0.12 * Math.sin(time * 3 + m.ph), y = fy + (CY + 0.1 - fy) * m.fall;
          D.place(j, m.x + 0.1 * Math.sin(time * 2.3 + m.ph) * (1 - m.fall), y, m.z + 0.1 * Math.cos(time * 1.9 + m.ph) * (1 - m.fall), 1);
          D.tint(j, tmp.copy(GCOL[gt]).lerp(GCOL.dead, m.fall * 0.55));
        });
        D.done();
        lCase.element.innerHTML = `<b>${(gen / PER_YEAR).toFixed(1)} years</b> · resistant gene in ${(p * 100).toFixed(p < 0.1 ? 1 : 0)}% of copies`;
        const dk = `${key}|${i}`;
        if (dk !== dkey) { dkey = dk; b1.redraw(); }
        void narrow; void hex; void fmt0;
      },
      readout: (s) => {
        const i = Math.min(GENS, Math.floor(gen)), p = R.pts[i][1];
        return `<div class="big">${(gen / PER_YEAR).toFixed(1)} years on</div>
          <div class="row"><span>Resistant gene</span><b>${(p * 100).toFixed(p < 0.1 ? 1 : 0)}% of copies</b></div>
          <div class="row"><span>A standard dose kills</span><b>${Math.round(R.kill(p) * 100)}% (was ${Math.round(R.kill0 * 100)}%)</b></div>
          <div class="row"><span>Resistant majority after</span><b>${R.g50 == null ? (s.use < 0.05 ? 'never: it fades' : 'more than 6 years') : (R.g50 / PER_YEAR).toFixed(1) + ' years'}</b></div>
          <div class="row"><span>Generations a year</span><b>about ${PER_YEAR}</b></div>
          <small>A teaching model with round survival figures. Real resistance is tracked by ICMR surveys.</small>`;
      },
    };
  },
};
