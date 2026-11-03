// Huella de una pieza: qué celdas ocupa según su rotación.
// La posición (x, y, z) es la esquina mínima de la caja que ocupa la pieza.

/** Lleva cualquier entero a 0, 1, 2 o 3 (cuartos de vuelta). */
export function normalizarRotacion(rot) {
  const r = Math.trunc(Number(rot) || 0);
  return ((r % 4) + 4) % 4;
}

/** Ancho y fondo de la pieza ya girada. En 90° y 270° se intercambian. */
export function huella(def, rot = 0) {
  return normalizarRotacion(rot) % 2 === 0
    ? { ancho: def.ancho, fondo: def.fondo }
    : { ancho: def.fondo, fondo: def.ancho };
}

/** Lista de celdas {x, y, z} que ocupa la pieza. */
export function celdasDe(def, pos) {
  const { ancho, fondo } = huella(def, pos.rot);
  const celdas = [];
  for (let dy = 0; dy < def.alto; dy++) {
    for (let dz = 0; dz < fondo; dz++) {
      for (let dx = 0; dx < ancho; dx++) {
        celdas.push({ x: pos.x + dx, y: pos.y + dy, z: pos.z + dz });
      }
    }
  }
  return celdas;
}

/** Celdas de la base de la pieza (solo la primera capa). */
export function celdasBase(def, pos) {
  const { ancho, fondo } = huella(def, pos.rot);
  const celdas = [];
  for (let dz = 0; dz < fondo; dz++) {
    for (let dx = 0; dx < ancho; dx++) celdas.push({ x: pos.x + dx, z: pos.z + dz });
  }
  return celdas;
}

/**
 * Convierte la celda bajo el cursor en la esquina de la pieza, para que el
 * cursor quede más o menos al centro de la huella.
 */
export function anclaDesdeCursor(def, rot, cx, cz) {
  const { ancho, fondo } = huella(def, rot);
  return { x: cx - Math.floor((ancho - 1) / 2), z: cz - Math.floor((fondo - 1) / 2) };
}
