// Mallas 3D de las piezas: materiales, vista previa ("fantasma") y posición.

import * as THREE from 'three';
import { partesDe, PH } from './formas.js';
import { huella } from '../nucleo/huella.js';
import { ANCHO_BASE, FONDO_BASE } from '../nucleo/constantes.js';

const materiales = new Map();

/** Material compartido por color (y transparencia). */
export function material(color, transparente = false) {
  const clave = `${color}|${transparente}`;
  let m = materiales.get(clave);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: transparente ? 0.15 : 0.42,
      metalness: 0,
      transparent: transparente,
      opacity: transparente ? 0.55 : 1,
      depthWrite: !transparente,
    });
    materiales.set(clave, m);
  }
  return m;
}

/** Crea el grupo 3D de una pieza. */
export function crearMallaPieza(def, pieza) {
  const grupo = new THREE.Group();
  for (const parte of partesDe(def)) {
    const esPrincipal = parte.rol === 'principal';
    const transp = esPrincipal ? !!def.transparente : !!parte.transparente;
    const malla = new THREE.Mesh(parte.geo, material(esPrincipal ? pieza.color : parte.color, transp));
    malla.castShadow = !transp;
    malla.receiveShadow = true;
    malla.userData = { piezaId: pieza.id, rol: parte.rol };
    grupo.add(malla);
  }
  grupo.userData.piezaId = pieza.id;
  posicionar(grupo, def, pieza);
  return grupo;
}

export function recolorear(grupo, def, color) {
  for (const malla of grupo.children) {
    if (malla.userData.rol === 'principal') malla.material = material(color, !!def.transparente);
  }
}

/** Coloca el grupo según la posición en la rejilla. */
export function posicionar(grupo, def, { x, y, z, rot }) {
  const h = huella(def, rot);
  grupo.position.set(x + h.ancho / 2 - ANCHO_BASE / 2, y * PH, z + h.fondo / 2 - FONDO_BASE / 2);
  grupo.rotation.y = -rot * (Math.PI / 2);
}

const fantasmaValido = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.45, depthWrite: false });
const fantasmaInvalido = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.45, depthWrite: false });

export function crearFantasma(def) {
  const grupo = new THREE.Group();
  for (const parte of partesDe(def)) {
    const m = new THREE.Mesh(parte.geo, fantasmaValido);
    m.renderOrder = 5;
    grupo.add(m);
  }
  return grupo;
}

export function marcarFantasma(grupo, valido) {
  const mat = valido ? fantasmaValido : fantasmaInvalido;
  for (const m of grupo.children) m.material = mat;
}

/** Caja de líneas que marca la pieza seleccionada. */
export function crearMarcoSeleccion(def, pieza, color = 0xffb703) {
  const h = huella(def, pieza.rot);
  const caja = new THREE.BoxGeometry(h.ancho + 0.12, def.alto * PH + 0.12, h.fondo + 0.12);
  const lineas = new THREE.LineSegments(new THREE.EdgesGeometry(caja), new THREE.LineBasicMaterial({ color, depthTest: false }));
  caja.dispose();
  lineas.renderOrder = 6;
  lineas.position.set(pieza.x + h.ancho / 2 - ANCHO_BASE / 2, pieza.y * PH + (def.alto * PH) / 2, pieza.z + h.fondo / 2 - FONDO_BASE / 2);
  return lineas;
}
