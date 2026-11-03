// Controlador del constructor: modos (seleccionar, colocar, mover), puntero,
// teclado y acciones sobre piezas. Une el modelo puro con la escena 3D.

import { T } from '../i18n/es.js';
import { anclaDesdeCursor } from '../nucleo/huella.js';
import { alturaApoyo } from '../nucleo/colocacion.js';
import { cmdAgregar, cmdQuitar, cmdActualizar, cmdReemplazar } from '../nucleo/comandos.js';
import { ANCHO_BASE, FONDO_BASE } from '../nucleo/constantes.js';
import { avisar } from './avisos.js';
import { confirmar, pedirTexto } from './dialogos.js';

const UMBRAL_CLIC = 6; // píxeles; más que esto es arrastrar la cámara

export class Constructor {
  constructor({ escena, modelo, historial, catalogo, colorInicial }) {
    this.escena = escena;
    this.modelo = modelo;
    this.historial = historial;
    this.catalogo = catalogo;

    this.modo = 'seleccion'; // 'seleccion' | 'colocar' | 'mover'
    this.tipo = null;
    this.rot = 0;
    this.color = colorInicial;
    this.seleccion = null;
    this.moverId = null;
    this._objetivo = null;
    this._cursor = { cx: ANCHO_BASE / 2, cz: FONDO_BASE / 2 };
    this._oyentes = new Set();
    /** Si se define, un clic sobre una pieza (en modo selección) la llama en vez de seleccionar. */
    this.alClicPieza = null;

    this._conectarPuntero();
  }

  on(fn) {
    this._oyentes.add(fn);
    return () => this._oyentes.delete(fn);
  }

  _avisar() {
    for (const fn of this._oyentes) fn(this);
  }

  get defActual() {
    return this.tipo ? this.catalogo.get(this.tipo) : null;
  }

  /** Texto de estado para la barra inferior. */
  textoEstado() {
    if (this.modo === 'colocar') return T.estado.colocar(this.defActual.nombre);
    if (this.modo === 'mover') return T.estado.mover(this.defActual.nombre);
    if (this.alClicPieza) return T.estado.compartir;
    if (this.seleccion != null) {
      const p = this.modelo.obtener(this.seleccion);
      if (p) return T.estado.seleccionada(this.catalogo.get(p.tipo).nombre);
    }
    return T.estado.seleccion;
  }

  // ---------- Modos ----------

  elegirTipo(tipo) {
    if (this.modo === 'mover') this._terminarMover();
    const def = this.catalogo.get(tipo);
    if (!def) return;
    this.tipo = tipo;
    if (def.color) this.color = def.color;
    this.modo = 'colocar';
    this.seleccionar(null, false);
    this._avisar();
  }

  /** Esc: termina la acción actual y vuelve a selección. */
  cancelar() {
    if (this.modo === 'mover') this._terminarMover();
    else if (this.modo === 'colocar') this.modo = 'seleccion';
    else this.seleccionar(null, false);
    this.tipo = this.modo === 'seleccion' ? null : this.tipo;
    this.escena.ocultarFantasma();
    this._objetivo = null;
    this._avisar();
  }

  seleccionar(id, notificar = true) {
    this.seleccion = id;
    this.escena.seleccionar(id);
    if (notificar) this._avisar();
  }

  _terminarMover() {
    if (this.moverId != null) this.escena.ocultarPieza(this.moverId, false);
    this.moverId = null;
    this.modo = 'seleccion';
    this.tipo = null;
    this.escena.ocultarFantasma();
  }

  _piezaSeleccionada() {
    const p = this.seleccion != null ? this.modelo.obtener(this.seleccion) : null;
    if (!p) avisar(T.avisos.seleccionaPrimero);
    return p;
  }

  // ---------- Acciones ----------

  rotar() {
    if (this.modo === 'colocar' || this.modo === 'mover') {
      this.rot = (this.rot + 1) % 4;
      this._refrescarFantasma();
      return;
    }
    const p = this._piezaSeleccionada();
    if (!p) return;
    const r = this.historial.ejecutar(cmdActualizar(this.modelo, p.id, { rot: (p.rot + 1) % 4 }));
    if (!r.ok) avisar(T.avisos.noCabeGiro, 'error');
  }

  mover() {
    const p = this._piezaSeleccionada();
    if (!p) return;
    this.modo = 'mover';
    this.moverId = p.id;
    this.tipo = p.tipo;
    this.rot = p.rot;
    this.escena.ocultarPieza(p.id, true);
    this._cursor = { cx: p.x, cz: p.z };
    this._avisar();
    this._refrescarFantasma();
  }

  duplicar() {
    const p = this._piezaSeleccionada();
    if (!p) return;
    this.tipo = p.tipo;
    this.rot = p.rot;
    this.color = p.color;
    this.modo = 'colocar';
    this.seleccionar(null, false);
    this._avisar();
  }

  eliminar() {
    const p = this._piezaSeleccionada();
    if (!p) return;
    const r = this.historial.ejecutar(cmdQuitar(this.modelo, p.id));
    if (r.ok) {
      this.seleccionar(null);
      avisar(T.avisos.eliminada);
    }
  }

  elegirColor(hex) {
    this.color = hex;
    if (this.modo === 'seleccion' && this.seleccion != null) {
      const p = this.modelo.obtener(this.seleccion);
      if (p && p.color !== hex) this.historial.ejecutar(cmdActualizar(this.modelo, p.id, { color: hex }));
    }
    this._avisar();
  }

  async editarSignificado(id = this.seleccion) {
    const p = id != null ? this.modelo.obtener(id) : null;
    if (!p) return avisar(T.avisos.seleccionaPrimero);
    const texto = await pedirTexto({
      titulo: `${T.dialogo.significadoTitulo}: ${this.catalogo.get(p.tipo).nombre}`,
      ayuda: T.dialogo.significadoAyuda,
      etiqueta: T.dialogo.significadoEtiqueta,
      valor: p.significado,
      max: 200,
    });
    if (texto === null || texto === p.significado) return;
    this.historial.ejecutar(cmdActualizar(this.modelo, p.id, { significado: texto }));
  }

  deshacer() {
    if (this.modo === 'mover') this._terminarMover();
    if (this.historial.deshacer()) avisar(T.avisos.deshecho);
    else avisar(T.avisos.sinDeshacer);
    this._validarSeleccion();
  }

  rehacer() {
    if (this.historial.rehacer()) avisar(T.avisos.rehecho);
    else avisar(T.avisos.sinRehacer);
    this._validarSeleccion();
  }

  _validarSeleccion() {
    if (this.seleccion != null && !this.modelo.obtener(this.seleccion)) this.seleccionar(null);
    this._avisar();
  }

  async limpiar() {
    if (this.modelo.cantidad === 0) return;
    const ok = await confirmar({
      titulo: T.dialogo.confirmarLimpiarTitulo,
      texto: T.dialogo.confirmarLimpiar,
      aceptar: T.herramientas.limpiar,
      peligro: true,
    });
    if (!ok) return;
    this.cancelar();
    this.historial.ejecutar(cmdReemplazar(this.modelo, []));
    this.seleccionar(null);
    avisar(T.avisos.limpio);
  }

  // ---------- Objetivo de colocación ----------

  _calcular(sup) {
    const def = this.defActual;
    if (!def || !sup) return null;
    const ignorar = this.modo === 'mover' ? this.moverId : null;
    const { x, z } = anclaDesdeCursor(def, this.rot, sup.cx, sup.cz);
    const probar = (y) => {
      const pos = { x, y, z, rot: this.rot };
      return { pos, ...this.modelo.validar({ tipo: def.id, ...pos }, ignorar) };
    };
    if (sup.tipo === 'base') return probar(0);
    const otra = this.modelo.obtener(sup.id);
    const defOtra = this.catalogo.get(otra.tipo);
    if (sup.tipo === 'arriba') return probar(otra.y + defOtra.alto);
    // Al lado: a la misma altura si se apoya; si no, sobre lo que haya debajo.
    const mismo = probar(otra.y);
    if (mismo.valida) return mismo;
    const abajo = probar(alturaApoyo(this.modelo.rejilla, def, { x, z, rot: this.rot }, ignorar));
    return abajo.valida ? abajo : mismo;
  }

  _mostrar(obj) {
    this._objetivo = obj;
    if (!obj) return this.escena.ocultarFantasma();
    this.escena.mostrarFantasma(this.defActual, obj.pos, obj.valida);
  }

  _refrescarFantasma() {
    if (this.modo === 'seleccion') return this._mostrar(null);
    if (this._ultimoPuntero) {
      this._ultimaSup = this.escena.superficieEn(this._ultimoPuntero.x, this._ultimoPuntero.y);
      this._mostrar(this._calcular(this._ultimaSup));
    } else this._desdeCursorTeclado();
  }

  _desdeCursorTeclado() {
    const def = this.defActual;
    if (!def) return;
    const ignorar = this.modo === 'mover' ? this.moverId : null;
    const { x, z } = anclaDesdeCursor(def, this.rot, this._cursor.cx, this._cursor.cz);
    const y = alturaApoyo(this.modelo.rejilla, def, { x, z, rot: this.rot }, ignorar);
    const pos = { x, y, z, rot: this.rot };
    this._ultimaSup = null;
    this._ultimoPuntero = null;
    this._mostrar({ pos, ...this.modelo.validar({ tipo: def.id, ...pos }, ignorar) });
  }

  /** Coloca (o suelta, si se está moviendo) en el objetivo actual. */
  confirmar() {
    const obj = this._objetivo;
    if (!obj) return;
    if (!obj.valida) {
      avisar(T.avisos[obj.motivo] ?? T.avisos.choque, 'error', 2200);
      return;
    }
    if (this.modo === 'colocar') {
      this.historial.ejecutar(cmdAgregar(this.modelo, { tipo: this.tipo, ...obj.pos, color: this.color, significado: '' }));
    } else if (this.modo === 'mover') {
      const id = this.moverId;
      this.historial.ejecutar(cmdActualizar(this.modelo, id, obj.pos));
      this._terminarMover();
      this.seleccionar(id);
    }
    this._refrescarFantasma();
  }

  // ---------- Puntero ----------

  _conectarPuntero() {
    const c = this.escena.canvas;
    const activos = new Map();
    let inicio = null;
    let multitoque = false;

    c.addEventListener('pointerdown', (e) => {
      activos.set(e.pointerId, e);
      if (activos.size > 1) multitoque = true;
      if (activos.size === 1) {
        multitoque = false;
        inicio = { x: e.clientX, y: e.clientY };
      }
      if (e.pointerType !== 'mouse' && this.modo !== 'seleccion') this._moverPuntero(e);
    });

    c.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse' && activos.size === 0) this._moverPuntero(e);
    });

    const soltar = (e) => {
      const habia = activos.has(e.pointerId);
      activos.delete(e.pointerId);
      if (!habia || !inicio || multitoque) return;
      if (e.type === 'pointercancel' || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const d = Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y);
      inicio = null;
      if (d <= UMBRAL_CLIC) this._clic(e);
    };
    c.addEventListener('pointerup', soltar);
    c.addEventListener('pointercancel', soltar);
    c.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' && activos.size === 0 && this.modo !== 'seleccion') {
        this._ultimaSup = null;
        this._ultimoPuntero = null;
        this.escena.ocultarFantasma();
        this._objetivo = null;
      }
    });
  }

  _moverPuntero(e) {
    if (this.modo === 'seleccion') return;
    this._ultimoPuntero = { x: e.clientX, y: e.clientY };
    this._ultimaSup = this.escena.superficieEn(e.clientX, e.clientY);
    if (this._ultimaSup) this._cursor = { cx: this._ultimaSup.cx, cz: this._ultimaSup.cz };
    this._mostrar(this._calcular(this._ultimaSup));
  }

  _clic(e) {
    if (this.modo === 'seleccion') {
      const id = this.escena.piezaEn(e.clientX, e.clientY);
      if (id != null && this.alClicPieza) {
        this.seleccionar(id);
        this.alClicPieza(id);
        return;
      }
      this.seleccionar(id);
      return;
    }
    this._moverPuntero(e);
    this.confirmar();
  }

  // ---------- Teclado sobre el lienzo ----------

  /** Flechas mueven la vista previa; Enter coloca. Devuelve true si usó la tecla. */
  teclaLienzo(e) {
    if (this.modo === 'seleccion') return false;
    const pasos = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (pasos[e.key]) {
      const [dx, dz] = pasos[e.key];
      this._cursor = {
        cx: Math.min(ANCHO_BASE - 1, Math.max(0, this._cursor.cx + dx)),
        cz: Math.min(FONDO_BASE - 1, Math.max(0, this._cursor.cz + dz)),
      };
      this._desdeCursorTeclado();
      return true;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      if (!this._objetivo) this._desdeCursorTeclado();
      this.confirmar();
      return true;
    }
    return false;
  }

  /** Se llama cuando el lienzo recibe el foco con el teclado. */
  enfocarLienzo() {
    if (this.modo !== 'seleccion' && !this._objetivo) this._desdeCursorTeclado();
  }
}
