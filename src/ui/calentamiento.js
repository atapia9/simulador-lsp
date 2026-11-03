// Diálogo de ejercicios de calentamiento, cada uno con su temporizador.

import { h } from './dom.js';
import { abrirDialogo } from './dialogos.js';
import { avisar } from './avisos.js';
import { T } from '../i18n/es.js';
import { EJERCICIOS } from '../data/calentamiento.js';
import { crearVistaTemporizador } from '../taller/vista-temporizador.js';

export function abrirCalentamiento() {
  const t = T.calentamiento;
  const vistas = [];
  const tarjetas = EJERCICIOS.map((ej) => {
    const v = crearVistaTemporizador({
      minutos: ej.minutos,
      textos: { ...t, progreso: ej.titulo, terminado: T.taller.construccion.terminado },
      conSonido: () => true,
      alTerminar: () => avisar(`${ej.titulo}: ${T.taller.construccion.terminado}`, 'exito', 5000),
    });
    vistas.push(v);
    return h(
      'article',
      { class: 'tarjeta-ejercicio', 'aria-labelledby': `ej-${ej.id}` },
      h('h3', { id: `ej-${ej.id}` }, ej.titulo, ' ', h('span', { class: 'etiqueta-min', text: t.minutos(ej.minutos) })),
      h('p', { text: ej.descripcion }),
      v.elemento,
    );
  });
  abrirDialogo({
    titulo: t.titulo,
    clase: 'dialogo-ancho',
    contenido: [h('p', { class: 'intro', text: t.intro }), h('div', { class: 'rejilla-ejercicios' }, tarjetas)],
    alCerrar: () => vistas.forEach((v) => v.detener()),
  });
}
