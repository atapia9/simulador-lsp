// Recorrido guiado de 6 pasos, sin librerías externas.

import { h } from './dom.js';
import { T } from '../i18n/es.js';

/**
 * @param {Array<string>} selectores  elemento a resaltar en cada paso
 */
export function iniciarTour(selectores, { alTerminar } = {}) {
  const pasos = T.tour.pasos;
  let i = 0;
  const previo = document.activeElement;

  const foco = h('div', { class: 'tour-foco', 'aria-hidden': 'true' });
  const titulo = h('h2', { id: 'tour-titulo' });
  const texto = h('p', { id: 'tour-texto' });
  const contador = h('span', { class: 'tour-contador' });
  const bAnterior = h('button', { type: 'button', class: 'boton', text: T.tour.anterior });
  const bSiguiente = h('button', { type: 'button', class: 'boton primario' });
  const bSaltar = h('button', { type: 'button', class: 'boton-texto', text: T.tour.saltar });
  const burbuja = h(
    'div',
    { class: 'tour-burbuja', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'tour-titulo', 'aria-describedby': 'tour-texto', tabindex: '-1' },
    titulo,
    texto,
    h('div', { class: 'tour-pie' }, contador, bSaltar, bAnterior, bSiguiente),
  );
  const capa = h('div', { class: 'tour-capa' }, foco, burbuja);
  document.body.append(capa);

  function posicionar() {
    const el = document.querySelector(selectores[i]);
    const r = el && el.getClientRects().length ? el.getBoundingClientRect() : null;
    const m = 6;
    if (r) {
      Object.assign(foco.style, { display: 'block', left: `${r.left - m}px`, top: `${r.top - m}px`, width: `${r.width + 2 * m}px`, height: `${r.height + 2 * m}px` });
    } else foco.style.display = 'none';
    const bw = burbuja.offsetWidth;
    const bh = burbuja.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left;
    let top;
    if (!r) {
      left = (vw - bw) / 2;
      top = (vh - bh) / 2;
    } else if (r.right + bw + 24 < vw) {
      left = r.right + 16;
      top = r.top;
    } else if (r.left - bw - 24 > 0) {
      left = r.left - bw - 16;
      top = r.top;
    } else if (r.bottom + bh + 24 < vh) {
      left = r.left + r.width / 2 - bw / 2;
      top = r.bottom + 16;
    } else {
      left = r.left + r.width / 2 - bw / 2;
      top = r.top - bh - 16;
    }
    burbuja.style.left = `${Math.max(12, Math.min(vw - bw - 12, left))}px`;
    burbuja.style.top = `${Math.max(12, Math.min(vh - bh - 12, top))}px`;
  }

  function pintar() {
    titulo.textContent = pasos[i].titulo;
    texto.textContent = pasos[i].texto;
    contador.textContent = T.tour.paso(i + 1, pasos.length);
    bAnterior.disabled = i === 0;
    bSiguiente.textContent = i === pasos.length - 1 ? T.tour.terminar : T.tour.siguiente;
    posicionar();
    burbuja.focus();
  }

  function cerrar() {
    window.removeEventListener('resize', posicionar);
    document.removeEventListener('keydown', teclas, true);
    capa.remove();
    previo?.focus?.();
    alTerminar?.();
  }

  function teclas(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cerrar();
    } else if (e.key === 'ArrowRight') {
      e.stopPropagation();
      bSiguiente.click();
    } else if (e.key === 'ArrowLeft') {
      e.stopPropagation();
      if (i > 0) bAnterior.click();
    } else if (e.key === 'Tab') {
      // Mantener el foco dentro de la burbuja.
      const f = [...burbuja.querySelectorAll('button:not([disabled])')];
      const idx = f.indexOf(document.activeElement);
      e.preventDefault();
      const sig = e.shiftKey ? (idx <= 0 ? f.length - 1 : idx - 1) : (idx + 1) % f.length;
      f[sig].focus();
    } else {
      e.stopPropagation();
    }
  }

  bAnterior.addEventListener('click', () => {
    i = Math.max(0, i - 1);
    pintar();
  });
  bSiguiente.addEventListener('click', () => {
    if (i === pasos.length - 1) return cerrar();
    i++;
    pintar();
  });
  bSaltar.addEventListener('click', cerrar);
  window.addEventListener('resize', posicionar);
  document.addEventListener('keydown', teclas, true);
  pintar();
}
