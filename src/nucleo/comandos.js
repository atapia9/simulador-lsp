// Patrón comando para deshacer y rehacer.
// Cada comando sabe hacer() y deshacer() sobre el modelo.

import { LIMITE_HISTORIAL } from './constantes.js';

export class Historial {
  constructor(limite = LIMITE_HISTORIAL) {
    this.limite = limite;
    this._pasado = [];
    this._futuro = [];
    this._oyentes = new Set();
  }

  on(fn) {
    this._oyentes.add(fn);
    return () => this._oyentes.delete(fn);
  }

  _avisar() {
    for (const fn of this._oyentes) fn(this);
  }

  /** Ejecuta el comando. Si falla, no se guarda y se devuelve el error. */
  ejecutar(cmd) {
    try {
      const resultado = cmd.hacer();
      this._pasado.push(cmd);
      if (this._pasado.length > this.limite) this._pasado.shift();
      this._futuro = [];
      this._avisar();
      return { ok: true, resultado };
    } catch (error) {
      return { ok: false, error };
    }
  }

  deshacer() {
    const cmd = this._pasado.pop();
    if (!cmd) return false;
    cmd.deshacer();
    this._futuro.push(cmd);
    this._avisar();
    return true;
  }

  rehacer() {
    const cmd = this._futuro.pop();
    if (!cmd) return false;
    cmd.hacer();
    this._pasado.push(cmd);
    this._avisar();
    return true;
  }

  get puedeDeshacer() {
    return this._pasado.length > 0;
  }

  get puedeRehacer() {
    return this._futuro.length > 0;
  }

  get pasos() {
    return this._pasado.length;
  }

  limpiar() {
    this._pasado = [];
    this._futuro = [];
    this._avisar();
  }
}

export function cmdAgregar(modelo, datos) {
  let id = datos.id;
  return {
    nombre: 'agregar',
    hacer() {
      const p = modelo.agregar({ ...datos, id });
      id = p.id;
      return p;
    },
    deshacer() {
      modelo.quitar(id);
    },
  };
}

export function cmdQuitar(modelo, id) {
  let copia = null;
  return {
    nombre: 'quitar',
    hacer() {
      copia = modelo.quitar(id);
      if (!copia) throw new Error(`No existe la pieza ${id}`);
      return copia;
    },
    deshacer() {
      modelo.agregar(copia);
    },
  };
}

export function cmdActualizar(modelo, id, cambios) {
  let antes = null;
  return {
    nombre: 'actualizar',
    hacer() {
      const r = modelo.actualizar(id, cambios);
      antes = r.antes;
      return r;
    },
    deshacer() {
      modelo.actualizar(id, antes);
    },
  };
}

/** Reemplaza todas las piezas (sirve para "limpiar todo" y para cargar). */
export function cmdReemplazar(modelo, piezasNuevas) {
  let anteriores = null;
  return {
    nombre: 'reemplazar',
    hacer() {
      anteriores = modelo.lista();
      return modelo.cargar(piezasNuevas);
    },
    deshacer() {
      modelo.cargar(anteriores);
    },
  };
}
