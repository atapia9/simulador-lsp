// Catálogo mínimo para las pruebas (independiente de los datos reales).
export const CAT = new Map(
  [
    { id: 'l1x1', ancho: 1, fondo: 1, alto: 3 },
    { id: 'l2x4', ancho: 4, fondo: 2, alto: 3 },
    { id: 'p2x2', ancho: 2, fondo: 2, alto: 1 },
    { id: 'p4x4', ancho: 4, fondo: 4, alto: 1 },
  ].map((d) => [d.id, d]),
);
export const pieza = (tipo, x, y, z, rot = 0, color = '#C8102E') => ({ tipo, x, y, z, rot, color });
