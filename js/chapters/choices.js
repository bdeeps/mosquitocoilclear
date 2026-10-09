// Chapter 5: what else works. Nine ways people try to keep mosquitoes off, one vignette each, with
// a few mosquitoes that behave the way the evidence says: turned back by a vapour, stopped by a
// net or screen, blown about by a fan, or not bothered at all by an ultrasonic gadget.
// What the trials and official bodies say (sources read unless marked):
//  Coils: field studies found pyrethrin coils deterred 45 to 80% of mosquitoes (Ogoma, Moore and
//   Maia, Parasites & Vectors 5:287, 2012). "We do not know if mosquito coils offer protection
//   against malaria": two trials, very low certainty (Maia, Kliner, Richardson, Lengeler and Moore,
//   Cochrane Database Syst. Rev. 2018, CD011595). The same review: not enough evidence that skin
//   repellents prevent malaria in communities.
//  Spatial emanators: WHO, 13 August 2025: a conditional recommendation for indoor use alongside
//   insecticide-treated nets against malaria; two passive transfluthrin products prequalified.
//  Nets: WHO strongly recommends insecticide-treated nets where malaria spreads; nets accounted for
//   68% of the 663 million malaria cases averted in sub-Saharan Africa, 2000 to 2015 (Bhatt et
//   al., Nature 526:207, 2015). House screening: WHO conditional recommendation, 2021 (search summary).
//  Ultrasonic gadgets: Enayati, Hemingway and Garner, Cochrane Database Syst. Rev. 2007, CD005434:
//   no evidence that they prevent bites; they "should not be recommended or used" (search summary).
//  Fans: Hoffmann and Miller, J. Med. Entomol. 2003, found fan wind cut mosquito catches at baited
//   traps (recalled, not re-read). No disease trials.
//  Label strengths of vaporisers and mats: the CIB&RC list of registered formulations (01.06.2023).
//  Smoke: Zhang et al., Indoor Air 2010 (coils). Vaporisers and mats have no ember, so no smoke
//   from burning; they still put the active into the air.
// The share of mosquitoes shown getting through is a picture, not a measurement, except for the
// coil (drawn inside the 45 to 80% range).
import { THREE, M, canvasTexture } from '../kit.js';
import { COL, hex, VIEW, BW, BH, B1, B2, board, panelBg, title, bars, wrap, puffs, rng, makeCoil, makeStand, makeMosquito, flowArrow, layout, fitNarrow, link, clamp, lerp } from '../coil.js';

const OPT = [
  { id: 'coil', n: 'Mosquito coil', kind: 'A vapour in the air, made by an ember', mode: 'repel', pass: 0.35, pm: 90, how: 'An ember warms a pyrethroid into the air for about eight hours.', smoke: 'Yes: 63 to 127 mg of fine dust an hour from ordinary coils.', ev: 'Cuts bites: field studies found 45 to 80% of mosquitoes kept away. Whether coils prevent malaria is not known (Cochrane review, 2018).' },
  { id: 'vap', n: 'Liquid vaporiser', kind: 'The same vapour, made by a small heater', mode: 'repel', pass: 0.35, pm: 0, how: 'A wick lifts the liquid to a small electric heater that warms it into the air. Indian labels: transfluthrin 0.88 to 1.6%, prallethrin 0.8%.', smoke: 'No ember, so no smoke from burning. The active still enters the air.', ev: 'Same family of actives as a coil. In 2025 WHO conditionally recommended passive "spatial emanators" with nets against malaria.' },
  { id: 'mat', n: 'Mat heater', kind: 'The same vapour, from a warmed mat', mode: 'repel', pass: 0.35, pm: 0, how: 'A small pad soaked in pyrethroid sits on an electric hot plate and gives off vapour for a night.', smoke: 'No ember, so no smoke from burning. The active still enters the air.', ev: 'The first electric mat was sold in Japan in 1963. Few trials have tested mats against disease.' },
  { id: 'net', n: 'Bed net', kind: 'A barrier, often treated with insecticide', mode: 'block', pass: 0, pm: 0, how: 'Fine mesh keeps mosquitoes off a sleeper. A treated net also kills or repels those that land on it.', smoke: 'None.', ev: 'WHO\'s main recommendation where malaria spreads. Treated nets account for 68% of the malaria cases averted in Africa from 2000 to 2015.' },
  { id: 'screen', n: 'Window screen', kind: 'A barrier on the house', mode: 'block', pass: 0, pm: 0, how: 'Mesh on windows and doors lets air through and keeps mosquitoes out, so you can ventilate freely.', smoke: 'None.', ev: 'WHO conditionally recommends screening houses against malaria (2021). It works day and night.' },
  { id: 'fan', n: 'Fan', kind: 'Moving air', mode: 'blow', pass: 0.4, pm: 0, how: 'Mosquitoes are weak fliers, and moving air scatters the breath and skin smells they follow.', smoke: 'None.', ev: 'Small field tests caught fewer mosquitoes near fans. No trials against disease. Helps most close to the fan.' },
  { id: 'water', n: 'Empty standing water', kind: 'Stops them before they fly', mode: 'water', pass: 0, pm: 0, how: 'The mosquitoes that carry dengue and chikungunya breed in clean standing water: coolers, tubs, tyres, pot plates. Egg to adult takes about a week.', smoke: 'None.', ev: 'The national programme (NCVBDC) asks every home to empty and scrub water containers once a week.' },
  { id: 'skin', n: 'Skin repellent', kind: 'A vapour layer on your skin', mode: 'repel', pass: 0.1, pm: 0, how: 'A cream or spray such as DEET or picaridin forms a thin vapour layer that mosquitoes avoid landing through.', smoke: 'None.', ev: 'Tested to stop bites for hours. Whether repellents prevent malaria in whole communities is not proven (Cochrane review, 2018). Follow the label, above all for children.' },
  { id: 'gadget', n: 'Ultrasonic gadget', kind: 'A buzz mosquitoes ignore', mode: 'none', pass: 1, pm: 0, how: 'Claims to drive mosquitoes away with high-pitched sound.', smoke: 'None.', ev: 'A Cochrane review of field studies found no evidence that these devices stop bites, and said they should not be recommended.' },
];
const byId = Object.fromEntries(OPT.map((o) => [o.id, o]));

export default {
  id: 'choices',
  short: 'What else works',
  title: 'What else works, and what does not',
  subtitle: 'Vapours, barriers, moving air, dry buckets, and one gadget that fails every fair test.',
  view: VIEW,
  learn: `<p>A coil is one of a family. A <b>liquid vaporiser</b> and a <b>mat heater</b> put the same kind of active into the air, but with a small electric heater in place of an ember. A wick lifts the liquid up to the heater (the same capillary pull as a lamp's wick in ${link('diyaclear', 'DiyaClear', 'wick')}). No ember means <b>no smoke from burning</b>, though the vapour itself is still in the room, so the label's advice to ventilate still applies.</p>
    <p>Then there are ways that use no chemical in the air at all. A <b>bed net</b> is a wall of mesh, and a net treated with insecticide is the World Health Organization's main recommendation wherever malaria spreads. <b>Screens</b> on windows and doors let you air the room without letting mosquitoes in. A <b>fan</b> helps because mosquitoes are weak fliers and the moving air scatters the breath they track. And the surest step of all happens outside: <b>emptying standing water</b> once a week, so the mosquitoes that carry dengue never grow up.</p>
    <p><b>What do fair tests say?</b> Coils clearly reduce bites. But when Cochrane reviewers looked for trials showing that coils prevent <b>malaria</b>, they concluded "we do not know": the trials were too few and too weak. That is not proof of failure; it is an honest gap. In 2025 the WHO gave a cautious, conditional recommendation to a newer cousin, the passive <b>spatial emanator</b>, used together with nets.</p>
    <p>Two things do badly in tests. <b>Ultrasonic</b> repellers: field studies found no effect at all. And "<b>herbal</b>" coils and sticks: plant oils such as citronella can repel for a short while on skin, but trials of their smoke are few, and smoke from any coil is still smoke. A legal insecticide product in India carries a registration number on its pack whatever it calls itself.</p>
    <p class="tip"><b>Try it:</b> step through the nine choices and watch what the mosquitoes do. Which ones add nothing to the air you breathe?</p>`,
  terms: [
    { t: 'Liquid vaporiser', d: 'A plug-in heater with a bottle and a wick that warms a pyrethroid liquid into the air.' },
    { t: 'Insecticide-treated net', d: 'A bed net whose fibres carry a pyrethroid, so it both blocks mosquitoes and kills or repels those that land.' },
    { t: 'Spatial emanator', d: 'A device that releases a repellent vapour into a space without heat or flame.' },
    { t: 'Cochrane review', d: 'A careful, published summary of all the fair trials on one health question.' },
    { t: 'Conditional recommendation', d: 'Advice that an option probably helps, with less certainty than a strong recommendation.' },
    { t: 'Breeding site', d: 'Still water where mosquitoes lay eggs and their young grow.' },
  ],
  defaults: { pick: 'coil' },
  controls: [
    { key: 'pick', type: 'seg', label: 'Choose one', options: OPT.map((o) => ({ v: o.id, label: o.n })) },
  ],
  quiz: [
    { q: 'What is the main difference between a coil and a liquid vaporiser?', options: ['They use completely different kinds of chemical', 'The vaporiser warms a similar active with an electric heater, so there is no smoke from burning', 'The vaporiser makes more smoke', 'A coil needs electricity'], answer: 1, why: 'Both put a pyrethroid into the air. A coil does it with an ember, which also makes smoke; a vaporiser uses a small heater and a wick.' },
    { q: 'What did Cochrane reviewers conclude about coils and malaria?', options: ['Coils certainly prevent malaria', 'Coils certainly do not prevent malaria', 'We do not know: the trials are too few and too weak', 'Coils cause malaria'], answer: 2, why: 'Coils reduce bites, but the two trials on disease gave a very uncertain answer. Absence of proof is not proof of absence.' },
    { q: 'Which of these has failed every fair field test?', options: ['Bed nets', 'Window screens', 'Ultrasonic repellers', 'Emptying standing water'], answer: 2, why: 'A Cochrane review of field studies found no evidence that ultrasonic devices stop mosquitoes biting.' },
  ],
  reel: [
    { ms: 5600, caption: 'A vaporiser makes the same vapour without the ember. A treated bed net adds nothing to the air at all.', set: { pick: 'vap' }, anim: { pick: ['vap', 'net'] }, spin: 0 },
  ],

  build({ stage, s: s0 }) {
    const root = new THREE.Group(); stage.root.add(root);
    const model = new THREE.Group(); model.position.set(-0.5, 0, 0); root.add(model);
    const rnd = rng(77);
    let S = { ...s0 }, key = '';
    const V = {}, add = (id) => { const g = new THREE.Group(); model.add(g); V[id] = g; return g; };
    const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; return m; };
    const white = M.plastic(0xe9edf2), dark = M.plastic(0x2a2f3a), wood = M.matte(0x7a5a3a), skin = M.matte(0x8f6a4f), cloth = M.matte(0x3f6f8f);
    const table = mesh(new THREE.BoxGeometry(5.2, 0.16, 2.4), wood, 0, 0.9, 0); table.receiveShadow = true; model.add(table);
    const TY = 0.98;
    // the target every mosquito is after: a forearm resting on the table (or a sleeper under the net)
    const arm = new THREE.Group(); arm.add(mesh(new THREE.CapsuleGeometry(0.2, 1.3, 6, 12), skin)); arm.children[0].rotation.z = Math.PI / 2; arm.add(mesh(new THREE.SphereGeometry(0.24, 14, 10), skin, 0.9, 0, 0)); arm.position.set(-1.5, TY + 0.22, 0.2); model.add(arm);

    // coil
    { const g = add('coil'), st = makeStand(0.5, 0.7); st.position.set(0.9, TY, 0); const c = makeCoil({ rIn: 0.16, rOut: 0.9, pitch: 0.25, width: 0.11, thick: 0.07, seg: 300 }); c.g.position.set(0.9, TY + 0.5, 0); c.g.rotation.x = 0.5; c.burn(0.3, true); g.add(st, c.g); g.userData.coil = c; }
    // liquid vaporiser: body, bottle, wick, heater ring
    { const g = add('vap'); g.add(mesh(new THREE.BoxGeometry(0.75, 0.6, 0.5), white, 0.9, TY + 1.35, 0), mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.7, 20), M.clear(0x9ad0ff, 0.5), 0.9, TY + 0.72, 0), mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.4, 20), M.plastic(0x6fb6ff, { transparent: true, opacity: 0.8 }), 0.9, TY + 0.58, 0), mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.1, 10), M.matte(0xf2efe6), 0.9, TY + 1.0, 0), mesh(new THREE.TorusGeometry(0.1, 0.035, 8, 20), M.glow(0xff8a4a), 0.9, TY + 1.67, 0)); g.children[4].rotation.x = Math.PI / 2; g.add(mesh(new THREE.BoxGeometry(0.1, 0.25, 0.04), M.metal(), 0.75, TY + 1.35, -0.3), mesh(new THREE.BoxGeometry(0.1, 0.25, 0.04), M.metal(), 1.05, TY + 1.35, -0.3)); }
    // mat heater
    { const g = add('mat'); g.add(mesh(new THREE.BoxGeometry(1.0, 0.28, 0.7), white, 0.9, TY + 0.14, 0), mesh(new THREE.BoxGeometry(0.6, 0.04, 0.42), M.metal(0x8a8f99), 0.9, TY + 0.3, 0), mesh(new THREE.BoxGeometry(0.5, 0.05, 0.34), M.matte(0x4f8fd9), 0.9, TY + 0.345, 0)); }
    // bed net over a sleeper
    { const g = add('net'), bx = new THREE.BoxGeometry(3.0, 1.9, 1.6); const net = new THREE.Mesh(bx, M.clear(0xdfe8f5, 0.16)); net.position.set(-0.4, TY + 0.95, 0.1); const ed = new THREE.LineSegments(new THREE.EdgesGeometry(bx), new THREE.LineBasicMaterial({ color: 0xdfe8f5 })); ed.position.copy(net.position);
      const tex = canvasTexture(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = 'rgba(230,240,255,.5)'; c.lineWidth = 1; for (let i = 0; i <= 32; i++) { c.beginPath(); c.moveTo(i * 8, 0); c.lineTo(i * 8, h); c.moveTo(0, i * 8); c.lineTo(w, i * 8); c.stroke(); } });
      const front = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.9), new THREE.MeshBasicMaterial({ map: tex.tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })); front.position.set(-0.4, TY + 0.95, 0.91);
      g.add(net, ed, front, mesh(new THREE.BoxGeometry(2.7, 0.14, 1.3), M.matte(0xd9d4c7), -0.4, TY + 0.07, 0.1), mesh(new THREE.CapsuleGeometry(0.22, 1.5, 6, 12), cloth, -0.3, TY + 0.36, 0.1), mesh(new THREE.SphereGeometry(0.2, 14, 10), skin, -1.4, TY + 0.36, 0.1)); g.children[4].rotation.z = Math.PI / 2; }
    // window screen
    { const g = add('screen'), fr = M.matte(0xd8d2c4);
      const tex = canvasTexture(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(40,60,100,.35)'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(230,240,255,.55)'; c.lineWidth = 1; for (let i = 0; i <= 42; i++) { c.beginPath(); c.moveTo(i * 6, 0); c.lineTo(i * 6, h); c.moveTo(0, i * 6); c.lineTo(w, i * 6); c.stroke(); } });
      const sc = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshBasicMaterial({ map: tex.tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })); sc.position.set(0.6, TY + 1.4, 0.4); sc.rotation.y = -0.5;
      const f = new THREE.Group(); [[0, 1.15, 2.4, 0.1], [0, -1.15, 2.4, 0.1], [-1.15, 0, 0.1, 2.4], [1.15, 0, 0.1, 2.4]].forEach(([x, y, w, h]) => f.add(mesh(new THREE.BoxGeometry(w, h, 0.1), fr, x, y, 0))); f.position.copy(sc.position); f.rotation.y = -0.5; g.add(sc, f); }
    // fan
    { const g = add('fan'), hub = new THREE.Group(); hub.position.set(1.3, TY + 1.25, 0); hub.rotation.y = -Math.PI / 2 + 0.25;
      for (let i = 0; i < 3; i++) { const b = mesh(new THREE.BoxGeometry(0.2, 0.55, 0.03), M.plastic(0x9ad0ff)); b.position.y = 0.3; const p = new THREE.Group(); p.rotation.z = (i * Math.PI * 2) / 3; b.rotation.y = 0.35; p.add(b); hub.add(p); }
      const cage = mesh(new THREE.TorusGeometry(0.66, 0.025, 8, 40), M.metal()); cage.position.copy(hub.position); cage.rotation.y = hub.rotation.y;
      g.add(hub, cage, mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 10), dark, 1.45, TY + 0.6, 0), mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.1, 24), dark, 1.45, TY + 0.05, 0), mesh(new THREE.SphereGeometry(0.14, 12, 10), dark, 1.38, TY + 1.25, 0)); g.userData.hub = hub;
      g.userData.arrows = [0.35, -0.3].map((dy) => { const a = flowArrow(hex(COL.cold), 0.035, 0.2); g.add(a); a.userData.dy = dy; return a; }); }
    // standing water: a tub, tipped out
    { const g = add('water'), tub = new THREE.Group(); tub.add(mesh(new THREE.CylinderGeometry(0.7, 0.55, 0.6, 28, 1, true), M.plastic(0xc9552f, { side: THREE.DoubleSide }), 0, 0.3, 0), mesh(new THREE.CircleGeometry(0.55, 28), M.plastic(0xc9552f), 0, 0.01, 0)); tub.children[1].rotation.x = -Math.PI / 2;
      const w = mesh(new THREE.CircleGeometry(0.66, 28), M.clear(0x6fb6ff, 0.6), 0, 0.46, 0); w.rotation.x = -Math.PI / 2; tub.add(w); tub.position.set(0.9, TY, 0.2); g.add(tub); g.userData.tub = tub; g.userData.w = w; }
    // skin repellent: a plain tube beside the arm
    { const g = add('skin'); g.add(mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.9, 18), white, 1.0, TY + 0.45, 0.2), mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 14), M.plastic(0x5ce1a9), 1.0, TY + 0.98, 0.2));
      const halo = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.5, 6, 14), M.ghost(hex(COL.vapour), 0.16)); halo.rotation.z = Math.PI / 2; halo.position.set(-1.35, TY + 0.22, 0.2); g.add(halo); }
    // ultrasonic gadget
    { const g = add('gadget'); g.add(mesh(new THREE.BoxGeometry(0.6, 0.8, 0.35), white, 0.9, TY + 0.9, 0), mesh(new THREE.CircleGeometry(0.16, 20), dark, 0.9, TY + 0.95, 0.18));
      g.userData.rings = [0, 1, 2].map((i) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 6, 40), M.ghost(0x8ef0ff, 0.5)); r.position.set(0.9, TY + 0.95, 0.2); r.userData.ph = i / 3; g.add(r); return r; }); }

    const vapour = puffs(model, 70, 0.04, hex(COL.vapour), rnd, { opacity: 0.85 });
    const smoke = puffs(model, 50, 0.045, 0xdfe6f2, rnd, { opacity: 0.5 });
    const wrig = puffs(model, 14, 0.035, 0x2a2623, rnd);
    // mosquitoes: fly in from the right towards the arm, then do what the chosen method makes them do
    const MQ = Array.from({ length: 7 }, (_, i) => { const m = makeMosquito(0.9); model.add(m); return { m, u: -i * 0.22, dir: 1, a: [0, 0, 0], through: true, k: rnd(), hold: 0 }; });
    const spawn = (q, o) => { q.u = -rnd() * 0.3; q.dir = 1; q.hold = 0; q.k = rnd(); q.a = [2.2 + rnd() * 0.9, TY + 1.0 + rnd() * 2.2, 1.4 + rnd() * 1.4]; q.through = rnd() < o.pass; };
    const lName = stage.label('', [-0.4, TY + 3.0, 0], model, 'hot');
    const lWhat = stage.label('', [-0.4, 0.45, 1.3], model);

    const b1 = board(root, BW, BH, 632, 364, (g, w, h) => {
      const o = byId[S.pick]; panelBg(g, w, h); title(g, o.n);
      let y = 70;
      [['How it works', o.how, COL.cold], ['Smoke', o.smoke, o.pm ? COL.hot : COL.ok], ['What fair tests say', o.ev, COL.gold]].forEach(([a, b, c]) => {
        g.font = 'bold 20px sans-serif'; g.fillStyle = c; g.fillText(a, 20, y); g.font = '20px sans-serif'; g.fillStyle = 'rgba(255,255,255,.88)'; y = wrap(g, b, 20, y + 25, w - 40, 24) + 14;
      });
    }, B1);
    const b2 = board(root, BW, BH, 632, 364, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Fine dust it adds to the room', 'mg of PM2.5 an hour');
      const sel = S.pick, on = (ids) => ids.includes(sel);
      bars(g, [
        { label: 'Ordinary coil', value: 90, color: on(['coil']) ? COL.hot : 'rgba(255,122,89,.45)', text: '63 to 127' },
        { label: 'Charcoal-base coil', value: 12.6, color: 'rgba(255,181,71,.6)', text: '12.6' },
        { label: 'Vaporiser or mat', value: 0, color: on(['vap', 'mat']) ? COL.ok : 'rgba(92,225,169,.45)', text: 'none from burning' },
        { label: 'Net, screen, fan', value: 0, color: on(['net', 'screen', 'fan', 'water', 'skin', 'gadget']) ? COL.ok : 'rgba(92,225,169,.45)', text: 'none' },
      ], { y: 62, w: w - 40, rowH: 54, labelW: 226, max: 135, font: 20 });
      g.font = '18px sans-serif'; g.fillStyle = 'rgba(255,255,255,.72)'; wrap(g, 'Measured on whole coils in a test chamber (Indoor Air, 2010). Anything with a vapour still puts its active into the air.', 20, 302, w - 40, 23);
    }, B2);

    const P = new THREE.Vector3();
    return {
      update(dt, s, time) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s;
        layout(stage, [b1, b2], model, { tallScale: 1.3, tallAt: [-0.3, 1.2, 0], scale: 1.3 });
        const narrow = fitNarrow(stage, [lWhat]);
        const o = byId[s.pick];
        if (s.pick !== key) { key = s.pick; Object.entries(V).forEach(([id, g]) => { g.visible = id === key; }); MQ.forEach((q) => spawn(q, o)); vapour.clear(); smoke.clear(); wrig.clear(); b1.redraw(); b2.redraw(); }
        arm.visible = s.pick !== 'net';
        lName.element.innerHTML = `<b>${o.n}</b>`; lWhat.element.textContent = o.kind;
        // each device's own motion
        if (s.pick === 'coil') { const c = V.coil.userData.coil; c.glow(time, true); c.ember.getWorldPosition(P); model.worldToLocal(P); smoke.step(dt, 12, () => [P.x, P.y + 0.05, P.z], () => [(rnd() - 0.5) * 0.1, 0.5, 0], 2.8, null, null, 1.3); vapour.step(dt, 10, () => [P.x, P.y, P.z], () => [(rnd() - 0.5) * 0.7, 0.2 + rnd() * 0.3, (rnd() - 0.5) * 0.6], 3, null, null, 0.4); }
        else smoke.step(dt, 0, () => [0, -9, 0], () => [0, 0, 0]);
        if (s.pick === 'vap' || s.pick === 'mat') { const y = TY + (s.pick === 'vap' ? 1.75 : 0.4); vapour.step(dt, 12, () => [0.9 + (rnd() - 0.5) * 0.2, y, (rnd() - 0.5) * 0.2], () => [(rnd() - 0.5) * 0.7, 0.3 + rnd() * 0.3, (rnd() - 0.5) * 0.6], 3, null, null, 0.4); }
        else if (s.pick !== 'coil') vapour.step(dt, 0, () => [0, -9, 0], () => [0, 0, 0]);
        if (s.pick === 'fan') { V.fan.userData.hub.rotation.x += dt * 18; V.fan.userData.arrows.forEach((a, i) => a.aim([0.5, TY + 1.25 + a.userData.dy, 0.15 * i], [-1, 0, 0.1], 1.0 + 0.25 * Math.sin(time * 3 + i))); }
        if (s.pick === 'gadget') V.gadget.userData.rings.forEach((r) => { const k = (time * 0.6 + r.userData.ph) % 1; r.scale.setScalar(0.4 + k * 3.4); r.material.opacity = 0.5 * (1 - k); });
        if (s.pick === 'water') { const k = (time % 8) / 8, tip = clamp((k - 0.45) * 5, 0, 1) * (1 - clamp((k - 0.9) * 10, 0, 1)); const tub = V.water.userData.tub; tub.rotation.z = -1.5 * tip; V.water.userData.w.visible = tip < 0.3; wrig.step(dt, tip < 0.05 ? 6 : 0, () => [0.9 + (rnd() - 0.5) * 0.8, TY + 0.4, 0.2 + (rnd() - 0.5) * 0.8], () => [(rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.1, (rnd() - 0.5) * 0.3], 1.6, null, null, 0.2); lWhat.element.textContent = tip > 0.3 ? 'tipped out: no water, no mosquitoes' : 'wrigglers: a week from flying'; }
        else wrig.step(dt, 0, () => [0, -9, 0], () => [0, 0, 0]);
        // mosquitoes
        const T = s.pick === 'net' ? [-1.2, TY + 0.5, 0.1] : [-1.2, TY + 0.45, 0.25];
        MQ.forEach((q, i) => {
          q.m.visible = s.pick !== 'water';
          const stopU = o.mode === 'block' ? (s.pick === 'net' ? 0.3 : 0.38) : o.mode === 'repel' ? (s.pick === 'skin' ? 0.86 : 0.5) : o.mode === 'blow' ? 0.6 : 2;
          const speed = 0.3 + 0.1 * q.k;
          if (q.hold > 0) { q.hold -= dt; if (q.hold <= 0) spawn(q, o); }
          else {
            q.u += dt * speed * q.dir * (q.dir < 0 ? 1.8 : 1);
            if (q.dir > 0 && !q.through && q.u > stopU) q.dir = -1;
            if (q.dir > 0 && q.u >= 1) { q.u = 1; q.hold = 1.2 + rnd(); }
            if (q.dir < 0 && q.u < 0.05) spawn(q, o);
          }
          const u = clamp(q.u, 0, 1), jit = q.dir < 0 && o.mode !== 'block' ? 0.35 : 0.12;
          let x = lerp(q.a[0], T[0], u), y = lerp(q.a[1], T[1], u) + Math.sin(time * 5 + i * 2) * jit * (1 - u * 0.8), z = lerp(q.a[2], T[2], u) + Math.cos(time * 4.3 + i) * jit * (1 - u * 0.8);
          if (o.mode === 'blow') { const w = clamp((u - 0.25) * 2, 0, 1) * (q.through ? 0.5 : 1.3); x -= w * 0.4; z += w * 1.1; y += w * 0.4 * Math.sin(time * 7 + i); }
          q.m.position.set(x, y, z); q.m.rotation.y = q.dir > 0 ? Math.PI - 0.4 : -0.4; q.m.rotation.z = q.hold > 0 ? 0 : 0.2 * Math.sin(time * 9 + i);
          q.m.userData.wings.forEach((wg, j) => { wg.rotation.x = -Math.PI / 2 + (j ? -1 : 1) * (0.5 + (q.hold > 0 ? 0 : 0.5 * Math.sin(time * 60 + i))); });
        });
        void narrow;
      },
      readout: (s) => {
        const o = byId[s.pick];
        return `<div class="big">${o.n}</div>
          <div class="row"><span>What it is</span><b>${o.kind}</b></div>
          <div class="row"><span>Smoke from burning</span><b style="color:${o.pm ? COL.hot : COL.ok}">${o.pm ? '63 to 127 mg an hour' : 'none'}</b></div>
          <div class="row"><span>Puts a chemical in the air</span><b>${['coil', 'vap', 'mat'].includes(o.id) ? 'yes' : o.id === 'skin' ? 'on skin only' : 'no'}</b></div>
          <div class="row"><span>Mosquitoes in the picture</span><b>${o.mode === 'none' ? 'not bothered' : o.mode === 'block' ? 'stopped at the mesh' : o.mode === 'blow' ? 'blown off course' : o.mode === 'water' ? 'never hatch' : 'most turn back'}</b></div>
          <small>${o.ev}</small>`;
      },
    };
  },
};
