import * as THREE from 'three';

const fabricMat = (name, color, extra = {}) => new THREE.MeshPhysicalMaterial(Object.assign({
  name, color, roughness: 0.95, sheen: 0.55, sheenRoughness: 0.75,
  sheenColor: new THREE.Color(0xffffff),
}, extra));

const M = {
  boardLight: new THREE.MeshStandardMaterial({ name: 'deck_board', color: 0xc9a173, roughness: 0.72 }),
  boardAlt: new THREE.MeshStandardMaterial({ name: 'deck_board_alt', color: 0xbe9467, roughness: 0.8 }),
  frameLight: new THREE.MeshStandardMaterial({ name: 'deck_frame', color: 0xa8825b, roughness: 0.88 }),
  fabric: fabricMat('tent_fabric', 0xd9ccb0, { side: THREE.DoubleSide }),
  fabricDark: fabricMat('tent_trim', 0x5a6158, { side: THREE.DoubleSide, sheen: 0.35 }),
  mesh: new THREE.MeshStandardMaterial({
    name: 'tent_mesh', color: 0x2f342e, roughness: 0.9,
    transparent: true, opacity: 0.55, side: THREE.DoubleSide,
  }),
  pole: new THREE.MeshStandardMaterial({ name: 'pole_alloy', color: 0xc2c7cb, roughness: 0.32, metalness: 0.35 }),
  cord: new THREE.MeshStandardMaterial({ name: 'cord', color: 0xe4d9c2, roughness: 0.95 }),
  mattress: fabricMat('mattress', 0x4d5a66, { roughness: 0.65, sheen: 0.3 }),
  pillow: fabricMat('pillow', 0xe7e2d6),
  blanket: fabricMat('blanket', 0xa7543c),
  glow: new THREE.MeshStandardMaterial({ name: 'lantern_glass', color: 0xf6e6bd, roughness: 0.4, emissive: 0xd8b978, emissiveIntensity: 0.6 }),
};


const DECK = { w: 4, d: 3, h: 0.13 };
const TOP = DECK.h + 0.028;

function box(w, h, d, mat, name, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.name = name;
  m.position.set(x, y, z);
  return m;
}

function strut(a, b, r, mat, name) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), 8), mat);
  m.name = name;
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return m;
}

function roundedSlab(w, d, thickness, radius, mat, name) {
  const s = new THREE.Shape();
  const hw = w / 2 - radius, hd = d / 2 - radius;
  s.moveTo(-hw - radius, -hd);
  s.lineTo(-hw - radius, hd);
  s.quadraticCurveTo(-hw - radius, hd + radius, -hw, hd + radius);
  s.lineTo(hw, hd + radius);
  s.quadraticCurveTo(hw + radius, hd + radius, hw + radius, hd);
  s.lineTo(hw + radius, -hd);
  s.quadraticCurveTo(hw + radius, -hd - radius, hw, -hd - radius);
  s.lineTo(-hw, -hd - radius);
  s.quadraticCurveTo(-hw - radius, -hd - radius, -hw - radius, -hd);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: thickness, bevelEnabled: true, bevelThickness: thickness * 0.45,
    bevelSize: thickness * 0.45, bevelSegments: 4, curveSegments: 8,
  });
  g.rotateX(-Math.PI / 2);
  g.computeBoundingBox();
  g.translate(0, -g.boundingBox.min.y, 0);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.name = name;
  return m;
}

/* ── Capa 0 — Deck ───────────────────────────────────────────── */
function buildDeck() {
  const g = new THREE.Group();
  g.name = 'capa0_deck';

  const structure = new THREE.Group();
  structure.name = 'deck_estructura';
  for (const z of [-1.4, 0, 1.4]) {
    structure.add(box(DECK.w - 0.04, DECK.h - 0.01, 0.12, M.frameLight, `durmiente_${z}`, 0, (DECK.h - 0.01) / 2, z));
  }
  for (let i = 0; i <= 8; i++) {
    const x = -DECK.w / 2 + 0.06 + (i * (DECK.w - 0.12)) / 8;
    structure.add(box(0.075, 0.1, DECK.d - 0.02, M.frameLight, `travesano_${i}`, x, DECK.h - 0.05, 0));
  }
  g.add(structure);

  const boards = new THREE.Group();
  boards.name = 'deck_tablas';
  const pitch = 0.152, bw = 0.138;
  const n = Math.floor(DECK.d / pitch);
  for (let i = 0; i < n; i++) {
    const z = -DECK.d / 2 + pitch / 2 + i * pitch;
    boards.add(box(DECK.w, 0.028, bw, i % 2 ? M.boardAlt : M.boardLight, `tabla_${i}`, 0, DECK.h + 0.014, z));
  }
  g.add(boards);

  const fascia = new THREE.Group();
  fascia.name = 'deck_zocalo';
  const fh = DECK.h + 0.028;
  fascia.add(box(DECK.w + 0.03, fh, 0.025, M.frameLight, 'zocalo_atras', 0, fh / 2, -DECK.d / 2 - 0.012));
  fascia.add(box(DECK.w + 0.03, fh, 0.025, M.frameLight, 'zocalo_frente', 0, fh / 2, DECK.d / 2 + 0.012));
  for (const x of [-1, 1]) {
    fascia.add(box(0.025, fh, DECK.d + 0.05, M.frameLight, `zocalo_lado_${x}`, x * (DECK.w / 2 + 0.012), fh / 2, 0));
  }
  g.add(fascia);


  return { group: g };
}

/* ── Capa 1 — Carpa ──────────────────────────────────────────── */
const SQ = 3.1;
function domePatch(radius, phiStart, phiLength, thetaStart, thetaLength, wSeg, hSeg) {
  const geo = new THREE.SphereGeometry(radius, wSeg, hSeg, phiStart, phiLength, thetaStart, thetaLength);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const a = Math.atan2(z, x);
    const f = 1 / Math.pow(
      Math.pow(Math.abs(Math.cos(a)), SQ) + Math.pow(Math.abs(Math.sin(a)), SQ), 1 / SQ);
    p.setX(i, x * f);
    p.setZ(i, z * f);
  }
  geo.computeVertexNormals();
  return geo;
}

function buildDome() {
  const g = new THREE.Group();
  g.name = 'carpa_domo';
  const R = 1.35;

  const shellGroup = new THREE.Group();
  shellGroup.name = 'domo_carcasa';
  const GAP = 0.62; // medio ancho angular del vano frontal
  const cap = new THREE.Mesh(domePatch(R, 0, Math.PI * 2, 0, 0.62, 72, 14), M.fabric);
  cap.name = 'domo_lona_superior';
  shellGroup.add(cap);
  const skirt = new THREE.Mesh(
    domePatch(R, Math.PI / 2 + GAP, Math.PI * 2 - GAP * 2, 0.62, Math.PI / 2 - 0.62, 72, 18),
    M.fabric
  );
  skirt.name = 'domo_lona_lateral';
  shellGroup.add(skirt);
  const jamb = new THREE.Mesh(
    new THREE.TorusGeometry(R, 0.012, 8, 40, Math.PI - GAP * 2 > 0 ? GAP * 2 : 0.2),
    M.fabricDark
  );
  jamb.name = 'domo_borde_vano';
  jamb.rotation.x = Math.PI / 2;
  jamb.rotation.z = Math.PI / 2 - GAP;
  jamb.position.y = 0.02;
  shellGroup.add(jamb);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(R - 0.02, 48), M.fabricDark);
  floor.name = 'domo_piso';
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.012;
  shellGroup.add(floor);

  const meshPanel = new THREE.Mesh(
    domePatch(R + 0.006, -Math.PI / 2 - 0.3, 0.6, 0.62, 0.28, 28, 16),
    M.mesh
  );
  meshPanel.name = 'domo_mosquitero';
  shellGroup.add(meshPanel);

  const win = new THREE.Mesh(
    domePatch(R + 0.008, Math.PI - 0.28, 0.56, 0.6, 0.3, 24, 14),
    M.mesh
  );
  win.name = 'domo_ventana';
  shellGroup.add(win);

  const vent = new THREE.Mesh(domePatch(R + 0.015, 0, Math.PI * 2, 0, 0.17, 28, 10), M.fabricDark);
  vent.name = 'domo_ventilacion';
  shellGroup.add(vent);

  for (let i = 0; i < 2; i++) {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(R + 0.026, 0.019, 10, 96, Math.PI), M.pole);
    arc.name = `domo_varilla_${i}`;
    arc.rotation.y = i * Math.PI / 2;
    shellGroup.add(arc);
  }
  shellGroup.scale.set(0.93, 1.16, 0.93);
  g.add(shellGroup);

  // Faldones de la puerta, recogidos a los costados (carpa abierta)
  for (const s of [-1, 1]) {
    const flap = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.62, 8, 16), M.fabricDark);
    flap.name = `puerta_faldon_${s > 0 ? 'a' : 'b'}`;
    flap.position.set(s * 0.76, 0.42, 1.0);
    flap.rotation.set(0.12, 0, s * 0.16);
    g.add(flap);
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.008, 6, 20), M.cord);
    tie.name = `puerta_lazo_${s > 0 ? 'a' : 'b'}`;
    tie.position.set(s * 0.76, 0.5, 1.0);
    tie.rotation.y = Math.PI / 2;
    g.add(tie);
  }

  const V = THREE.Vector3;
  g.add(strut(new V(-1.05, 0.78, 0.72), new V(-1.6, 0.02, 1.15), 0.007, M.cord, 'viento_a'));
  g.add(strut(new V(1.05, 0.78, 0.72), new V(1.6, 0.02, 1.15), 0.007, M.cord, 'viento_b'));
  g.add(strut(new V(-1.18, 1.05, -0.35), new V(-1.72, 0.02, -0.7), 0.007, M.cord, 'viento_c'));
  g.add(strut(new V(1.18, 1.05, -0.35), new V(1.72, 0.02, -0.7), 0.007, M.cord, 'viento_d'));
  return g;
}

/* ── Capa 2 — Interior ───────────────────────────────────────── */
function buildInterior() {
  const g = new THREE.Group();
  g.name = 'capa2_interior';

  const mat = roundedSlab(1.95, 1.4, 0.16, 0.1, M.mattress, 'colchon_inflable');
  mat.position.set(0, 0.005, -0.1);
  g.add(mat);
  for (let i = 0; i < 7; i++) {
    const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.28, 10), M.mattress);
    rib.name = `nervio_${i}`;
    rib.rotation.x = Math.PI / 2;
    rib.position.set(-0.78 + i * 0.26, 0.255, -0.1);
    g.add(rib);
  }

  for (const x of [-0.42, 0.42]) {
    const p = roundedSlab(0.58, 0.36, 0.14, 0.09, M.pillow, `almohada_${x}`);
    p.position.set(x, 0.265, -0.62);
    p.rotation.y = x < 0 ? 0.08 : -0.08;
    g.add(p);
  }

  const blanket = roundedSlab(1.7, 0.72, 0.13, 0.06, M.blanket, 'manta');
  blanket.position.set(0, 0.265, 0.2);
  blanket.rotation.y = 0.04;
  g.add(blanket);

  const lantern = new THREE.Group();
  lantern.name = 'farol';
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.06, 20), M.pole);
  base.name = 'farol_base';
  base.position.y = 0.03;
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.13, 20), M.glow);
  glass.name = 'farol_vidrio';
  glass.position.y = 0.125;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.085, 0.05, 20), M.pole);
  cap.name = 'farol_tapa';
  cap.position.y = 0.213;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.007, 8, 24, Math.PI), M.pole);
  handle.name = 'farol_asa';
  handle.position.y = 0.235;
  lantern.add(base, glass, cap, handle);
  lantern.position.set(-1.0, 0.01, 0.52);
  g.add(lantern);

  const bag = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.42, 12, 20), M.blanket);
  bag.name = 'bolso';
  bag.rotation.z = Math.PI / 2;
  bag.position.set(0.48, 0.17, 0.92);
  g.add(bag);
  return g;
}

/* ── Escena ──────────────────────────────────────────────────── */
export function buildScene() {
  const root = new THREE.Group();
  root.name = 'espacio_camping';

  const deck = buildDeck();
  root.add(deck.group);

  const tent = new THREE.Group();
  tent.name = 'capa1_carpa';
  tent.position.set(0, TOP, -0.16);
  tent.add(buildDome());
  root.add(tent);

  const interior = buildInterior();
  interior.position.set(0, TOP + 0.005, -0.16);
  root.add(interior);

  return {
    root,
    layers: { deck: deck.group, tent, interior },
  };
}
