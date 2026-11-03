// Rejilla de ocupación en unidades de placa. Guarda qué pieza ocupa cada celda.

import { ANCHO_BASE, FONDO_BASE, ALTO_MAX } from './constantes.js';

export class Rejilla {
  constructor(ancho = ANCHO_BASE, fondo = FONDO_BASE, alto = ALTO_MAX) {
    this.ancho = ancho;
    this.fondo = fondo;
    this.alto = alto;
    this._celdas = new Map(); // índice → id de pieza
    this._porPieza = new Map(); // id → lista de índices
  }

  _indice(x, y, z) {
    return (y * this.fondo + z) * this.ancho + x;
  }

  dentro({ x, y, z }) {
    return x >= 0 && x < this.ancho && z >= 0 && z < this.fondo && y >= 0 && y < this.alto;
  }

  /** Id de la pieza en la celda, o null si está libre o fuera. */
  ocupante(x, y, z) {
    if (!this.dentro({ x, y, z })) return null;
    return this._celdas.get(this._indice(x, y, z)) ?? null;
  }

  /** true si todas las celdas están dentro y libres (o son de ignorarId). */
  estaLibre(celdas, ignorarId = null) {
    for (const c of celdas) {
      if (!this.dentro(c)) return false;
      const id = this._celdas.get(this._indice(c.x, c.y, c.z));
      if (id !== undefined && id !== ignorarId) return false;
    }
    return true;
  }

  ocupar(id, celdas) {
    if (this._porPieza.has(id)) throw new Error(`La pieza ${id} ya está en la rejilla`);
    if (!this.estaLibre(celdas)) throw new Error(`Las celdas de la pieza ${id} no están libres`);
    const indices = celdas.map((c) => this._indice(c.x, c.y, c.z));
    for (const i of indices) this._celdas.set(i, id);
    this._porPieza.set(id, indices);
  }

  liberar(id) {
    const indices = this._porPieza.get(id);
    if (!indices) return false;
    for (const i of indices) this._celdas.delete(i);
    this._porPieza.delete(id);
    return true;
  }

  vaciar() {
    this._celdas.clear();
    this._porPieza.clear();
  }

  /** Altura (en placas) del tope de la columna x,z, ignorando una pieza. */
  topeColumna(x, z, ignorarId = null) {
    for (let y = this.alto - 1; y >= 0; y--) {
      const id = this._celdas.get(this._indice(x, y, z));
      if (id !== undefined && id !== ignorarId) return y + 1;
    }
    return 0;
  }

  get celdasOcupadas() {
    return this._celdas.size;
  }

  get piezas() {
    return this._porPieza.size;
  }
}
