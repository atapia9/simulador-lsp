// Reglas para decidir si una pieza se puede colocar en una posición.

import { celdasDe, celdasBase, huella } from './huella.js';

/**
 * Valida la colocación.
 * @returns {{valida: boolean, motivo: null|'fuera'|'muyAlto'|'choque'|'sinApoyo'}}
 */
export function validarColocacion(rejilla, def, pos, ignorarId = null) {
  const { ancho, fondo } = huella(def, pos.rot);
  if (pos.x < 0 || pos.z < 0 || pos.x + ancho > rejilla.ancho || pos.z + fondo > rejilla.fondo || pos.y < 0) {
    return { valida: false, motivo: 'fuera' };
  }
  if (pos.y + def.alto > rejilla.alto) return { valida: false, motivo: 'muyAlto' };
  if (!rejilla.estaLibre(celdasDe(def, pos), ignorarId)) return { valida: false, motivo: 'choque' };
  if (!tieneApoyo(rejilla, def, pos, ignorarId)) return { valida: false, motivo: 'sinApoyo' };
  return { valida: true, motivo: null };
}

/** Una pieza se apoya si está en la base (y = 0) o si hay otra pieza justo debajo. */
export function tieneApoyo(rejilla, def, pos, ignorarId = null) {
  if (pos.y === 0) return true;
  return celdasBase(def, pos).some((c) => {
    const id = rejilla.ocupante(c.x, pos.y - 1, c.z);
    return id !== null && id !== ignorarId;
  });
}

/** Altura más baja donde la pieza queda encima de todo lo que hay en su huella. */
export function alturaApoyo(rejilla, def, pos, ignorarId = null) {
  let y = 0;
  for (const c of celdasBase(def, pos)) {
    if (c.x < 0 || c.z < 0 || c.x >= rejilla.ancho || c.z >= rejilla.fondo) continue;
    y = Math.max(y, rejilla.topeColumna(c.x, c.z, ignorarId));
  }
  return y;
}
