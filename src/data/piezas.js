// Catálogo de piezas.
//
// Cada pieza se describe solo con datos; el código de render lee la "forma"
// y construye la geometría. Para agregar una pieza nueva, añade un objeto a
// PIEZAS (ver README → "Cómo agregar piezas nuevas").
//
// Unidades:
//   ancho  → espigas en el eje X (antes de girar)
//   fondo  → espigas en el eje Z (antes de girar)
//   alto   → altura en placas (1 ladrillo = 3 placas)
//
// Campos opcionales:
//   transparente: true   → material translúcido
//   color: '#rrggbb'     → color inicial al elegirla (si no, usa el color activo)

export const CATEGORIAS = [
  'ladrillos',
  'placas',
  'inclinados',
  'transparentes',
  'ruedas',
  'ventanas',
  'naturaleza',
  'figuras',
  'especiales',
];

export const PIEZAS = [
  // Ladrillos
  { id: 'ladrillo-1x1', nombre: 'Ladrillo 1×1', categoria: 'ladrillos', forma: 'ladrillo', ancho: 1, fondo: 1, alto: 3 },
  { id: 'ladrillo-1x2', nombre: 'Ladrillo 1×2', categoria: 'ladrillos', forma: 'ladrillo', ancho: 2, fondo: 1, alto: 3 },
  { id: 'ladrillo-1x4', nombre: 'Ladrillo 1×4', categoria: 'ladrillos', forma: 'ladrillo', ancho: 4, fondo: 1, alto: 3 },
  { id: 'ladrillo-2x2', nombre: 'Ladrillo 2×2', categoria: 'ladrillos', forma: 'ladrillo', ancho: 2, fondo: 2, alto: 3 },
  { id: 'ladrillo-2x3', nombre: 'Ladrillo 2×3', categoria: 'ladrillos', forma: 'ladrillo', ancho: 3, fondo: 2, alto: 3 },
  { id: 'ladrillo-2x4', nombre: 'Ladrillo 2×4', categoria: 'ladrillos', forma: 'ladrillo', ancho: 4, fondo: 2, alto: 3 },

  // Placas
  { id: 'placa-1x2', nombre: 'Placa 1×2', categoria: 'placas', forma: 'ladrillo', ancho: 2, fondo: 1, alto: 1 },
  { id: 'placa-2x2', nombre: 'Placa 2×2', categoria: 'placas', forma: 'ladrillo', ancho: 2, fondo: 2, alto: 1 },
  { id: 'placa-2x4', nombre: 'Placa 2×4', categoria: 'placas', forma: 'ladrillo', ancho: 4, fondo: 2, alto: 1 },
  { id: 'placa-4x4', nombre: 'Placa 4×4', categoria: 'placas', forma: 'ladrillo', ancho: 4, fondo: 4, alto: 1 },

  // Inclinados (la pendiente baja hacia el frente)
  { id: 'inclinado-1x2', nombre: 'Inclinado 1×2', categoria: 'inclinados', forma: 'inclinado', ancho: 1, fondo: 2, alto: 3 },
  { id: 'inclinado-2x2', nombre: 'Inclinado 2×2', categoria: 'inclinados', forma: 'inclinado', ancho: 2, fondo: 2, alto: 3 },
  { id: 'inclinado-4x2', nombre: 'Inclinado 4×2', categoria: 'inclinados', forma: 'inclinado', ancho: 4, fondo: 2, alto: 3 },
  { id: 'inclinado-2x3', nombre: 'Inclinado largo 2×3', categoria: 'inclinados', forma: 'inclinado', ancho: 2, fondo: 3, alto: 3 },

  // Transparentes
  { id: 'trans-1x1', nombre: 'Transparente 1×1', categoria: 'transparentes', forma: 'ladrillo', ancho: 1, fondo: 1, alto: 3, transparente: true },
  { id: 'trans-1x2', nombre: 'Transparente 1×2', categoria: 'transparentes', forma: 'ladrillo', ancho: 2, fondo: 1, alto: 3, transparente: true },
  { id: 'trans-2x2', nombre: 'Transparente 2×2', categoria: 'transparentes', forma: 'ladrillo', ancho: 2, fondo: 2, alto: 3, transparente: true },
  { id: 'trans-placa-2x2', nombre: 'Placa transparente 2×2', categoria: 'transparentes', forma: 'ladrillo', ancho: 2, fondo: 2, alto: 1, transparente: true },

  // Ruedas
  { id: 'ruedas-2x2', nombre: 'Base con 2 ruedas', categoria: 'ruedas', forma: 'ruedas', ancho: 2, fondo: 2, alto: 3 },
  { id: 'ruedas-2x4', nombre: 'Base con 4 ruedas', categoria: 'ruedas', forma: 'ruedas', ancho: 2, fondo: 4, alto: 3 },

  // Ventanas y puertas
  { id: 'ventana-1x2', nombre: 'Ventana 1×2', categoria: 'ventanas', forma: 'ventana', ancho: 2, fondo: 1, alto: 6 },
  { id: 'ventana-1x4', nombre: 'Ventana grande 1×4', categoria: 'ventanas', forma: 'ventana', ancho: 4, fondo: 1, alto: 9 },
  { id: 'puerta-1x2', nombre: 'Puerta', categoria: 'ventanas', forma: 'puerta', ancho: 2, fondo: 1, alto: 9 },

  // Naturaleza
  { id: 'arbol', nombre: 'Árbol', categoria: 'naturaleza', forma: 'arbol', ancho: 2, fondo: 2, alto: 13, color: '#2E8B57' },
  { id: 'planta', nombre: 'Planta', categoria: 'naturaleza', forma: 'planta', ancho: 1, fondo: 1, alto: 4, color: '#2E8B57' },
  { id: 'flor', nombre: 'Flor', categoria: 'naturaleza', forma: 'flor', ancho: 1, fondo: 1, alto: 4, color: '#D6336C' },

  // Figura genérica (diseño original, no es réplica de ninguna figura comercial)
  { id: 'figura', nombre: 'Figura', categoria: 'figuras', forma: 'figura', ancho: 1, fondo: 1, alto: 6 },
  { id: 'figura-chica', nombre: 'Figura pequeña', categoria: 'figuras', forma: 'figura', ancho: 1, fondo: 1, alto: 5, escala: 0.78 },

  // Especiales
  { id: 'bandera', nombre: 'Bandera', categoria: 'especiales', forma: 'bandera', ancho: 1, fondo: 1, alto: 12 },
  { id: 'escalera', nombre: 'Escalera', categoria: 'especiales', forma: 'escalera', ancho: 2, fondo: 3, alto: 9 },
  { id: 'arco', nombre: 'Arco 1×4', categoria: 'especiales', forma: 'arco', ancho: 4, fondo: 1, alto: 6 },
  { id: 'cara', nombre: 'Cara con ojos', categoria: 'especiales', forma: 'cara', ancho: 2, fondo: 2, alto: 3 },
  { id: 'interrogacion', nombre: 'Signo de interrogación', categoria: 'especiales', forma: 'interrogacion', ancho: 1, fondo: 1, alto: 6 },
];

/** Mapa id → definición, para buscar rápido. */
export const CATALOGO = new Map(PIEZAS.map((p) => [p.id, p]));
