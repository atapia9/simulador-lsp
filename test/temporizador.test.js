import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Temporizador, formatearTiempo, limitarMinutos } from '../src/taller/temporizador.js';

function reloj() {
  let t = 0;
  const f = () => t;
  f.avanzar = (ms) => (t += ms);
  return f;
}

test('cuenta hacia atrás y termina una sola vez', () => {
  const r = reloj();
  const t = new Temporizador(60_000, r);
  assert.equal(t.estado, 'listo');
  t.iniciar();
  r.avanzar(15_000);
  assert.equal(t.restanteMs(), 45_000);
  assert.equal(t.progreso(), 0.25);
  r.avanzar(50_000);
  assert.equal(t.restanteMs(), 0);
  assert.equal(t.actualizar(), true);
  assert.equal(t.estado, 'terminado');
  assert.equal(t.actualizar(), false);
});

test('pausar congela el tiempo', () => {
  const r = reloj();
  const t = new Temporizador(10_000, r);
  t.iniciar();
  r.avanzar(3_000);
  t.pausar();
  r.avanzar(100_000);
  assert.equal(t.restanteMs(), 7_000);
  assert.equal(t.actualizar(), false);
  t.reanudar();
  r.avanzar(2_000);
  assert.equal(t.restanteMs(), 5_000);
});

test('reiniciar vuelve al inicio, con nueva duración si se da', () => {
  const r = reloj();
  const t = new Temporizador(10_000, r);
  t.iniciar();
  r.avanzar(4_000);
  t.reiniciar(120_000);
  assert.equal(t.estado, 'listo');
  assert.equal(t.restanteMs(), 120_000);
});

test('iniciar después de terminar empieza de nuevo', () => {
  const r = reloj();
  const t = new Temporizador(1_000, r);
  t.iniciar();
  r.avanzar(2_000);
  t.actualizar();
  t.iniciar();
  assert.equal(t.estado, 'corriendo');
  assert.equal(t.restanteMs(), 1_000);
});

test('formatearTiempo redondea hacia arriba', () => {
  assert.equal(formatearTiempo(0), '0:00');
  assert.equal(formatearTiempo(999), '0:01');
  assert.equal(formatearTiempo(65_000), '1:05');
  assert.equal(formatearTiempo(15 * 60_000), '15:00');
  assert.equal(formatearTiempo(-5), '0:00');
});

test('limitarMinutos mantiene el rango 1–15', () => {
  assert.equal(limitarMinutos(0), 1);
  assert.equal(limitarMinutos(20), 15);
  assert.equal(limitarMinutos('7'), 7);
  assert.equal(limitarMinutos('abc'), 5);
});
