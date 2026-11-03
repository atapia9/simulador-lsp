import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Rejilla } from '../src/nucleo/rejilla.js';
import { celdasDe } from '../src/nucleo/huella.js';

const L22 = { ancho: 2, fondo: 2, alto: 3 };

test('ocupar y liberar celdas', () => {
  const r = new Rejilla(8, 8, 12);
  const celdas = celdasDe(L22, { x: 0, y: 0, z: 0, rot: 0 });
  r.ocupar(1, celdas);
  assert.equal(r.celdasOcupadas, 12);
  assert.equal(r.ocupante(1, 2, 1), 1);
  assert.equal(r.ocupante(2, 0, 0), null);
  assert.equal(r.liberar(1), true);
  assert.equal(r.celdasOcupadas, 0);
  assert.equal(r.liberar(1), false);
});

test('detecta choques entre piezas', () => {
  const r = new Rejilla(8, 8, 12);
  r.ocupar(1, celdasDe(L22, { x: 0, y: 0, z: 0, rot: 0 }));
  const choca = celdasDe(L22, { x: 1, y: 2, z: 1, rot: 0 });
  const libre = celdasDe(L22, { x: 2, y: 0, z: 0, rot: 0 });
  assert.equal(r.estaLibre(choca), false);
  assert.equal(r.estaLibre(libre), true);
  assert.throws(() => r.ocupar(2, choca));
});

test('estaLibre ignora la pieza indicada (para mover)', () => {
  const r = new Rejilla(8, 8, 12);
  const celdas = celdasDe(L22, { x: 0, y: 0, z: 0, rot: 0 });
  r.ocupar(7, celdas);
  assert.equal(r.estaLibre(celdasDe(L22, { x: 1, y: 0, z: 0, rot: 0 }), 7), true);
});

test('las celdas fuera de los límites no están libres', () => {
  const r = new Rejilla(4, 4, 6);
  assert.equal(r.estaLibre([{ x: 4, y: 0, z: 0 }]), false);
  assert.equal(r.estaLibre([{ x: 0, y: 6, z: 0 }]), false);
  assert.equal(r.estaLibre([{ x: -1, y: 0, z: 0 }]), false);
});

test('topeColumna da la altura de lo más alto en esa columna', () => {
  const r = new Rejilla(8, 8, 12);
  r.ocupar(1, celdasDe(L22, { x: 0, y: 0, z: 0, rot: 0 }));
  r.ocupar(2, celdasDe(L22, { x: 0, y: 3, z: 0, rot: 0 }));
  assert.equal(r.topeColumna(0, 0), 6);
  assert.equal(r.topeColumna(0, 0, 2), 3);
  assert.equal(r.topeColumna(5, 5), 0);
});
