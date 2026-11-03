// Prueba de humo del sitio construido y capturas para el README.
// Uso: npm run build && npm run preview (en otra terminal) && npm run capturas
// Opcional: URL=https://atapia9.github.io/simulador-lsp/ npm run capturas

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL_BASE = process.env.URL || 'http://localhost:4173/simulador-lsp/';
const GUARDAR = process.env.SIN_CAPTURAS ? null : 'docs/img';
const errores = [];

function vigilar(page) {
  page.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  page.on('pageerror', (e) => errores.push(e.message));
}

function comprobar(cond, msg) {
  if (!cond) throw new Error(`Falló: ${msg}`);
  console.log(`✓ ${msg}`);
}

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
if (GUARDAR) await mkdir(GUARDAR, { recursive: true });

try {
  // 1. Primera visita: demo + bienvenida, en tema claro.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light', deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  vigilar(page);
  await page.goto(URL_BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.pieza img');
  comprobar(await page.isVisible('.bienvenida'), 'aparece la bienvenida en la primera visita');
  comprobar((await page.evaluate(() => window.__simulador.modelo.cantidad)) === 20, 'el demo carga 20 piezas');
  await page.click('.bienvenida [aria-label="Cerrar aviso"]');

  // Colocar una pieza haciendo clic en la base.
  await page.click('.pieza[data-tipo="ladrillo-2x4"]');
  const punto = await page.evaluate(() => {
    const { escena } = window.__simulador;
    const V = escena.camera.position.constructor;
    const v = new V(10.5 - 16 + 2, 0.01, 3 - 16 + 1).project(escena.camera);
    const r = escena.canvas.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  });
  await page.mouse.move(punto.x, punto.y);
  await page.mouse.click(punto.x, punto.y);
  comprobar((await page.evaluate(() => window.__simulador.modelo.cantidad)) === 21, 'un clic coloca una pieza');
  await page.keyboard.press('Control+z');
  comprobar((await page.evaluate(() => window.__simulador.modelo.cantidad)) === 20, 'Ctrl+Z deshace');
  await page.keyboard.press('Control+y');
  comprobar((await page.evaluate(() => window.__simulador.modelo.cantidad)) === 21, 'Ctrl+Y rehace');
  await page.keyboard.press('Escape');
  await page.mouse.move(5, 5);
  await page.keyboard.press('Shift+?');
  comprobar(await page.isVisible('dialog.dialogo-atajos'), 'la tecla ? abre los atajos');
  await page.keyboard.press('Escape');

  // Captura 1: constructor con una pieza en vista previa.
  await page.click('.categoria#tab-naturaleza');
  await page.click('.pieza[data-tipo="arbol"]');
  const p2 = await page.evaluate(() => {
    const { escena } = window.__simulador;
    const V = escena.camera.position.constructor;
    const v = new V(27 - 16, 0.01, 8 - 16).project(escena.camera);
    const r = escena.canvas.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  });
  await page.mouse.move(p2.x, p2.y);
  await page.evaluate(() => document.querySelectorAll('.aviso').forEach((a) => a.remove()));
  await page.waitForTimeout(300);
  if (GUARDAR) await page.screenshot({ path: `${GUARDAR}/constructor.png` });
  await page.keyboard.press('Escape');

  // Captura 2: Modo Taller en el paso Compartir.
  await page.click('#b-taller');
  await page.click('.stepper li:nth-child(3) .paso');
  await page.fill('#taller-historia', 'Nuestro equipo se para sobre una base común…');
  comprobar((await page.locator('.significados li').count()) >= 10, 'el paso Compartir lista los significados');
  await page.waitForTimeout(300);
  if (GUARDAR) await page.screenshot({ path: `${GUARDAR}/taller.png` });

  // Temporizador del paso Construcción.
  await page.click('.stepper li:nth-child(2) .paso');
  await page.click('.temporizador .boton.primario');
  await page.waitForTimeout(1300);
  const tiempo = await page.textContent('.tiempo-grande');
  comprobar(/^\d+:\d\d$/.test(tiempo) && tiempo !== '7:00', `el temporizador corre (${tiempo})`);
  await page.click('.temporizador .boton.primario');

  // Galería: guardar y ver la lista.
  await page.click('#b-galeria');
  await page.fill('#galeria-nombre', 'Prueba automática');
  await page.click('dialog[open] form button[type=submit]');
  comprobar((await page.locator('.lista-galeria li').first().textContent()).includes('Prueba automática'), 'la galería guarda el modelo');
  await page.keyboard.press('Escape');
  await ctx.close();

  // 3. Presentación en tema oscuro con ?demo=1 (inicia el recorrido).
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', deviceScaleFactor: 1 });
  const page2 = await ctx2.newPage();
  vigilar(page2);
  await page2.goto(`${URL_BASE}?demo=1`, { waitUntil: 'networkidle' });
  await page2.waitForSelector('.tour-burbuja');
  comprobar(true, '?demo=1 abre el recorrido');
  await page2.keyboard.press('Escape');
  await page2.click('#b-taller');
  await page2.click('.stepper li:nth-child(4) .paso');
  await page2.evaluate(() => {
    document.body.classList.add('presentacion');
    document.querySelector('.reto-grande').textContent = window.__simulador.documento.pregunta;
  });
  await page2.waitForTimeout(400);
  if (GUARDAR) await page2.screenshot({ path: `${GUARDAR}/presentacion.png` });
  await ctx2.close();

  comprobar(errores.length === 0, `sin errores en la consola${errores.length ? ': ' + errores.join(' | ') : ''}`);
  console.log('\nPrueba de humo completa.');
} finally {
  await browser.close();
}
