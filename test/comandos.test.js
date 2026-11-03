import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Modelo, ErrorColocacion } from '../src/nucleo/modelo.js';
import { Historial, cmdAgregar, cmdQuitar, cmdActualizar, cmdReemplazar } from '../src/nucleo/comandos.js';
import { CAT, pieza } from './ayuda.js';

test('el modelo agrega piezas y rechaza las que chocan', () => {
  const m = new Modelo(CAT);
  const p = m.agregar(pieza('l2x4', 0, 0, 0));
  assert.equal(p.id, 1);
  assert.equal(m.cantidad, 1);
  assert.throws(() => m.agregar(pieza('l1x1', 1, 0, 1)), ErrorColocacion);
  assert.equal(m.cantidad, 1);
});

test('agregar → deshacer → rehacer', () => {
  const m = new Modelo(CAT);
  const h = new Historial();
  assert.equal(h.ejecutar(cmdAgregar(m, pieza('l2x4', 0, 0, 0))).ok, true);
  assert.equal(m.cantidad, 1);
  assert.equal(h.deshacer(), true);
  assert.equal(m.cantidad, 0);
  assert.equal(m.rejilla.celdasOcupadas, 0);
  assert.equal(h.rehacer(), true);
  assert.equal(m.cantidad, 1);
  assert.equal(m.obtener(1).tipo, 'l2x4');
});

test('un comando que falla no entra al historial', () => {
  const m = new Modelo(CAT);
  const h = new Historial();
  h.ejecutar(cmdAgregar(m, pieza('l2x4', 0, 0, 0)));
  const r = h.ejecutar(cmdAgregar(m, pieza('l2x4', 0, 0, 0)));
  assert.equal(r.ok, false);
  assert.equal(r.error.motivo, 'choque');
  assert.equal(h.pasos, 1);
});

test('mover, girar y cambiar color se deshacen en orden', () => {
  const m = new Modelo(CAT);
  const h = new Historial();
  const { resultado: p } = h.ejecutar(cmdAgregar(m, pieza('l2x4', 0, 0, 0)));
  h.ejecutar(cmdActualizar(m, p.id, { x: 10, z: 10 }));
  h.ejecutar(cmdActualizar(m, p.id, { rot: 1 }));
  h.ejecutar(cmdActualizar(m, p.id, { color: '#1D4E9E', significado: 'confianza' }));
  assert.deepEqual(
    { x: m.obtener(1).x, rot: m.obtener(1).rot, color: m.obtener(1).color, s: m.obtener(1).significado },
    { x: 10, rot: 1, color: '#1D4E9E', s: 'confianza' },
  );
  h.deshacer();
  assert.equal(m.obtener(1).color, '#C8102E');
  assert.equal(m.obtener(1).significado, '');
  h.deshacer();
  assert.equal(m.obtener(1).rot, 0);
  h.deshacer();
  assert.equal(m.obtener(1).x, 0);
  // La rejilla se actualizó: el lugar viejo vuelve a estar ocupado.
  assert.equal(m.rejilla.ocupante(0, 0, 0), 1);
  assert.equal(m.rejilla.ocupante(10, 0, 10), null);
});

test('mover a un lugar ocupado falla y deja todo igual', () => {
  const m = new Modelo(CAT);
  const h = new Historial();
  h.ejecutar(cmdAgregar(m, pieza('l2x4', 0, 0, 0)));
  h.ejecutar(cmdAgregar(m, pieza('l2x4', 8, 0, 0)));
  const r = h.ejecutar(cmdActualizar(m, 2, { x: 2 }));
  assert.equal(r.ok, false);
  assert.equal(m.obtener(2).x, 8);
  assert.equal(m.rejilla.ocupante(8, 0, 0), 2);
});

test('quitar se deshace con el mismo id', () => {
  const m = new Modelo(CAT);
  const h = new Historial();
  h.ejecutar(cmdAgregar(m, pieza('l1x1', 3, 0, 3)));
  h.ejecutar(cmdQuitar(m, 1));
  assert.equal(m.cantidad, 0);
  h.deshacer();
  assert.equal(m.obtener(1).x, 3);
});

test('reemplazar (limpiar todo) se puede deshacer', () => {
  const m = new Modelo(CAT);
  const h = new Historial();
  for (let i = 0; i < 5; i++) h.ejecutar(cmdAgregar(m, pieza('l1x1', i, 0, 0)));
  h.ejecutar(cmdReemplazar(m, []));
  assert.equal(m.cantidad, 0);
  h.deshacer();
  assert.equal(m.cantidad, 5);
  h.rehacer();
  assert.equal(m.cantidad, 0);
});

test('nuevo comando borra el futuro', () => {
  const m = new Modelo(CAT);
  const h = new Historial();
  h.ejecutar(cmdAgregar(m, pieza('l1x1', 0, 0, 0)));
  h.deshacer();
  assert.equal(h.puedeRehacer, true);
  h.ejecutar(cmdAgregar(m, pieza('l1x1', 5, 0, 5)));
  assert.equal(h.puedeRehacer, false);
});

test('el historial guarda al menos 50 pasos y respeta su límite', () => {
  const m = new Modelo(CAT);
  const h = new Historial(100);
  for (let i = 0; i < 120; i++) h.ejecutar(cmdAgregar(m, pieza('l1x1', i % 32, Math.floor(i / 32) * 3, 0)));
  assert.equal(h.pasos, 100);
  let n = 0;
  while (h.deshacer()) n++;
  assert.equal(n, 100);
  assert.equal(m.cantidad, 20);
});

test('cargar omite las piezas que chocan', () => {
  const m = new Modelo(CAT);
  const r = m.cargar([pieza('l2x4', 0, 0, 0), pieza('l2x4', 0, 0, 0), pieza('l1x1', 31, 0, 31)]);
  assert.deepEqual(r, { cargadas: 2, omitidas: 1 });
});

test('el modelo avisa de los cambios', () => {
  const m = new Modelo(CAT);
  const eventos = [];
  m.on((e) => eventos.push(e.tipo));
  m.agregar(pieza('l1x1', 0, 0, 0));
  m.actualizar(1, { color: '#22262B' });
  m.quitar(1);
  m.cargar([]);
  assert.deepEqual(eventos, ['agregar', 'actualizar', 'quitar', 'cargar']);
});
