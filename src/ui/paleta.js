// Paleta: categorías como pestañas, botones de piezas y muestras de color.

import { h } from './dom.js';
import { T } from '../i18n/es.js';
import { CATEGORIAS, PIEZAS } from '../data/piezas.js';
import { COLORES, nombreColor } from '../data/colores.js';

export class Paleta {
  constructor(contenedor, constructor) {
    this.constructor_ = constructor;
    this.categoria = CATEGORIAS[0];
    this._botonesPieza = new Map();
    this._botonesColor = new Map();
    this._miniaturas = new Map();

    this.pestanas = h('div', { class: 'categorias', role: 'tablist', 'aria-label': T.paleta.titulo });
    this.panel = h('div', { class: 'piezas', role: 'tabpanel', id: 'panel-piezas', tabindex: '-1' });
    this._botonesCat = CATEGORIAS.map((cat, i) => {
      const b = h('button', {
        type: 'button',
        role: 'tab',
        class: 'categoria',
        id: `tab-${cat}`,
        'aria-controls': 'panel-piezas',
        title: T.paleta.categoria(i + 1, T.categorias[cat]),
        onClick: () => this.mostrarCategoria(cat),
        onKeydown: (e) => this._teclaPestanas(e, i),
      }, h('span', { class: 'tecla', 'aria-hidden': 'true', text: String(i + 1) }), T.categorias[cat]);
      this.pestanas.append(b);
      return b;
    });

    const colores = h('div', { class: 'colores', role: 'group', 'aria-label': T.paleta.colores });
    for (const c of COLORES) {
      const b = h('button', {
        type: 'button',
        class: 'muestra',
        style: `--muestra:${c.hex}`,
        'aria-label': c.nombre,
        title: c.nombre,
        'aria-pressed': 'false',
        onClick: () => constructor.elegirColor(c.hex),
      });
      this._botonesColor.set(c.hex, b);
      colores.append(b);
    }
    this.etiquetaColor = h('p', { class: 'color-actual', 'aria-live': 'polite' });

    contenedor.append(
      h('h2', { class: 'titulo-seccion', text: T.paleta.titulo }),
      this.pestanas,
      this.panel,
      h('h2', { class: 'titulo-seccion', text: T.paleta.colores }),
      colores,
      this.etiquetaColor,
    );

    this.mostrarCategoria(this.categoria, false);
    constructor.on(() => this.actualizar());
    this.actualizar();
  }

  _teclaPestanas(e, i) {
    const n = CATEGORIAS.length;
    let j = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
    if (e.key === 'Home') j = 0;
    if (e.key === 'End') j = n - 1;
    if (j === null) return;
    e.preventDefault();
    this.mostrarCategoria(CATEGORIAS[j]);
  }

  /** Muestra una categoría. enfocar = mover el foco a su pestaña. */
  mostrarCategoria(cat, enfocar = true) {
    this.categoria = cat;
    this._botonesCat.forEach((b, i) => {
      const activa = CATEGORIAS[i] === cat;
      b.setAttribute('aria-selected', String(activa));
      b.tabIndex = activa ? 0 : -1;
      if (activa && enfocar) b.focus();
    });
    this.panel.setAttribute('aria-labelledby', `tab-${cat}`);
    this.panel.replaceChildren();
    this._botonesPieza.clear();
    for (const def of PIEZAS.filter((p) => p.categoria === cat)) {
      const mini = this._miniaturas.get(def.id);
      const b = h(
        'button',
        {
          type: 'button',
          class: 'pieza',
          'aria-pressed': 'false',
          'aria-label': T.paleta.elegir(def.nombre),
          title: def.nombre,
          dataset: { tipo: def.id },
          onClick: () => this.constructor_.elegirTipo(def.id),
        },
        mini ? h('img', { src: mini, alt: '', width: 64, height: 64, draggable: 'false' }) : h('span', { class: 'mini-vacia', 'aria-hidden': 'true' }),
        h('span', { class: 'nombre', text: def.nombre }),
      );
      this._botonesPieza.set(def.id, b);
      this.panel.append(b);
    }
    this.actualizar();
  }

  ponerMiniaturas(mapa) {
    this._miniaturas = mapa;
    this.mostrarCategoria(this.categoria, false);
  }

  actualizar() {
    const c = this.constructor_;
    const activo = c.modo === 'colocar' ? c.tipo : null;
    for (const [tipo, b] of this._botonesPieza) b.setAttribute('aria-pressed', String(tipo === activo));
    for (const [hex, b] of this._botonesColor) b.setAttribute('aria-pressed', String(hex.toLowerCase() === String(c.color).toLowerCase()));
    this.etiquetaColor.textContent = T.paleta.colorActual(nombreColor(c.color));
  }
}
