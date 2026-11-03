// Temporizador de cuenta regresiva sin dependencias del navegador.
// El reloj se inyecta para poder probarlo en Node.

export const MIN_MINUTOS = 1;
export const MAX_MINUTOS = 15;

export function limitarMinutos(min) {
  const n = Math.round(Number(min));
  if (!Number.isFinite(n)) return 5;
  return Math.min(MAX_MINUTOS, Math.max(MIN_MINUTOS, n));
}

/** Formatea milisegundos como m:ss, redondeando hacia arriba al segundo. */
export function formatearTiempo(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export class Temporizador {
  constructor(duracionMs, reloj = () => Date.now()) {
    this.reloj = reloj;
    this.reiniciar(duracionMs);
  }

  /** 'listo' | 'corriendo' | 'pausado' | 'terminado' */
  get estado() {
    return this._estado;
  }

  reiniciar(duracionMs = this.duracionMs) {
    this.duracionMs = Math.max(0, duracionMs);
    this._acumulado = 0;
    this._inicio = null;
    this._estado = 'listo';
  }

  iniciar() {
    if (this._estado === 'corriendo') return;
    if (this._estado === 'terminado') this.reiniciar();
    this._inicio = this.reloj();
    this._estado = 'corriendo';
  }

  pausar() {
    if (this._estado !== 'corriendo') return;
    this._acumulado += this.reloj() - this._inicio;
    this._inicio = null;
    this._estado = 'pausado';
  }

  reanudar() {
    if (this._estado === 'pausado') this.iniciar();
  }

  transcurridoMs() {
    const extra = this._estado === 'corriendo' ? this.reloj() - this._inicio : 0;
    return Math.min(this.duracionMs, this._acumulado + extra);
  }

  restanteMs() {
    return this.duracionMs - this.transcurridoMs();
  }

  /** Avance de 0 a 1. */
  progreso() {
    return this.duracionMs === 0 ? 1 : this.transcurridoMs() / this.duracionMs;
  }

  /**
   * Revisa si el tiempo se acabó. Devuelve true solo la primera vez que
   * detecta el final (útil para tocar el sonido una vez).
   */
  actualizar() {
    if (this._estado === 'corriendo' && this.restanteMs() <= 0) {
      this._acumulado = this.duracionMs;
      this._inicio = null;
      this._estado = 'terminado';
      return true;
    }
    return false;
  }
}
