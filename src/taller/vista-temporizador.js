// Control visual de un temporizador: tiempo, barra de progreso y botones.

import { h } from '../ui/dom.js';
import { icono } from '../ui/iconos.js';
import { Temporizador, formatearTiempo } from './temporizador.js';
import { prepararAudio, tocarCampana } from './sonido.js';

/**
 * @param {object} op
 * @param {number} op.minutos
 * @param {object} op.textos { iniciar, pausar, reanudar, reiniciar, progreso }
 * @param {() => boolean} [op.conSonido]
 * @param {() => void} [op.alTerminar]
 */
export function crearVistaTemporizador({ minutos, textos, conSonido = () => false, alTerminar, grande = false }) {
  const t = new Temporizador(minutos * 60_000);
  let intervalo = null;

  const tiempo = h('div', { class: grande ? 'tiempo tiempo-grande' : 'tiempo', 'aria-live': 'off', role: 'timer' });
  const relleno = h('div', { class: 'barra-relleno' });
  const barra = h('div', { class: 'barra', role: 'progressbar', 'aria-label': textos.progreso, 'aria-valuemin': '0', 'aria-valuemax': '100' }, relleno);
  const bPrincipal = h('button', { type: 'button', class: 'boton primario' });
  const bReiniciar = h('button', { type: 'button', class: 'boton', html: icono('rotar') + `<span>${textos.reiniciar}</span>` });

  function pintar() {
    const terminado = t.estado === 'terminado';
    tiempo.textContent = terminado && textos.terminado ? textos.terminado : formatearTiempo(t.restanteMs());
    const pct = Math.round(t.progreso() * 100);
    relleno.style.width = `${pct}%`;
    barra.setAttribute('aria-valuenow', String(pct));
    barra.classList.toggle('terminada', terminado);
    const corriendo = t.estado === 'corriendo';
    const etiqueta = corriendo ? textos.pausar : t.estado === 'pausado' ? textos.reanudar : textos.iniciar;
    bPrincipal.innerHTML = icono(corriendo ? 'pausa' : 'play') + `<span>${etiqueta}</span>`;
  }

  function tic() {
    if (t.actualizar()) {
      detener();
      if (conSonido()) tocarCampana();
      alTerminar?.();
    }
    pintar();
  }

  function detener() {
    clearInterval(intervalo);
    intervalo = null;
  }

  bPrincipal.addEventListener('click', () => {
    if (t.estado === 'corriendo') {
      t.pausar();
      detener();
    } else {
      if (conSonido()) prepararAudio();
      if (t.estado === 'pausado') t.reanudar();
      else t.iniciar();
      detener();
      intervalo = setInterval(tic, 250);
    }
    pintar();
  });

  bReiniciar.addEventListener('click', () => {
    detener();
    t.reiniciar();
    pintar();
  });

  pintar();

  return {
    elemento: h('div', { class: 'temporizador' }, tiempo, barra, h('div', { class: 'fila-botones' }, bPrincipal, bReiniciar)),
    cambiarMinutos(min) {
      detener();
      t.reiniciar(min * 60_000);
      pintar();
    },
    detener() {
      detener();
      if (t.estado === 'corriendo') t.pausar();
      pintar();
    },
    get estado() {
      return t.estado;
    },
  };
}
