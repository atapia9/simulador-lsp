// Punto de entrada: arma la interfaz y conecta modelo, escena y paneles.

import './estilos.css';
import { T } from './i18n/es.js';
import { CATALOGO, PIEZAS, CATEGORIAS } from './data/piezas.js';
import { COLOR_INICIAL } from './data/colores.js';
import { DEMO } from './data/demo.js';
import { Modelo } from './nucleo/modelo.js';
import { Historial } from './nucleo/comandos.js';
import { crearAlmacen } from './nucleo/almacen.js';
import { serializar, parsearModelo, validarModelo, codificarEnlace, decodificarEnlace } from './nucleo/serializacion.js';
import { Escena, hayWebGL, generarMiniaturas } from './escena/escena.js';
import { Constructor } from './ui/constructor.js';
import { Paleta } from './ui/paleta.js';
import { h, escribiendo, descargar, nombreArchivo } from './ui/dom.js';
import { icono } from './ui/iconos.js';
import { iniciarAvisos, avisar } from './ui/avisos.js';
import { abrirDialogo, mostrarErrores, confirmar, pedirTexto } from './ui/dialogos.js';
import { crearTema, coloresEscena } from './ui/tema.js';
import { Taller, numerarSignificados } from './taller/taller.js';
import { abrirCalentamiento } from './ui/calentamiento.js';
import { abrirGaleria } from './ui/galeria.js';
import { iniciarTour } from './ui/tour.js';

const MAX_ARCHIVO = 2 * 1024 * 1024;

const raiz = document.getElementById('app');
const almacen = crearAlmacen();
const reducirMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Botones ----------

function boton(ic, etiqueta, alClic, { texto = false, titulo = etiqueta, clase = 'boton-barra', id, extra = '' } = {}) {
  return h('button', {
    type: 'button',
    class: extra ? `${clase} ${extra}` : clase,
    id,
    'aria-label': etiqueta,
    title: titulo,
    html: icono(ic) + (texto ? `<span class="texto">${etiqueta}</span>` : ''),
    onClick: alClic,
  });
}

// ---------- Estructura de la página ----------

const acciones = {}; // se llena más abajo; los botones llaman por nombre

const bTaller = boton('taller', T.barra.taller, () => acciones.alternarTaller(), { texto: true, titulo: T.barra.tallerAyuda, id: 'b-taller' });
bTaller.setAttribute('aria-expanded', 'false');
bTaller.setAttribute('aria-controls', 'panel-taller');
const bTema = boton('luna', T.barra.temaOscuro, () => acciones.alternarTema(), { id: 'b-tema' });
const bAyuda = boton('ayuda', T.barra.atajos, () => acciones.atajos(), { id: 'b-ayuda' });

const encabezado = h(
  'header',
  { class: 'encabezado' },
  h(
    'div',
    { class: 'marca' },
    h('img', { src: `${import.meta.env.BASE_URL}favicon.svg`, alt: '', width: 32, height: 32 }),
    h('div', {}, h('h1', { text: T.app.nombre }), h('p', { class: 'lema', text: T.app.lema })),
  ),
  h(
    'nav',
    { class: 'acciones-principales', 'aria-label': T.app.nombre },
    bTaller,
    boton('reloj', T.barra.calentamiento, () => abrirCalentamiento(), { texto: true, titulo: T.barra.calentamientoAyuda, id: 'b-calentamiento' }),
    boton('galeria', T.barra.galeria, () => acciones.galeria(), { texto: true, titulo: T.barra.galeriaAyuda, id: 'b-galeria' }),
    boton('demo', T.barra.demo, () => acciones.demo(), { texto: true, titulo: T.barra.demoAyuda, id: 'b-demo' }),
    boton('recorrido', T.barra.recorrido, () => acciones.tour(), { titulo: T.barra.recorridoAyuda, extra: 'solo-amplio' }),
    boton('presentacion', T.barra.presentacion, () => acciones.alternarPresentacion(), { titulo: T.barra.presentacionAyuda, extra: 'solo-amplio' }),
    bTema,
    bAyuda,
  ),
);

const paletaEl = h('aside', { class: 'paleta', id: 'paleta', 'aria-label': T.paleta.titulo });
const lienzo = h('div', { class: 'lienzo', id: 'lienzo' });
const panelTaller = h('aside', { class: 'panel-taller', id: 'panel-taller', hidden: true });

const bDeshacer = boton('deshacer', T.herramientas.deshacer, () => constructor.deshacer());
const bRehacer = boton('rehacer', T.herramientas.rehacer, () => constructor.rehacer());
const bSeleccionar = boton('seleccionar', T.herramientas.seleccionar, () => constructor.cancelar());
const bRotar = boton('rotar', T.herramientas.rotar, () => constructor.rotar());
const bMover = boton('mover', T.herramientas.mover, () => constructor.mover());
const bDuplicar = boton('duplicar', T.herramientas.duplicar, () => constructor.duplicar());
const bSignificado = boton('significado', T.herramientas.significado, () => constructor.editarSignificado());
const bEliminar = boton('eliminar', T.herramientas.eliminar, () => constructor.eliminar());
const bVista = boton('vista', T.herramientas.restablecerVista, () => escena.restablecerVista());
const bLimpiar = boton('limpiar', T.herramientas.limpiar, () => constructor.limpiar());
const separador = () => h('span', { class: 'separador', 'aria-hidden': 'true' });
const herramientas = h(
  'div',
  { class: 'herramientas', role: 'toolbar', 'aria-label': T.herramientas.grupo, id: 'herramientas' },
  bSeleccionar,
  separador(),
  bDeshacer,
  bRehacer,
  separador(),
  bRotar,
  bMover,
  bDuplicar,
  bSignificado,
  bEliminar,
  separador(),
  bVista,
  bLimpiar,
);

const textoEstado = h('p', { class: 'estado-texto', 'aria-live': 'polite' });
const contador = h('p', { class: 'contador', 'aria-live': 'polite' });
const retoGrande = h('div', { class: 'reto-grande', 'aria-live': 'polite' });
const bSalirPresentacion = h('button', {
  type: 'button',
  class: 'boton salir-presentacion',
  html: icono('cerrar') + `<span>${T.barra.salirPresentacion}</span>`,
  onClick: () => acciones.salirPresentacion(),
});
const bienvenida = h('div', { class: 'bienvenida', role: 'region', 'aria-label': T.bienvenida.titulo, hidden: true });
const avisoMovil = h('div', { class: 'aviso-movil', role: 'note', hidden: true });

const area = h(
  'section',
  { class: 'area', 'aria-label': T.app.nombre },
  lienzo,
  retoGrande,
  bienvenida,
  herramientas,
  h('div', { class: 'estado' }, textoEstado, contador),
  bSalirPresentacion,
);

const pie = h(
  'footer',
  { class: 'pie' },
  h('p', {}, T.pie.aviso, h('a', { href: T.pie.licenciaUrl, rel: 'license noopener', target: '_blank', text: T.pie.licencia }), '. ', T.pie.privacidad),
);

raiz.replaceChildren(
  h('a', { class: 'saltar', href: '#lienzo', text: T.app.saltar }),
  encabezado,
  avisoMovil,
  h('main', { class: 'principal' }, paletaEl, area, panelTaller),
  pie,
);
iniciarAvisos(document.body);

// ---------- Tema ----------

let escena = null;
const tema = crearTema(almacen, (t) => {
  bTema.innerHTML = icono(t === 'oscuro' ? 'sol' : 'luna');
  const et = t === 'oscuro' ? T.barra.temaClaro : T.barra.temaOscuro;
  bTema.setAttribute('aria-label', et);
  bTema.title = et;
  escena?.establecerColores(coloresEscena());
});
acciones.alternarTema = () => tema.alternar();

// ---------- Sin WebGL no hay simulador ----------

if (!hayWebGL()) {
  lienzo.append(h('div', { class: 'sin-webgl', role: 'alert', text: T.app.sinWebGL }));
  throw new Error('WebGL no disponible');
}

// ---------- Núcleo y escena ----------

const documento = { nombre: '', pregunta: '', historia: '', reflexion: '' };
const modelo = new Modelo(CATALOGO);
const historial = new Historial(100);
escena = new Escena(lienzo, { catalogo: CATALOGO, reducirMovimiento, etiqueta: T.estado.seleccion });
escena.establecerColores(coloresEscena());
const constructor = new Constructor({ escena, modelo, historial, catalogo: CATALOGO, colorInicial: COLOR_INICIAL });
const paleta = new Paleta(paletaEl, constructor);

const documentoSerializado = () => serializar({ ...documento, piezas: modelo.lista() });

let temporizadorAuto = null;
function guardarAuto() {
  clearTimeout(temporizadorAuto);
  temporizadorAuto = setTimeout(() => almacen.escribir('actual', documentoSerializado()), 400);
}

function alCambiarDoc() {
  retoGrande.textContent = documento.pregunta;
  guardarAuto();
}

modelo.on((ev) => {
  if (ev.tipo === 'agregar') escena.agregarPieza(ev.pieza);
  else if (ev.tipo === 'quitar') escena.quitarPieza(ev.pieza.id);
  else if (ev.tipo === 'actualizar') escena.actualizarPieza(ev.pieza);
  else escena.sincronizar(modelo.lista());
  contador.textContent = T.herramientas.contador(modelo.cantidad);
  escena.actualizarPines(numerarSignificados(modelo.lista()));
  guardarAuto();
});

historial.on(() => {
  bDeshacer.disabled = !historial.puedeDeshacer;
  bRehacer.disabled = !historial.puedeRehacer;
});

let lienzoConFoco = false;
function pintarEstado() {
  const c = constructor;
  let txt = c.textoEstado();
  if (lienzoConFoco && c.modo !== 'seleccion') txt += ' ' + T.estado.tecladoCursor;
  textoEstado.textContent = txt;
  escena.canvas.setAttribute('aria-label', txt);
  const haySel = c.modo === 'seleccion' && c.seleccion != null;
  bSeleccionar.setAttribute('aria-pressed', String(c.modo === 'seleccion'));
  bRotar.disabled = !(haySel || c.modo !== 'seleccion');
  for (const b of [bMover, bDuplicar, bSignificado, bEliminar]) b.disabled = !haySel;
}
constructor.on(pintarEstado);
escena.canvas.addEventListener('focus', () => {
  lienzoConFoco = true;
  constructor.enfocarLienzo();
  pintarEstado();
});
escena.canvas.addEventListener('blur', () => {
  lienzoConFoco = false;
  pintarEstado();
});

// ---------- Cargar y guardar documentos ----------

function cargarDatos(datos) {
  documento.nombre = datos.nombre || '';
  documento.pregunta = datos.pregunta || '';
  documento.historia = datos.historia || '';
  documento.reflexion = datos.reflexion || '';
  constructor.cancelar();
  constructor.seleccionar(null);
  const r = modelo.cargar(datos.piezas || []);
  historial.limpiar();
  if (r.omitidas) avisar(T.avisos.omitidas(r.omitidas), 'error', 6000);
  if (taller.abierto) taller._pintarPaso();
  alCambiarDoc();
  return r;
}

function cargarDemo() {
  cargarDatos(structuredClone(DEMO));
}

acciones.demo = async () => {
  if (modelo.cantidad > 0 && !(await confirmar({ titulo: T.dialogo.confirmarCargarTitulo, texto: T.dialogo.confirmarCargar, aceptar: T.barra.demo }))) return;
  cargarDemo();
  avisar(T.avisos.demoCargada, 'exito');
};

function guardarEnGaleria() {
  acciones.galeria();
}

const appGaleria = {
  almacen,
  documento,
  documentoSerializado,
  alCambiarDoc,
  cargarDatos,
  exportarJSON() {
    const datos = documentoSerializado();
    descargar(new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' }), nombreArchivo(documento.nombre || 'modelo', 'json'));
    avisar(T.avisos.exportado);
  },
  importarJSON(alListo) {
    const input = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
    input.addEventListener('change', async () => {
      const f = input.files?.[0];
      input.remove();
      if (!f) return;
      if (f.size > MAX_ARCHIVO) return mostrarErrores(T.errores.titulo, [T.errores.archivoGrande]);
      let texto;
      try {
        texto = await f.text();
      } catch {
        return mostrarErrores(T.errores.titulo, [T.errores.lectura]);
      }
      const r = parsearModelo(texto, CATALOGO);
      if (!r.ok) return mostrarErrores(T.errores.titulo, r.errores);
      if (modelo.cantidad > 0 && !(await confirmar({ titulo: T.dialogo.confirmarCargarTitulo, texto: T.dialogo.confirmarCargar }))) return;
      cargarDatos(r.datos);
      avisar(T.avisos.importado, 'exito');
      alListo?.();
    });
    document.body.append(input);
    input.click();
  },
  exportarPNG() {
    constructor.seleccionar(null);
    escena.ocultarFantasma();
    descargar(escena.capturaPNG(), nombreArchivo(documento.nombre || 'modelo', 'png'));
    avisar(T.avisos.exportado);
  },
  async copiarEnlace() {
    const codigo = codificarEnlace({ ...documento, piezas: modelo.lista() });
    if (!codigo) return avisar(T.avisos.enlaceGrande, 'error', 6000);
    const url = `${location.origin}${location.pathname}#m=${codigo}`;
    try {
      await navigator.clipboard.writeText(url);
      avisar(T.avisos.enlaceCopiado, 'exito');
    } catch {
      pedirTexto({ titulo: T.galeria.enlace, etiqueta: T.galeria.enlace, valor: url, max: 100000 });
    }
  },
};
acciones.galeria = () => abrirGaleria(appGaleria);

// ---------- Modo Taller y presentación ----------

const taller = new Taller({
  contenedor: panelTaller,
  documento,
  alCambiarDoc,
  modelo,
  constructor,
  catalogo: CATALOGO,
  almacen,
  guardarEnGaleria,
  alternarPresentacion: () => acciones.alternarPresentacion(),
  alCerrar: () => acciones.cerrarTaller(),
});

acciones.abrirTaller = () => {
  panelTaller.hidden = false;
  bTaller.setAttribute('aria-expanded', 'true');
  document.body.classList.add('con-taller');
  taller.abrir();
  pintarEstado();
};
acciones.cerrarTaller = () => {
  panelTaller.hidden = true;
  bTaller.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('con-taller');
  taller.cerrar();
  pintarEstado();
  if (document.body.classList.contains('presentacion')) acciones.salirPresentacion();
  bTaller.focus();
};
acciones.alternarTaller = () => (panelTaller.hidden ? acciones.abrirTaller() : acciones.cerrarTaller());

acciones.entrarPresentacion = () => {
  document.body.classList.add('presentacion');
  retoGrande.textContent = documento.pregunta;
  if (panelTaller.hidden) acciones.abrirTaller();
  try {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } catch {
    /* sin pantalla completa: se queda el modo de texto grande */
  }
  bSalirPresentacion.focus();
};
acciones.salirPresentacion = () => {
  document.body.classList.remove('presentacion');
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
};
acciones.alternarPresentacion = () =>
  document.body.classList.contains('presentacion') ? acciones.salirPresentacion() : acciones.entrarPresentacion();
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && document.body.classList.contains('presentacion')) acciones.salirPresentacion();
});

// ---------- Ayuda y recorrido ----------

acciones.atajos = () => {
  if (document.querySelector('dialog.dialogo-atajos')) return;
  abrirDialogo({
    titulo: T.atajos.titulo,
    clase: 'dialogo-atajos',
    contenido: [
      h('table', { class: 'tabla-atajos' }, h('tbody', {}, T.atajos.lista.map(([k, d]) => h('tr', {}, h('th', { scope: 'row' }, h('kbd', { text: k })), h('td', { text: d }))))),
      h('p', { class: 'ayuda', text: T.atajos.tactil }),
    ],
  });
};

acciones.tour = () => {
  ocultarBienvenida();
  iniciarTour(['#paleta', '#lienzo', '#herramientas', '#b-taller', '#b-galeria', '#b-ayuda']);
};

function ocultarBienvenida() {
  bienvenida.hidden = true;
}

function mostrarBienvenida() {
  bienvenida.replaceChildren(
    h('div', {}, h('h2', { text: T.bienvenida.titulo }), h('p', { text: T.bienvenida.texto })),
    h(
      'div',
      { class: 'fila-botones' },
      h('button', { type: 'button', class: 'boton primario', text: T.bienvenida.recorrido, onClick: () => acciones.tour() }),
      h('button', {
        type: 'button',
        class: 'boton',
        text: T.bienvenida.vacio,
        onClick: () => {
          cargarDatos({ piezas: [] });
          ocultarBienvenida();
        },
      }),
      h('button', { type: 'button', class: 'boton-icono', 'aria-label': T.bienvenida.cerrar, title: T.bienvenida.cerrar, html: icono('cerrar'), onClick: ocultarBienvenida }),
    ),
  );
  bienvenida.hidden = false;
}

// ---------- Teclado ----------

document.addEventListener('keydown', (e) => {
  if (document.querySelector('dialog[open]') || document.querySelector('.tour-capa')) return;
  if (escribiendo(e)) return;
  const mod = e.ctrlKey || e.metaKey;
  const k = e.key.toLowerCase();
  if (mod && k === 'z' && !e.shiftKey) {
    e.preventDefault();
    return constructor.deshacer();
  }
  if (mod && (k === 'y' || (k === 'z' && e.shiftKey))) {
    e.preventDefault();
    return constructor.rehacer();
  }
  if (mod || e.altKey) return;
  if (e.target === escena.canvas && constructor.teclaLienzo(e)) {
    e.preventDefault();
    return;
  }
  // Los botones ya responden a Enter y espacio; no los interceptamos.
  if (e.key === 'Escape') {
    if (document.body.classList.contains('presentacion')) return acciones.salirPresentacion();
    if (!bienvenida.hidden) return ocultarBienvenida();
    return constructor.cancelar();
  }
  if (e.key === '?') return acciones.atajos();
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    return constructor.eliminar();
  }
  if (k === 'r') return constructor.rotar();
  if (k === 'm') return constructor.mover();
  if (k === 'd') return constructor.duplicar();
  if (k === 's') {
    e.preventDefault();
    return constructor.editarSignificado();
  }
  if (/^[1-9]$/.test(e.key)) {
    const cat = CATEGORIAS[Number(e.key) - 1];
    if (cat) paleta.mostrarCategoria(cat);
  }
});

// ---------- Arranque ----------

function arrancar() {
  const params = new URLSearchParams(location.search);
  const hash = location.hash.startsWith('#m=') ? location.hash.slice(3) : null;
  const primeraVez = !almacen.leer('visitado', false);

  if (hash) {
    const r = decodificarEnlace(hash, CATALOGO);
    if (r.ok) {
      cargarDatos(r.datos);
      avisar(T.avisos.enlaceCargado, 'exito');
    } else mostrarErrores(T.avisos.enlaceInvalido, r.errores);
    history.replaceState(null, '', location.pathname + location.search);
  } else if (params.get('demo') === '1') {
    cargarDemo();
    setTimeout(() => acciones.tour(), 400);
  } else if (primeraVez) {
    cargarDemo();
    mostrarBienvenida();
  } else {
    const guardado = almacen.leer('actual', null);
    const r = guardado ? validarModelo(guardado, CATALOGO) : null;
    if (r?.ok) cargarDatos(r.datos);
    else cargarDatos({ piezas: [] });
  }
  almacen.escribir('visitado', true);

  if (!almacen.disponible) avisar(T.avisos.sinAlmacen, 'error', 9000);

  if (matchMedia('(max-width: 640px)').matches && !almacen.leer('movilVisto', false)) {
    avisoMovil.replaceChildren(
      h('p', { text: T.movil.texto }),
      h('button', {
        type: 'button',
        class: 'boton',
        text: T.movil.cerrar,
        onClick: () => {
          avisoMovil.hidden = true;
          almacen.escribir('movilVisto', true);
        },
      }),
    );
    avisoMovil.hidden = false;
  }

  contador.textContent = T.herramientas.contador(modelo.cantidad);
  pintarEstado();
  bDeshacer.disabled = true;
  bRehacer.disabled = true;

  // Miniaturas de la paleta, cuando la página ya se pintó.
  setTimeout(() => paleta.ponerMiniaturas(generarMiniaturas(PIEZAS)), 60);
}

arrancar();

// Acceso para pruebas automáticas y depuración desde la consola.
window.__simulador = { modelo, historial, constructor, escena, documento };
