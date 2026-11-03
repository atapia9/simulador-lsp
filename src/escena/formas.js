// Geometría de cada forma de pieza.
// Cada forma devuelve una lista de "partes": { geo, rol, color?, transparente? }.
//   rol 'principal' → toma el color que elige la persona.
//   rol 'fijo'      → conserva su propio color (llantas, tronco, ojos, vidrio…).
// Origen local: centro de la huella sin girar, con la base en y = 0.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Alto de una placa en unidades del mundo (1 espiga = 1 unidad). */
export const PH = 0.4;
const HOLGURA = 0.04;
const ESPIGA_R = 0.28;
const ESPIGA_H = 0.17;

const COLOR = {
  cafe: '#7A4E2D',
  verde: '#2E8B57',
  negro: '#22262B',
  gris: '#9AA1A9',
  blanco: '#F2F2EE',
  dorado: '#D4A017',
  amarillo: '#F5C518',
  piel: '#E3BC94',
  vidrio: '#BFE3F5',
};

function limpiar(g) {
  const r = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(r.attributes)) {
    if (k !== 'position' && k !== 'normal' && k !== 'uv') r.deleteAttribute(k);
  }
  r.morphAttributes = {};
  return r;
}

/** Une varias geometrías en una sola (menos llamadas de dibujo). */
function fusionar(geos) {
  const listas = geos.map(limpiar);
  const unida = mergeGeometries(listas, false);
  for (const g of geos) g.dispose();
  for (const g of listas) g.dispose();
  return unida;
}

/** Caja redondeada con la base en y. */
function caja(w, h, d, x = 0, y = 0, z = 0, radio = 0.05) {
  const r = Math.min(radio, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
  const g = new RoundedBoxGeometry(w, h, d, 2, r);
  g.translate(x, y + h / 2, z);
  return g;
}

function cilindro(r, h, x, y, z, seg = 20) {
  const g = new THREE.CylinderGeometry(r, r, h, seg);
  g.translate(x, y + h / 2, z);
  return g;
}

function esfera(r, x, y, z, sx = 1, sy = 1, sz = 1) {
  const g = new THREE.SphereGeometry(r, 18, 12);
  g.scale(sx, sy, sz);
  g.translate(x, y, z);
  return g;
}

/** Espigas sobre una huella ancho × fondo a la altura yTop. */
function espigas(ancho, fondo, yTop, filas = null) {
  const out = [];
  for (let j = 0; j < fondo; j++) {
    if (filas && !filas.includes(j)) continue;
    for (let i = 0; i < ancho; i++) {
      out.push(cilindro(ESPIGA_R, ESPIGA_H, i - ancho / 2 + 0.5, yTop, j - fondo / 2 + 0.5));
    }
  }
  return out;
}

const principal = (geo) => ({ geo, rol: 'principal' });
const fijo = (geo, color, transparente = false) => ({ geo, rol: 'fijo', color, transparente });

const FORMAS = {
  ladrillo(def) {
    const h = def.alto * PH;
    return [principal(fusionar([caja(def.ancho - HOLGURA, h - 0.01, def.fondo - HOLGURA), ...espigas(def.ancho, def.fondo, h)]))];
  },

  inclinado(def) {
    const w = def.ancho - HOLGURA;
    const d = def.fondo - HOLGURA;
    const h = def.alto * PH - 0.01;
    const labio = 0.22;
    // Perfil en (u, v): u recorre el fondo, v la altura. Lo alto queda atrás.
    const s = new THREE.Shape();
    s.moveTo(-d / 2, 0);
    s.lineTo(d / 2, 0);
    s.lineTo(d / 2, labio);
    s.lineTo(-d / 2 + 1, h);
    s.lineTo(-d / 2, h);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false });
    // Rotar para que el perfil quede en el eje Z y la extrusión en X.
    g.rotateY(Math.PI / 2);
    g.translate(-w / 2, 0, 0);
    // Tras girar, lo alto (u = -d/2) queda en z = +fondo/2: ahí van las espigas.
    return [principal(fusionar([g, ...espigas(def.ancho, def.fondo, h + 0.01, [def.fondo - 1])]))];
  },

  ruedas(def) {
    const w = def.ancho;
    const d = def.fondo;
    const filas = d <= 2 ? [0] : [-(d / 2 - 1), d / 2 - 1];
    const cuerpo = [caja(w - HOLGURA, PH, d - HOLGURA, 0, 2 * PH), ...espigas(w, d, 3 * PH)];
    const llantas = [];
    const rines = [];
    for (const z of filas) {
      cuerpo.push(caja(w - 0.5, 0.5, 0.6, 0, 0.32, z));
      for (const lado of [-1, 1]) {
        const x = lado * (w / 2 - 0.14);
        const ll = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 28);
        ll.rotateZ(Math.PI / 2);
        ll.translate(x, 0.45, z);
        llantas.push(ll);
        const ri = new THREE.CylinderGeometry(0.2, 0.2, 0.32, 16);
        ri.rotateZ(Math.PI / 2);
        ri.translate(x, 0.45, z);
        rines.push(ri);
      }
    }
    return [principal(fusionar(cuerpo)), fijo(fusionar(llantas), COLOR.negro), fijo(fusionar(rines), COLOR.gris)];
  },

  ventana(def) {
    const w = def.ancho - HOLGURA;
    const h = def.alto * PH - 0.01;
    const t = 0.18;
    const prof = 0.9;
    const marco = [
      caja(w, t, prof, 0, 0),
      caja(w, t, prof, 0, h - t),
      caja(t, h, prof, -w / 2 + t / 2, 0),
      caja(t, h, prof, w / 2 - t / 2, 0),
      ...espigas(def.ancho, def.fondo, h),
    ];
    if (def.ancho >= 4) marco.push(caja(0.12, h, 0.5, 0, 0));
    const vidrio = caja(w - 2 * t, h - 2 * t, 0.08, 0, t, 0, 0.01);
    return [principal(fusionar(marco)), fijo(vidrio, COLOR.vidrio, true)];
  },

  puerta(def) {
    const w = def.ancho - HOLGURA;
    const h = def.alto * PH - 0.01;
    const t = 0.16;
    const marco = [caja(w, t, 0.9, 0, h - t), caja(t, h, 0.9, -w / 2 + t / 2, 0), caja(t, h, 0.9, w / 2 - t / 2, 0), ...espigas(def.ancho, def.fondo, h)];
    const hoja = caja(w - 2 * t - 0.03, h - t - 0.02, 0.14, 0, 0, 0.12, 0.03);
    // Dos paneles en relieve para que se lea como puerta.
    const relieve = [caja(w - 2 * t - 0.3, h * 0.36, 0.06, 0, h * 0.08, 0.21, 0.02), caja(w - 2 * t - 0.3, h * 0.36, 0.06, 0, h * 0.52, 0.21, 0.02)];
    const perilla = esfera(0.08, w / 2 - t - 0.22, h * 0.47, 0.28);
    return [fijo(fusionar(marco), COLOR.blanco), principal(fusionar([hoja, ...relieve])), fijo(perilla, COLOR.dorado)];
  },

  arbol() {
    const base = caja(1.96, PH, 1.96, 0, 0, 0);
    const tronco = cilindro(0.22, 2.0, 0, PH, 0, 14);
    const copa = [];
    const capas = [
      [1.0, 1.8, 2.7],
      [0.78, 1.4, 3.55],
      [0.52, 1.0, 4.35],
    ];
    for (const [r, alto, y] of capas) {
      const c = new THREE.ConeGeometry(r, alto, 18);
      c.translate(0, y, 0);
      copa.push(c);
    }
    return [fijo(fusionar([base, tronco]), COLOR.cafe), principal(fusionar(copa))];
  },

  planta() {
    const maceta = caja(0.9, 0.5, 0.9, 0, 0, 0, 0.08);
    const hojas = [];
    const n = 6;
    for (let i = 0; i < n; i++) {
      const c = new THREE.ConeGeometry(0.11, 0.85, 8);
      c.translate(0, 0.42, 0);
      c.rotateZ(0.45);
      c.rotateY((i / n) * Math.PI * 2);
      c.translate(0, 0.45, 0);
      hojas.push(c);
    }
    const centro = new THREE.ConeGeometry(0.13, 1.05, 8);
    centro.translate(0, 0.45 + 0.52, 0);
    hojas.push(centro);
    return [fijo(maceta, COLOR.cafe), principal(fusionar(hojas))];
  },

  flor() {
    const base = caja(0.9, 0.2, 0.9, 0, 0, 0, 0.05);
    const tallo = cilindro(0.05, 1.05, 0, 0.2, 0, 8);
    const hoja = esfera(0.16, 0.14, 0.62, 0, 1.2, 0.35, 0.6);
    const petalos = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      petalos.push(esfera(0.14, Math.cos(a) * 0.17, 1.32, Math.sin(a) * 0.17, 1, 0.55, 1));
    }
    const centro = esfera(0.1, 0, 1.36, 0, 1, 0.7, 1);
    return [fijo(fusionar([base, tallo, hoja]), COLOR.verde), principal(fusionar(petalos)), fijo(centro, COLOR.amarillo)];
  },

  // Figura original: cuerpo de cápsula, cabeza redonda y brazos simples.
  figura(def) {
    const s = def.escala ?? 1;
    const base = cilindro(0.4 * s, 0.14 * s, 0, 0, 0, 24);
    const cuerpo = new THREE.CapsuleGeometry(0.3 * s, 0.7 * s, 6, 18);
    cuerpo.translate(0, (0.14 + 0.65) * s, 0);
    const brazos = [-1, 1].map((lado) => {
      const b = new THREE.CapsuleGeometry(0.085 * s, 0.42 * s, 4, 10);
      b.rotateZ(lado * 0.38);
      b.translate(lado * 0.36 * s, 0.92 * s, 0);
      return b;
    });
    const cabeza = esfera(0.27 * s, 0, 1.72 * s, 0);
    const ojos = [-1, 1].map((lado) => esfera(0.035 * s, lado * 0.09 * s, 1.76 * s, 0.25 * s));
    return [principal(fusionar([base, cuerpo, ...brazos])), fijo(cabeza, COLOR.piel), fijo(fusionar(ojos), COLOR.negro)];
  },

  bandera() {
    const base = caja(0.9, PH, 0.9, 0, 0, 0, 0.06);
    const asta = cilindro(0.06, 4.25, 0, PH, 0, 10);
    const punta = esfera(0.1, 0, PH + 4.3, 0);
    const tela = caja(1.1, 0.7, 0.05, 0.06 + 0.55, 3.85, 0, 0.02);
    return [fijo(fusionar([base, asta, punta]), COLOR.gris), principal(tela)];
  },

  escalera(def) {
    const partes = [];
    for (let k = 0; k < def.fondo; k++) {
      const alto = Math.min(def.alto, (k + 1) * 3) * PH;
      const z = -def.fondo / 2 + 0.5 + k;
      partes.push(caja(def.ancho - HOLGURA, alto - 0.01, 1 - HOLGURA / 2, 0, 0, z, 0.03));
      for (let i = 0; i < def.ancho; i++) partes.push(cilindro(ESPIGA_R, ESPIGA_H, i - def.ancho / 2 + 0.5, alto, z));
    }
    return [principal(fusionar(partes))];
  },

  arco(def) {
    const W = def.ancho - HOLGURA;
    const H = def.alto * PH - 0.01;
    const a = W / 2 - 0.6; // medio ancho del hueco
    const arranque = 0.6;
    const s = new THREE.Shape();
    s.moveTo(-W / 2, 0);
    s.lineTo(-a, 0);
    s.lineTo(-a, arranque);
    s.absarc(0, arranque, a, Math.PI, 0, true);
    s.lineTo(a, 0);
    s.lineTo(W / 2, 0);
    s.lineTo(W / 2, H);
    s.lineTo(-W / 2, H);
    s.closePath();
    const prof = def.fondo - HOLGURA;
    const g = new THREE.ExtrudeGeometry(s, { depth: prof, bevelEnabled: false, curveSegments: 24 });
    g.translate(0, 0, -prof / 2);
    return [principal(fusionar([g, ...espigas(def.ancho, def.fondo, H)]))];
  },

  cara(def) {
    const h = def.alto * PH;
    const cuerpo = fusionar([caja(def.ancho - HOLGURA, h - 0.01, def.fondo - HOLGURA), ...espigas(def.ancho, def.fondo, h)]);
    const zf = def.fondo / 2 - HOLGURA / 2;
    const ojos = [-1, 1].map((l) => esfera(0.2, l * 0.45, 0.78, zf, 1, 1, 0.35));
    const pupilas = [-1, 1].map((l) => esfera(0.09, l * 0.45, 0.76, zf + 0.07, 1, 1, 0.5));
    const sonrisa = new THREE.TorusGeometry(0.36, 0.05, 8, 28, Math.PI);
    sonrisa.rotateZ(Math.PI);
    sonrisa.translate(0, 0.52, zf + 0.01);
    return [principal(cuerpo), fijo(fusionar(ojos), COLOR.blanco), fijo(fusionar([...pupilas, sonrisa]), COLOR.negro)];
  },

  interrogacion() {
    const base = caja(0.9, PH, 0.9, 0, 0, 0, 0.06);
    const punto = esfera(0.11, 0, 0.62, 0);
    const tallo = cilindro(0.085, 0.38, 0, 0.78, 0, 12);
    const gancho = new THREE.TorusGeometry(0.3, 0.085, 10, 36, 1.5 * Math.PI + 0.35);
    gancho.rotateZ(-Math.PI / 2);
    gancho.translate(0, 1.46, 0);
    return [principal(fusionar([base, punto, tallo, gancho]))];
  },
};

const cache = new Map();

/** Partes (geometrías compartidas) de una definición de pieza. */
export function partesDe(def) {
  let partes = cache.get(def.id);
  if (!partes) {
    const crear = FORMAS[def.forma] ?? FORMAS.ladrillo;
    partes = crear(def);
    cache.set(def.id, partes);
  }
  return partes;
}

export const FORMAS_DISPONIBLES = Object.keys(FORMAS);
