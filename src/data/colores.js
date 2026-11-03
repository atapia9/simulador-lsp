// Paleta de 12 colores con nombre en español.
// Los botones de color muestran el nombre en su etiqueta accesible y en el
// texto de ayuda, así no dependes solo del color para distinguirlos.

export const COLORES = [
  { id: 'rojo', nombre: 'Rojo', hex: '#C8102E' },
  { id: 'naranja', nombre: 'Naranja', hex: '#E8711C' },
  { id: 'amarillo', nombre: 'Amarillo', hex: '#F5C518' },
  { id: 'verde', nombre: 'Verde', hex: '#2E8B57' },
  { id: 'azul-cielo', nombre: 'Azul cielo', hex: '#4FA3E0' },
  { id: 'azul', nombre: 'Azul', hex: '#1D4E9E' },
  { id: 'morado', nombre: 'Morado', hex: '#6F42C1' },
  { id: 'rosa', nombre: 'Rosa', hex: '#D6336C' },
  { id: 'cafe', nombre: 'Café', hex: '#7A4E2D' },
  { id: 'blanco', nombre: 'Blanco', hex: '#F2F2EE' },
  { id: 'gris', nombre: 'Gris', hex: '#8A9099' },
  { id: 'negro', nombre: 'Negro', hex: '#22262B' },
];

export const COLOR_INICIAL = '#C8102E';

/** Devuelve el nombre del color o el código si no está en la paleta. */
export function nombreColor(hex) {
  const c = COLORES.find((x) => x.hex.toLowerCase() === String(hex).toLowerCase());
  return c ? c.nombre : String(hex);
}
