// Modo Taller: guía de 4 pasos (Reto, Construcción, Compartir, Reflexión).

import { h } from '../ui/dom.js';
import { icono } from '../ui/iconos.js';
import { avisar } from '../ui/avisos.js';
import { T } from '../i18n/es.js';
import { PREGUNTAS } from '../data/preguntas.js';
import { limitarMinutos, MIN_MINUTOS, MAX_MINUTOS } from './temporizador.js';
import { crearVistaTemporizador } from './vista-temporizador.js';

/** Lista numerada de piezas con significado (mismo orden que los marcadores 3D). */
export function numerarSignificados(piezas) {
  return piezas
    .filter((p) => p.significado)
    .sort((a, b) => a.id - b.id)
    .map((p, i) => ({ id: p.id, numero: i + 1, texto: p.significado, tipo: p.tipo }));
}

/** Texto plano con el resumen de la sesión. */
export function textoResumen(doc, significados, catalogo) {
  const t = T.taller.reflexion;
  const lineas = [
    `${t.pregunta}: ${doc.pregunta || t.vacio}`,
    '',
    `${t.historia}: ${doc.historia || t.vacio}`,
    '',
    `${t.significados}:`,
    ...(significados.length ? significados.map((s) => `  ${s.numero}. ${catalogo.get(s.tipo).nombre}: ${s.texto}`) : [`  ${t.vacio}`]),
  ];
  if (doc.reflexion) lineas.push('', `${t.notas}:`, doc.reflexion);
  return lineas.join('\n');
}

export class Taller {
  constructor({ contenedor, documento, alCambiarDoc, modelo, constructor, catalogo, almacen, guardarEnGaleria, alternarPresentacion, alCerrar }) {
    Object.assign(this, { contenedor, documento, alCambiarDoc, modelo, constructor, catalogo, almacen, guardarEnGaleria, alternarPresentacion, alCerrar });
    const pref = almacen.leer('taller', {}) || {};
    this.paso = Number.isInteger(pref.paso) && pref.paso >= 0 && pref.paso < 4 ? pref.paso : 0;
    this.minutos = limitarMinutos(pref.minutos ?? 7);
    this.sonido = pref.sonido !== false;
    this.abierto = false;

    this.temporizador = crearVistaTemporizador({
      minutos: this.minutos,
      grande: true,
      textos: { ...T.taller.construccion, progreso: T.taller.construccion.progreso },
      conSonido: () => this.sonido,
      alTerminar: () => avisar(T.avisos.tiempo, 'exito', 6000),
    });

    this._construir();
    modelo.on(() => {
      if (this.abierto && (this.paso === 2 || this.paso === 3)) this._pintarPaso();
    });
  }

  _guardarPref() {
    this.almacen.escribir('taller', { paso: this.paso, minutos: this.minutos, sonido: this.sonido });
  }

  _construir() {
    this.stepper = h('ol', { class: 'stepper' });
    T.taller.pasos.forEach((nombre, i) => {
      this.stepper.append(
        h('li', {}, h('button', { type: 'button', class: 'paso', onClick: () => this.irA(i) }, h('span', { class: 'num', text: String(i + 1) }), h('span', { class: 'txt', text: nombre }))),
      );
    });
    this.cuerpo = h('div', { class: 'taller-cuerpo', tabindex: '-1' });
    this.bAnterior = h('button', { type: 'button', class: 'boton', text: T.taller.anterior, onClick: () => this.irA(this.paso - 1) });
    this.bSiguiente = h('button', { type: 'button', class: 'boton primario', text: T.taller.siguiente, onClick: () => this.irA(this.paso + 1) });
    this.indicador = h('span', { class: 'indicador', 'aria-live': 'polite' });

    this.contenedor.append(
      h(
        'div',
        { class: 'taller-cabecera' },
        h('h2', { id: 'titulo-taller', text: T.taller.titulo }),
        h('button', {
          type: 'button',
          class: 'boton-icono',
          'aria-label': T.barra.presentacion,
          title: T.barra.presentacionAyuda,
          html: icono('presentacion'),
          onClick: () => this.alternarPresentacion(),
        }),
        h('button', { type: 'button', class: 'boton-icono', 'aria-label': T.taller.cerrar, title: T.taller.cerrar, html: icono('cerrar'), onClick: () => this.alCerrar() }),
      ),
      h('nav', { 'aria-label': T.taller.titulo }, this.stepper),
      this.cuerpo,
      h('div', { class: 'taller-pie' }, this.bAnterior, this.indicador, this.bSiguiente),
    );
    this.contenedor.setAttribute('aria-labelledby', 'titulo-taller');
  }

  abrir() {
    this.abierto = true;
    this._pintarPaso();
    this._activarClicPieza();
  }

  cerrar() {
    this.abierto = false;
    this._activarClicPieza();
  }

  irA(i) {
    if (i >= 4) {
      this.alCerrar();
      return;
    }
    this.paso = Math.max(0, Math.min(3, i));
    this._guardarPref();
    this._pintarPaso();
    this._activarClicPieza();
    this.cuerpo.focus({ preventScroll: true });
  }

  _activarClicPieza() {
    const activo = this.abierto && this.paso === 2;
    this.constructor.alClicPieza = activo ? (id) => this.constructor.editarSignificado(id) : null;
    if (activo && this.constructor.modo !== 'seleccion') this.constructor.cancelar();
    this.constructor._avisar();
  }

  _pintarPaso() {
    [...this.stepper.querySelectorAll('.paso')].forEach((b, i) => {
      b.classList.toggle('hecho', i < this.paso);
      if (i === this.paso) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
    this.bAnterior.disabled = this.paso === 0;
    this.bSiguiente.textContent = this.paso === 3 ? T.taller.terminar : T.taller.siguiente;
    this.indicador.textContent = T.taller.pasoDe(this.paso + 1, 4);
    const pintores = [this._reto, this._construccion, this._compartir, this._reflexion];
    // Conserva el foco si se está escribiendo en un campo de este panel.
    const activo = document.activeElement;
    const idActivo = this.cuerpo.contains(activo) ? activo.id : null;
    this.cuerpo.replaceChildren(...pintores[this.paso].call(this));
    if (idActivo) document.getElementById(idActivo)?.focus();
  }

  _area(id, etiqueta, campo, placeholder, filas = 4) {
    const ta = h('textarea', { id, rows: filas, placeholder, maxlength: 5000 });
    ta.value = this.documento[campo] || '';
    ta.addEventListener('input', () => {
      this.documento[campo] = ta.value;
      this.alCambiarDoc();
    });
    return [h('label', { for: id, class: 'etiqueta', text: etiqueta }), ta];
  }

  _reto() {
    const t = T.taller.reto;
    const [lbl, ta] = this._area('taller-pregunta', t.etiqueta, 'pregunta', t.placeholder, 3);
    const sel = h('select', { id: 'taller-ejemplos' }, h('option', { value: '', text: t.elige }));
    for (const g of PREGUNTAS) {
      sel.append(h('optgroup', { label: g.grupo }, g.preguntas.map((q) => h('option', { value: q, text: q }))));
    }
    const usar = h('button', {
      type: 'button',
      class: 'boton',
      text: t.usar,
      onClick: () => {
        if (!sel.value) return sel.focus();
        ta.value = sel.value;
        this.documento.pregunta = sel.value;
        this.alCambiarDoc();
        ta.focus();
      },
    });
    return [
      h('p', { class: 'intro', text: t.intro }),
      lbl,
      ta,
      h('label', { for: 'taller-ejemplos', class: 'etiqueta', text: t.ejemplos }),
      h('div', { class: 'fila-campo' }, sel, usar),
      h('p', { class: 'consejo', text: t.consejo }),
    ];
  }

  _construccion() {
    const t = T.taller.construccion;
    const rango = h('input', { type: 'range', id: 'taller-minutos', min: MIN_MINUTOS, max: MAX_MINUTOS, step: 1, value: this.minutos });
    const numero = h('output', { for: 'taller-minutos', class: 'valor', text: String(this.minutos) });
    rango.addEventListener('input', () => {
      this.minutos = limitarMinutos(rango.value);
      numero.textContent = String(this.minutos);
      this.temporizador.cambiarMinutos(this.minutos);
      this._guardarPref();
    });
    const sonido = h('input', { type: 'checkbox', id: 'taller-sonido', checked: this.sonido });
    sonido.addEventListener('change', () => {
      this.sonido = sonido.checked;
      this._guardarPref();
    });
    return [
      h('p', { class: 'intro', text: t.intro }),
      h('div', { class: 'recordatorio' }, h('strong', { text: t.recordatorio }), ' ', this.documento.pregunta || t.sinPregunta),
      h('label', { for: 'taller-minutos', class: 'etiqueta' }, `${t.minutos}: `, numero),
      rango,
      this.temporizador.elemento,
      h('label', { class: 'casilla', for: 'taller-sonido' }, sonido, t.sonido),
    ];
  }

  _compartir() {
    const t = T.taller.compartir;
    const [lbl, ta] = this._area('taller-historia', t.historia, 'historia', t.historiaPlaceholder, 5);
    const lista = numerarSignificados(this.modelo.lista());
    const ul = h('ol', { class: 'significados' });
    if (!lista.length) ul.append(h('li', { class: 'vacio', text: t.sinSignificados }));
    for (const s of lista) {
      ul.append(
        h(
          'li',
          {},
          h('button', {
            type: 'button',
            class: 'pin-num',
            text: String(s.numero),
            'aria-label': t.ir(s.numero),
            title: t.ir(s.numero),
            onClick: () => this.constructor.seleccionar(s.id),
          }),
          h('div', { class: 'sig-texto' }, h('strong', { text: this.catalogo.get(s.tipo).nombre }), h('span', { text: s.texto })),
          h('button', { type: 'button', class: 'boton-mini', text: t.editar, onClick: () => this.constructor.editarSignificado(s.id) }),
        ),
      );
    }
    return [
      h('p', { class: 'intro', text: t.intro }),
      lbl,
      ta,
      h('p', { class: 'instruccion' }, h('span', { html: icono('significado') }), t.instruccion),
      h('h3', { text: t.significados }),
      ul,
    ];
  }

  _reflexion() {
    const t = T.taller.reflexion;
    const [lbl, ta] = this._area('taller-notas', t.notas, 'reflexion', t.notasPlaceholder, 4);
    const sig = numerarSignificados(this.modelo.lista());
    const resumen = h(
      'div',
      { class: 'resumen' },
      h('h3', { text: t.resumen }),
      h('dl', {}, h('dt', { text: t.pregunta }), h('dd', { text: this.documento.pregunta || t.vacio }), h('dt', { text: t.historia }), h('dd', { text: this.documento.historia || t.vacio }), h('dt', { text: t.significados })),
      sig.length
        ? h('ol', { class: 'resumen-sig' }, sig.map((s) => h('li', {}, h('strong', { text: `${this.catalogo.get(s.tipo).nombre}: ` }), s.texto)))
        : h('p', { text: t.vacio }),
    );
    const copiar = h('button', {
      type: 'button',
      class: 'boton',
      html: icono('copiar') + `<span>${t.copiar}</span>`,
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(textoResumen(this.documento, sig, this.catalogo));
          avisar(T.avisos.copiado, 'exito');
        } catch {
          avisar(T.avisos.noCopiado, 'error');
        }
      },
    });
    const guardar = h('button', { type: 'button', class: 'boton primario', html: icono('guardar') + `<span>${t.guardar}</span>`, onClick: () => this.guardarEnGaleria() });
    return [
      h('p', { class: 'intro', text: t.intro }),
      h('ul', { class: 'preguntas-reflexion' }, t.preguntas.map((q) => h('li', { text: q }))),
      lbl,
      ta,
      resumen,
      h('div', { class: 'fila-botones' }, copiar, guardar),
    ];
  }
}
