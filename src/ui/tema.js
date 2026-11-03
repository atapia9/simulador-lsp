// Tema claro/oscuro: sigue al sistema hasta que la persona elige uno.

const consulta = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;

export function crearTema(almacen, alCambiar) {
  let elegido = almacen.leer('tema', null); // 'claro' | 'oscuro' | null

  const actual = () => elegido ?? (consulta?.matches ? 'oscuro' : 'claro');

  function aplicar() {
    document.documentElement.dataset.tema = actual();
    alCambiar?.(actual());
  }

  consulta?.addEventListener?.('change', () => {
    if (!elegido) aplicar();
  });

  aplicar();

  return {
    actual,
    alternar() {
      elegido = actual() === 'oscuro' ? 'claro' : 'oscuro';
      almacen.escribir('tema', elegido);
      aplicar();
    },
  };
}

/** Lee los colores de la escena desde las variables CSS del tema activo. */
export function coloresEscena() {
  const css = getComputedStyle(document.documentElement);
  const v = (n) => css.getPropertyValue(n).trim();
  return { fondo: v('--escena-fondo') || '#dfe7ef', base: v('--escena-base') || '#5e9c5a', rejilla: v('--escena-rejilla') || '#2f5e2c' };
}
