// Mensajes cortos (toasts) anunciados a lectores de pantalla.

import { h } from './dom.js';

let zona = null;

export function iniciarAvisos(contenedor) {
  zona = h('div', { class: 'avisos', role: 'status', 'aria-live': 'polite' });
  contenedor.append(zona);
}

/** tipo: 'info' | 'error' | 'exito' */
export function avisar(texto, tipo = 'info', ms = 3500) {
  if (!zona) return;
  const el = h('div', { class: `aviso aviso-${tipo}` }, texto);
  zona.append(el);
  while (zona.children.length > 3) zona.firstElementChild.remove();
  setTimeout(() => {
    el.classList.add('saliendo');
    setTimeout(() => el.remove(), 300);
  }, ms);
}
