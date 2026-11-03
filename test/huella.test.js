import { test } from 'node:test';
import assert from 'node:assert/strict';
import { huella, celdasDe, normalizarRotacion, anclaDesdeCursor } from '../src/nucleo/huella.js';

const L24 = { ancho: 4, fondo: 2, alto: 3 };

test('normalizarRotacion lleva cualquier entero a 0..3', () => {
  assert.equal(normalizarRotacion(0), 0);
  assert.equal(normalizarRotacion(5), 1);
  assert.equal(normalizarRotacion(-1), 3);
  assert.equal(normalizarRotacion(undefined), 0);
});

test('la huella intercambia ancho y fondo al girar 90° y 270°', () => {
  assert.deepEqual(huella(L24, 0), { ancho: 4, fondo: 2 });
  assert.deepEqual(huella(L24, 1), { ancho: 2, fondo: 4 });
  assert.deepEqual(huella(L24, 2), { ancho: 4, fondo: 2 });
  assert.deepEqual(huella(L24, 3), { ancho: 2, fondo: 4 });
});

test('celdasDe cuenta ancho × fondo × alto celdas', () => {
  assert.equal(celdasDe(L24, { x: 0, y: 0, z: 0, rot: 0 }).length, 24);
  const giradas = celdasDe(L24, { x: 5, y: 3, z: 5, rot: 1 });
  const xs = new Set(giradas.map((c) => c.x));
  const zs = new Set(giradas.map((c) => c.z));
  const ys = new Set(giradas.map((c) => c.y));
  assert.deepEqual([...xs].sort(), [5, 6]);
  assert.deepEqual([...zs].sort(), [5, 6, 7, 8]);
  assert.deepEqual([...ys].sort(), [3, 4, 5]);
});

test('anclaDesdeCursor centra la huella en el cursor', () => {
  assert.deepEqual(anclaDesdeCursor(L24, 0, 10, 10), { x: 9, z: 10 });
  assert.deepEqual(anclaDesdeCursor(L24, 1, 10, 10), { x: 10, z: 9 });
  assert.deepEqual(anclaDesdeCursor({ ancho: 1, fondo: 1, alto: 3 }, 0, 3, 4), { x: 3, z: 4 });
});
