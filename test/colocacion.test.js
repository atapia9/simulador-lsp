import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Rejilla } from '../src/nucleo/rejilla.js';
import { celdasDe } from '../src/nucleo/huella.js';
import { validarColocacion, alturaApoyo, tieneApoyo } from '../src/nucleo/colocacion.js';

const L24 = { ancho: 4, fondo: 2, alto: 3 };
const P22 = { ancho: 2, fondo: 2, alto: 1 };

function base() {
  return new Rejilla(32, 32, 72);
}

test('es válido colocar sobre la base vacía', () => {
  assert.deepEqual(validarColocacion(base(), L24, { x: 0, y: 0, z: 0, rot: 0 }), { valida: true, motivo: null });
});

test('fuera de la base no es válido, también si se sale al girar', () => {
  const r = base();
  assert.equal(validarColocacion(r, L24, { x: 29, y: 0, z: 0, rot: 0 }).motivo, 'fuera');
  assert.equal(validarColocacion(r, L24, { x: 28, y: 0, z: 0, rot: 0 }).valida, true);
  // Girada ocupa 2×4: en x=28 cabe, pero en z=29 ya no.
  assert.equal(validarColocacion(r, L24, { x: 28, y: 0, z: 28, rot: 1 }).valida, true);
  assert.equal(validarColocacion(r, L24, { x: 28, y: 0, z: 29, rot: 1 }).motivo, 'fuera');
  assert.equal(validarColocacion(r, L24, { x: -1, y: 0, z: 0, rot: 0 }).motivo, 'fuera');
});

test('no deja pasar del alto máximo', () => {
  const r = new Rejilla(8, 8, 6);
  assert.equal(validarColocacion(r, L24, { x: 0, y: 3, z: 0, rot: 0 }).motivo === 'muyAlto', false);
  assert.equal(validarColocacion(r, L24, { x: 0, y: 4, z: 0, rot: 0 }).motivo, 'muyAlto');
});

test('detecta choque con otra pieza', () => {
  const r = base();
  r.ocupar(1, celdasDe(L24, { x: 0, y: 0, z: 0, rot: 0 }));
  assert.equal(validarColocacion(r, L24, { x: 2, y: 0, z: 1, rot: 0 }).motivo, 'choque');
  assert.equal(validarColocacion(r, L24, { x: 4, y: 0, z: 0, rot: 0 }).valida, true);
});

test('una pieza en el aire necesita apoyo', () => {
  const r = base();
  assert.equal(validarColocacion(r, P22, { x: 0, y: 3, z: 0, rot: 0 }).motivo, 'sinApoyo');
  r.ocupar(1, celdasDe(L24, { x: 0, y: 0, z: 0, rot: 0 }));
  // Basta con que una espiga se apoye (voladizo permitido).
  assert.equal(validarColocacion(r, P22, { x: 3, y: 3, z: 1, rot: 0 }).valida, true);
  assert.equal(tieneApoyo(r, P22, { x: 4, y: 3, z: 0, rot: 0 }), false);
});

test('al mover, la pieza no choca consigo misma ni se apoya en sí misma', () => {
  const r = base();
  r.ocupar(1, celdasDe(L24, { x: 0, y: 0, z: 0, rot: 0 }));
  assert.equal(validarColocacion(r, L24, { x: 1, y: 0, z: 0, rot: 0 }, 1).valida, true);
  assert.equal(validarColocacion(r, L24, { x: 0, y: 3, z: 0, rot: 0 }, 1).motivo, 'sinApoyo');
});

test('girar una pieza cambia con qué choca', () => {
  const r = base();
  r.ocupar(1, celdasDe(P22, { x: 4, y: 0, z: 0, rot: 0 }));
  // Sin girar (4×2) en x=1 llega a x=4 → choca; girada (2×4) llega solo a x=2.
  assert.equal(validarColocacion(r, L24, { x: 1, y: 0, z: 0, rot: 0 }).motivo, 'choque');
  assert.equal(validarColocacion(r, L24, { x: 1, y: 0, z: 0, rot: 1 }).valida, true);
});

test('alturaApoyo apila encima de lo más alto en la huella', () => {
  const r = base();
  assert.equal(alturaApoyo(r, L24, { x: 0, z: 0, rot: 0 }), 0);
  r.ocupar(1, celdasDe(L24, { x: 0, y: 0, z: 0, rot: 0 }));
  r.ocupar(2, celdasDe(P22, { x: 0, y: 3, z: 0, rot: 0 }));
  assert.equal(alturaApoyo(r, L24, { x: 0, z: 0, rot: 0 }), 4);
  assert.equal(alturaApoyo(r, L24, { x: 2, z: 0, rot: 0 }), 3);
  assert.equal(alturaApoyo(r, L24, { x: 0, z: 0, rot: 0 }, 2), 3);
});
