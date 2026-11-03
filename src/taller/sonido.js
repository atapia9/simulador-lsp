// Campanita suave generada con Web Audio (sin archivos de audio).

let ctx = null;

/** Crea el contexto de audio. Llámalo dentro de un clic (política de autoplay). */
export function prepararAudio() {
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    if (!ctx) ctx = new C();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    ctx = null;
  }
}

export function tocarCampana() {
  if (!ctx) return;
  try {
    const ahora = ctx.currentTime;
    // Tres notas suaves y descendentes: mi, do, sol.
    [
      [659.25, 0],
      [523.25, 0.35],
      [783.99, 0.7],
    ].forEach(([f, t]) => {
      const osc = ctx.createOscillator();
      const gan = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gan.gain.setValueAtTime(0, ahora + t);
      gan.gain.linearRampToValueAtTime(0.14, ahora + t + 0.03);
      gan.gain.exponentialRampToValueAtTime(0.0001, ahora + t + 1.4);
      osc.connect(gan).connect(ctx.destination);
      osc.start(ahora + t);
      osc.stop(ahora + t + 1.5);
    });
  } catch {
    /* sin sonido, no pasa nada */
  }
}
