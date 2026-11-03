// Diálogos modales accesibles con <dialog> nativo (foco atrapado y Esc incluidos).

import { h } from './dom.js';
import { icono } from './iconos.js';
import { T } from '../i18n/es.js';

let contador = 0;

/**
 * Abre un diálogo. Devuelve { dialogo, cerrar, cuerpo, pie }.
 * Al cerrarse se elimina del DOM y llama alCerrar(valor).
 */
export function abrirDialogo({ titulo, clase = '', alCerrar, contenido = [], acciones = [] }) {
  const id = `dlg-titulo-${++contador}`;
  const cuerpo = h('div', { class: 'dialogo-cuerpo' }, contenido);
  const pie = acciones.length ? h('div', { class: 'dialogo-pie' }, acciones) : null;
  const dialogo = h(
    'dialog',
    { class: `dialogo ${clase}`, 'aria-labelledby': id },
    h(
      'div',
      { class: 'dialogo-cabecera' },
      h('h2', { id, text: titulo }),
      h('button', {
        type: 'button',
        class: 'boton-icono',
        'aria-label': T.dialogo.cerrar,
        title: T.dialogo.cerrar,
        html: icono('cerrar'),
        onClick: () => cerrar(null),
      }),
    ),
    cuerpo,
    pie,
  );
  let valor = null;
  function cerrar(v) {
    valor = v;
    if (dialogo.open) dialogo.close();
  }
  dialogo.addEventListener('close', () => {
    dialogo.remove();
    alCerrar?.(valor);
  });
  dialogo.addEventListener('click', (e) => {
    if (e.target === dialogo) cerrar(null); // clic fuera del contenido
  });
  document.body.append(dialogo);
  dialogo.showModal();
  return { dialogo, cerrar, cuerpo, pie };
}

export function confirmar({ titulo, texto, aceptar = T.dialogo.aceptar, peligro = false }) {
  return new Promise((resolver) => {
    const bAceptar = h('button', { type: 'button', class: peligro ? 'boton peligro' : 'boton primario', text: aceptar });
    const bCancelar = h('button', { type: 'button', class: 'boton', text: T.dialogo.cancelar });
    const d = abrirDialogo({
      titulo,
      clase: 'dialogo-chico',
      contenido: [h('p', { text: texto })],
      acciones: [bCancelar, bAceptar],
      alCerrar: (v) => resolver(v === true),
    });
    bAceptar.addEventListener('click', () => d.cerrar(true));
    bCancelar.addEventListener('click', () => d.cerrar(false));
    bCancelar.focus();
  });
}

/** Pide un texto corto. Devuelve el texto (puede ser '') o null si se canceló. */
export function pedirTexto({ titulo, ayuda, etiqueta, valor = '', max = 200, multilinea = false }) {
  return new Promise((resolver) => {
    const idCampo = `campo-${++contador}`;
    const campo = multilinea
      ? h('textarea', { id: idCampo, maxlength: max, rows: 3 })
      : h('input', { id: idCampo, type: 'text', maxlength: max, autocomplete: 'off' });
    campo.value = valor;
    const form = h(
      'form',
      { method: 'dialog', class: 'formulario' },
      ayuda ? h('p', { class: 'ayuda', text: ayuda }) : null,
      h('label', { for: idCampo, text: etiqueta }),
      campo,
    );
    const bGuardar = h('button', { type: 'button', class: 'boton primario', text: T.dialogo.guardar });
    const bCancelar = h('button', { type: 'button', class: 'boton', text: T.dialogo.cancelar });
    const d = abrirDialogo({
      titulo,
      clase: 'dialogo-chico',
      contenido: [form],
      acciones: [bCancelar, bGuardar],
      alCerrar: (v) => resolver(v),
    });
    const enviar = () => d.cerrar(campo.value.trim());
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      enviar();
    });
    if (multilinea) campo.addEventListener('keydown', (e) => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && enviar());
    bGuardar.addEventListener('click', enviar);
    bCancelar.addEventListener('click', () => d.cerrar(null));
    campo.focus();
    campo.select?.();
  });
}

export function mostrarErrores(titulo, errores) {
  const d = abrirDialogo({
    titulo,
    clase: 'dialogo-chico',
    contenido: [h('ul', { class: 'lista-errores' }, errores.map((e) => h('li', { text: e })))],
    acciones: [h('button', { type: 'button', class: 'boton primario', text: T.dialogo.aceptar, onClick: () => d.cerrar(null) })],
  });
}
