// Diálogo de galería: guardar, cargar, eliminar, importar y exportar.

import { h, descargar, nombreArchivo } from './dom.js';
import { icono } from './iconos.js';
import { abrirDialogo, confirmar } from './dialogos.js';
import { avisar } from './avisos.js';
import { T } from '../i18n/es.js';
import { listarModelos, guardarModelo, eliminarModelo } from '../nucleo/galeria.js';

const fmtFecha = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

/**
 * @param {object} app  { almacen, documentoSerializado(), cargarDatos(datos), exportarJSON(), importarJSON(), exportarPNG(), copiarEnlace() }
 */
export function abrirGaleria(app) {
  const t = T.galeria;
  const lista = h('ul', { class: 'lista-galeria' });

  const campo = h('input', { id: 'galeria-nombre', type: 'text', maxlength: 80, placeholder: t.nombrePlaceholder, autocomplete: 'off' });
  campo.value = app.documento.nombre || '';
  const form = h(
    'form',
    { class: 'fila-campo' },
    campo,
    h('button', { type: 'submit', class: 'boton primario', html: icono('guardar') + `<span>${t.guardar}</span>` }),
  );
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = campo.value.trim() || t.sinNombre;
    app.documento.nombre = nombre;
    const r = guardarModelo(app.almacen, app.documentoSerializado());
    if (r.ok) {
      avisar(T.avisos.guardado(nombre), 'exito');
      app.alCambiarDoc();
      pintar();
    } else avisar(T.avisos.almacenLleno, 'error', 6000);
  });

  function pintar() {
    const modelos = listarModelos(app.almacen);
    lista.replaceChildren();
    if (!modelos.length) lista.append(h('li', { class: 'vacio', text: t.vacia }));
    for (const m of modelos) {
      const nombre = m.datos.nombre || t.sinNombre;
      lista.append(
        h(
          'li',
          {},
          h(
            'div',
            { class: 'info' },
            h('strong', { text: nombre }),
            h('span', { class: 'meta', text: `${fmtFecha.format(new Date(m.fecha))} · ${t.piezas(m.datos.piezas?.length ?? 0)}` }),
            m.datos.pregunta ? h('span', { class: 'meta pregunta', text: m.datos.pregunta }) : null,
          ),
          h(
            'div',
            { class: 'acciones' },
            h('button', {
              type: 'button',
              class: 'boton-mini primario',
              text: t.cargar,
              onClick: async () => {
                if (!(await confirmar({ titulo: T.dialogo.confirmarCargarTitulo, texto: T.dialogo.confirmarCargar, aceptar: t.cargar }))) return;
                app.cargarDatos(m.datos);
                avisar(T.avisos.cargado(nombre), 'exito');
                d.cerrar(null);
              },
            }),
            h('button', {
              type: 'button',
              class: 'boton-mini',
              text: t.exportar,
              onClick: () => {
                descargar(new Blob([JSON.stringify(m.datos, null, 2)], { type: 'application/json' }), nombreArchivo(nombre, 'json'));
                avisar(T.avisos.exportado);
              },
            }),
            h('button', {
              type: 'button',
              class: 'boton-mini peligro',
              text: t.eliminar,
              'aria-label': `${t.eliminar}: ${nombre}`,
              onClick: async () => {
                if (!(await confirmar({ titulo: T.dialogo.confirmarEliminarTitulo, texto: T.dialogo.confirmarEliminar(nombre), aceptar: t.eliminar, peligro: true }))) return;
                eliminarModelo(app.almacen, m.id);
                pintar();
              },
            }),
          ),
        ),
      );
    }
  }

  const archivo = (ic, texto, fn) => h('button', { type: 'button', class: 'boton', html: icono(ic) + `<span>${texto}</span>`, onClick: fn });

  const d = abrirDialogo({
    titulo: t.titulo,
    clase: 'dialogo-ancho',
    contenido: [
      !app.almacen.disponible ? h('p', { class: 'alerta', text: t.sinAlmacen }) : null,
      h('section', {}, h('h3', {}, h('label', { for: 'galeria-nombre', text: t.guardarTitulo })), form),
      h('section', {}, h('h3', { text: t.guardados }), lista),
      h(
        'section',
        {},
        h('h3', { text: t.archivos }),
        h(
          'div',
          { class: 'rejilla-archivos' },
          archivo('descargar', t.exportarActual, () => app.exportarJSON()),
          archivo('subir', t.importar, () => app.importarJSON(() => d.cerrar(null))),
          archivo('imagen', t.png, () => app.exportarPNG()),
          archivo('enlace', t.enlace, () => app.copiarEnlace()),
        ),
        h('p', { class: 'ayuda', text: t.enlaceAyuda }),
      ),
    ],
  });
  pintar();
  campo.focus();
}
