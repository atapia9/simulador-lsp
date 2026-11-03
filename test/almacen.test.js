import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearAlmacen } from '../src/nucleo/almacen.js';
import { listarModelos, guardarModelo, eliminarModelo } from '../src/nucleo/galeria.js';

function storageFalso() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}

test('el almacén guarda y lee JSON', () => {
  const a = crearAlmacen(storageFalso());
  assert.equal(a.disponible, true);
  a.escribir('x', { n: 1 });
  assert.deepEqual(a.leer('x'), { n: 1 });
  assert.equal(a.leer('nada', 'def'), 'def');
});

test('si localStorage falla, funciona en memoria', () => {
  const roto = { getItem() { throw new Error('no'); }, setItem() { throw new Error('no'); }, removeItem() {} };
  const a = crearAlmacen(roto);
  assert.equal(a.disponible, false);
  assert.equal(a.escribir('x', 5), true);
  assert.equal(a.leer('x'), 5);
});

test('si la cuota se llena, escribir devuelve false', () => {
  const s = storageFalso();
  const a = crearAlmacen(s);
  s.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.equal(a.escribir('x', 1), false);
});

test('la galería guarda, reemplaza por nombre y elimina', () => {
  const a = crearAlmacen(storageFalso());
  const r1 = guardarModelo(a, { nombre: 'Uno', piezas: [] });
  guardarModelo(a, { nombre: 'Dos', piezas: [] });
  guardarModelo(a, { nombre: 'Uno', piezas: [{ tipo: 'x' }] });
  const lista = listarModelos(a);
  assert.equal(lista.length, 2);
  assert.equal(lista.find((m) => m.datos.nombre === 'Uno').datos.piezas.length, 1);
  eliminarModelo(a, r1.entrada.id);
  assert.deepEqual(listarModelos(a).map((m) => m.datos.nombre), ['Dos']);
});
