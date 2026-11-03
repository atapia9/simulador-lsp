// Formato de archivo de los modelos (JSON versionado) y su validación.

import { T } from '../i18n/es.js';
import { MAX_PIEZAS, MAX_TEXTO, MAX_SIGNIFICADO, ANCHO_BASE, FONDO_BASE, ALTO_MAX } from './constantes.js';

export const FORMATO = 'simulador-lsp';
export const VERSION_ESQUEMA = 1;
const MAX_ERRORES = 5;
const COLOR_RE = /^#[0-9a-f]{6}$/i;
const CAMPOS_TEXTO = ['nombre', 'pregunta', 'historia', 'reflexion'];

/** Convierte el documento actual en un objeto listo para JSON. */
export function serializar({ nombre = '', pregunta = '', historia = '', reflexion = '', piezas = [], fecha = new Date() }) {
  return {
    formato: FORMATO,
    version: VERSION_ESQUEMA,
    nombre,
    fecha: new Date(fecha).toISOString(),
    pregunta,
    historia,
    reflexion,
    piezas: piezas.map((p) => ({
      tipo: p.tipo,
      x: p.x,
      y: p.y,
      z: p.z,
      rot: p.rot,
      color: p.color,
      ...(p.significado ? { significado: p.significado } : {}),
    })),
  };
}

/** Lee texto JSON y lo valida. */
export function parsearModelo(texto, catalogo) {
  let obj;
  try {
    obj = JSON.parse(texto);
  } catch {
    return { ok: false, errores: [T.errores.jsonInvalido] };
  }
  return validarModelo(obj, catalogo);
}

function esEntero(n, min, max) {
  return Number.isInteger(n) && n >= min && n <= max;
}

/**
 * Revisa que un objeto tenga la forma de un modelo válido.
 * Devuelve {ok: true, datos} o {ok: false, errores: [mensajes en español]}.
 */
export function validarModelo(obj, catalogo) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return { ok: false, errores: [T.errores.noEsObjeto] };
  }
  if (obj.formato !== FORMATO) return { ok: false, errores: [T.errores.formato] };
  if (!Number.isInteger(obj.version) || obj.version < 1) return { ok: false, errores: [T.errores.version] };
  if (obj.version > VERSION_ESQUEMA) return { ok: false, errores: [T.errores.versionNueva(obj.version)] };
  if (!Array.isArray(obj.piezas)) return { ok: false, errores: [T.errores.sinPiezas] };
  if (obj.piezas.length > MAX_PIEZAS) return { ok: false, errores: [T.errores.demasiadas(MAX_PIEZAS)] };

  const errores = [];
  for (const campo of CAMPOS_TEXTO) {
    const v = obj[campo];
    if (v !== undefined && (typeof v !== 'string' || v.length > MAX_TEXTO)) errores.push(T.errores.texto(campo));
  }

  const piezas = [];
  obj.piezas.forEach((p, i) => {
    const motivo = motivoPiezaInvalida(p, catalogo);
    if (motivo) errores.push(T.errores.pieza(i, motivo));
    else
      piezas.push({
        tipo: p.tipo,
        x: p.x,
        y: p.y,
        z: p.z,
        rot: p.rot,
        color: p.color.toUpperCase(),
        significado: p.significado ?? '',
      });
  });

  if (errores.length) {
    const extra = errores.length - MAX_ERRORES;
    const lista = errores.slice(0, MAX_ERRORES);
    if (extra > 0) lista.push(T.errores.mas(extra));
    return { ok: false, errores: lista };
  }

  return {
    ok: true,
    datos: {
      nombre: obj.nombre ?? '',
      pregunta: obj.pregunta ?? '',
      historia: obj.historia ?? '',
      reflexion: obj.reflexion ?? '',
      fecha: typeof obj.fecha === 'string' ? obj.fecha : null,
      piezas,
    },
  };
}

function motivoPiezaInvalida(p, catalogo) {
  if (p === null || typeof p !== 'object') return T.errores.noEsObjeto;
  if (typeof p.tipo !== 'string' || !catalogo.has(p.tipo)) return T.errores.tipo(String(p.tipo));
  if (!esEntero(p.x, 0, ANCHO_BASE - 1)) return T.errores.coordenada('x');
  if (!esEntero(p.y, 0, ALTO_MAX - 1)) return T.errores.coordenada('y');
  if (!esEntero(p.z, 0, FONDO_BASE - 1)) return T.errores.coordenada('z');
  if (!esEntero(p.rot, 0, 3)) return T.errores.rotacion;
  if (typeof p.color !== 'string' || !COLOR_RE.test(p.color)) return T.errores.color;
  if (p.significado !== undefined && (typeof p.significado !== 'string' || p.significado.length > MAX_SIGNIFICADO)) {
    return T.errores.significado;
  }
  return null;
}

// ---------- Compartir por enlace (hash de la URL) ----------

export const MAX_PIEZAS_ENLACE = 150;

function aBase64Url(texto) {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deBase64Url(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Codifica un modelo pequeño en texto apto para el hash. Devuelve null si es muy grande. */
export function codificarEnlace(doc) {
  if (doc.piezas.length > MAX_PIEZAS_ENLACE) return null;
  const compacto = {
    v: VERSION_ESQUEMA,
    n: doc.nombre || '',
    q: doc.pregunta || '',
    h: doc.historia || '',
    p: doc.piezas.map((p) => [p.tipo, p.x, p.y, p.z, p.rot, p.color.slice(1), p.significado || '']),
  };
  return aBase64Url(JSON.stringify(compacto));
}

/** Decodifica el hash y lo valida con las mismas reglas que un archivo. */
export function decodificarEnlace(texto, catalogo) {
  let c;
  try {
    c = JSON.parse(deBase64Url(texto));
  } catch {
    return { ok: false, errores: [T.errores.jsonInvalido] };
  }
  if (!c || !Array.isArray(c.p)) return { ok: false, errores: [T.errores.formato] };
  const obj = {
    formato: FORMATO,
    version: c.v,
    nombre: c.n,
    pregunta: c.q,
    historia: c.h,
    piezas: c.p.map((a) =>
      Array.isArray(a)
        ? { tipo: a[0], x: a[1], y: a[2], z: a[3], rot: a[4], color: '#' + a[5], ...(a[6] ? { significado: a[6] } : {}) }
        : null,
    ),
  };
  return validarModelo(obj, catalogo);
}
