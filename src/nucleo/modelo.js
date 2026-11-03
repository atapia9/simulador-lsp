// Modelo: las piezas colocadas y su rejilla de ocupación. Sin Three.js.

import { Rejilla } from './rejilla.js';
import { celdasDe, normalizarRotacion } from './huella.js';
import { validarColocacion } from './colocacion.js';

export class ErrorColocacion extends Error {
  constructor(motivo) {
    super(`No se puede colocar la pieza: ${motivo}`);
    this.motivo = motivo;
  }
}

const CAMPOS = ['tipo', 'x', 'y', 'z', 'rot', 'color', 'significado'];

function copiar(p) {
  return { id: p.id, tipo: p.tipo, x: p.x, y: p.y, z: p.z, rot: p.rot, color: p.color, significado: p.significado };
}

export class Modelo {
  /** @param {Map<string, object>} catalogo id de tipo → definición */
  constructor(catalogo, rejilla = new Rejilla()) {
    this.catalogo = catalogo;
    this.rejilla = rejilla;
    this._piezas = new Map();
    this._siguienteId = 1;
    this._oyentes = new Set();
  }

  /** Suscribe una función a los cambios. Devuelve la función para desuscribir. */
  on(fn) {
    this._oyentes.add(fn);
    return () => this._oyentes.delete(fn);
  }

  _emitir(tipo, pieza = null) {
    for (const fn of this._oyentes) fn({ tipo, pieza: pieza ? copiar(pieza) : null });
  }

  def(tipo) {
    const d = this.catalogo.get(tipo);
    if (!d) throw new ErrorColocacion('tipo');
    return d;
  }

  get cantidad() {
    return this._piezas.size;
  }

  obtener(id) {
    const p = this._piezas.get(id);
    return p ? copiar(p) : null;
  }

  lista() {
    return [...this._piezas.values()].map(copiar);
  }

  validar(datos, ignorarId = null) {
    const def = this.catalogo.get(datos.tipo);
    if (!def) return { valida: false, motivo: 'tipo' };
    return validarColocacion(this.rejilla, def, { ...datos, rot: normalizarRotacion(datos.rot) }, ignorarId);
  }

  _normalizar(datos) {
    return {
      tipo: datos.tipo,
      x: datos.x,
      y: datos.y,
      z: datos.z,
      rot: normalizarRotacion(datos.rot),
      color: datos.color,
      significado: typeof datos.significado === 'string' ? datos.significado : '',
    };
  }

  /** Agrega una pieza. Lanza ErrorColocacion si no cabe. */
  agregar(datos, { silencioso = false } = {}) {
    const p = this._normalizar(datos);
    const v = this.validar(p);
    if (!v.valida) throw new ErrorColocacion(v.motivo);
    const id = datos.id ?? this._siguienteId;
    if (this._piezas.has(id)) throw new Error(`Ya existe la pieza ${id}`);
    this._siguienteId = Math.max(this._siguienteId, id + 1);
    const pieza = { id, ...p };
    this.rejilla.ocupar(id, celdasDe(this.def(p.tipo), pieza));
    this._piezas.set(id, pieza);
    if (!silencioso) this._emitir('agregar', pieza);
    return copiar(pieza);
  }

  /** Quita una pieza y devuelve una copia de cómo estaba. */
  quitar(id) {
    const p = this._piezas.get(id);
    if (!p) return null;
    this.rejilla.liberar(id);
    this._piezas.delete(id);
    this._emitir('quitar', p);
    return copiar(p);
  }

  /**
   * Cambia campos de una pieza (posición, rotación, color, significado).
   * Devuelve {antes, despues} con solo los campos que cambiaron.
   */
  actualizar(id, cambios) {
    const actual = this._piezas.get(id);
    if (!actual) throw new Error(`No existe la pieza ${id}`);
    const nueva = this._normalizar({ ...actual, ...cambios });
    const cambiaLugar = ['tipo', 'x', 'y', 'z', 'rot'].some((k) => nueva[k] !== actual[k]);
    if (cambiaLugar) {
      const v = this.validar(nueva, id);
      if (!v.valida) throw new ErrorColocacion(v.motivo);
      this.rejilla.liberar(id);
      this.rejilla.ocupar(id, celdasDe(this.def(nueva.tipo), nueva));
    }
    const antes = {};
    const despues = {};
    for (const k of CAMPOS) {
      if (nueva[k] !== actual[k]) {
        antes[k] = actual[k];
        despues[k] = nueva[k];
      }
    }
    Object.assign(actual, nueva);
    this._emitir('actualizar', actual);
    return { antes, despues };
  }

  vaciar() {
    this._piezas.clear();
    this.rejilla.vaciar();
    this._emitir('vaciar');
  }

  /**
   * Reemplaza todo el contenido. Las piezas que no caben se omiten.
   * @returns {{cargadas: number, omitidas: number}}
   */
  cargar(piezas) {
    this._piezas.clear();
    this.rejilla.vaciar();
    this._siguienteId = 1;
    let omitidas = 0;
    for (const p of piezas) {
      try {
        this.agregar(p, { silencioso: true });
      } catch {
        omitidas++;
      }
    }
    this._emitir('cargar');
    return { cargadas: this._piezas.size, omitidas };
  }
}
