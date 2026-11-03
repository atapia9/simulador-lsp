import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  serializar,
  validarModelo,
  parsearModelo,
  codificarEnlace,
  decodificarEnlace,
  VERSION_ESQUEMA,
} from '../src/nucleo/serializacion.js';
import { CAT, pieza } from './ayuda.js';
import { CATALOGO } from '../src/data/piezas.js';
import { DEMO } from '../src/data/demo.js';
import { Modelo } from '../src/nucleo/modelo.js';

const doc = () => ({
  nombre: 'Mi equipo',
  pregunta: '¿Cómo se ve el equipo ideal?',
  historia: 'Una torre.',
  reflexion: '',
  piezas: [{ ...pieza('l2x4', 0, 0, 0), significado: 'la base' }, pieza('l1x1', 5, 0, 5, 3, '#1d4e9e')],
});

test('serializar incluye formato y versión', () => {
  const s = serializar(doc());
  assert.equal(s.formato, 'simulador-lsp');
  assert.equal(s.version, VERSION_ESQUEMA);
  assert.equal(s.piezas.length, 2);
  assert.equal(s.piezas[0].significado, 'la base');
  assert.equal('significado' in s.piezas[1], false);
});

test('ida y vuelta por JSON conserva los datos', () => {
  const texto = JSON.stringify(serializar(doc()));
  const r = parsearModelo(texto, CAT);
  assert.equal(r.ok, true);
  assert.equal(r.datos.pregunta, '¿Cómo se ve el equipo ideal?');
  assert.equal(r.datos.piezas[1].color, '#1D4E9E');
  assert.equal(r.datos.piezas[0].significado, 'la base');
});

test('rechaza JSON roto con un mensaje en español', () => {
  const r = parsearModelo('{esto no es json', CAT);
  assert.equal(r.ok, false);
  assert.match(r.errores[0], /JSON válido/);
});

test('rechaza archivos de otro formato o sin versión', () => {
  assert.match(validarModelo([], CAT).errores[0], /no contiene/);
  assert.match(validarModelo({ piezas: [] }, CAT).errores[0], /no parece/);
  assert.match(validarModelo({ formato: 'simulador-lsp', piezas: [] }, CAT).errores[0], /versión/);
});

test('rechaza versiones más nuevas que la app', () => {
  const r = validarModelo({ formato: 'simulador-lsp', version: VERSION_ESQUEMA + 1, piezas: [] }, CAT);
  assert.equal(r.ok, false);
  assert.match(r.errores[0], /más nueva/);
});

test('explica qué pieza está mal', () => {
  const s = serializar(doc());
  s.piezas[1].tipo = 'nave-espacial';
  s.piezas[0].rot = 7;
  const r = validarModelo(s, CAT);
  assert.equal(r.ok, false);
  assert.match(r.errores[0], /Pieza 1: la rotación/);
  assert.match(r.errores[1], /Pieza 2: el tipo “nave-espacial” no existe/);
});

test('valida coordenadas, color y textos', () => {
  const s = serializar(doc());
  s.piezas[0].x = 1.5;
  s.piezas[1].color = 'rojo';
  s.historia = 42;
  const r = validarModelo(s, CAT);
  assert.equal(r.ok, false);
  assert.equal(r.errores.length, 3);
});

test('limita la lista de errores', () => {
  const s = serializar({ ...doc(), piezas: Array.from({ length: 9 }, () => pieza('nada', 0, 0, 0)) });
  const r = validarModelo(s, CAT);
  assert.equal(r.errores.length, 6);
  assert.match(r.errores[5], /4 problema/);
});

test('enlace para compartir: ida y vuelta', () => {
  const texto = codificarEnlace(doc());
  assert.match(texto, /^[A-Za-z0-9_-]+$/);
  const r = decodificarEnlace(texto, CAT);
  assert.equal(r.ok, true);
  assert.equal(r.datos.nombre, 'Mi equipo');
  assert.equal(r.datos.piezas.length, 2);
  assert.equal(r.datos.piezas[0].significado, 'la base');
});

test('enlace dañado da error', () => {
  assert.equal(decodificarEnlace('%%%', CAT).ok, false);
  assert.equal(decodificarEnlace('e30', CAT).ok, false); // "{}"
});

test('el modelo demo es válido y todas sus piezas caben', () => {
  const r = validarModelo(serializar(DEMO), CATALOGO);
  assert.equal(r.ok, true, r.errores?.join('\n'));
  const m = new Modelo(CATALOGO);
  const { omitidas } = m.cargar(r.datos.piezas);
  assert.equal(omitidas, 0);
  assert.ok(m.lista().some((p) => p.significado));
});
