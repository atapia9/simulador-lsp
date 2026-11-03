// Iconos SVG simples de trazo (diseño propio, 24 × 24).

const P = {
  seleccionar: ['M5 3l6.5 16 2.3-6.7L20.5 10z'],
  deshacer: ['M9 14 4 9l5-5', 'M4 9h11a5 5 0 0 1 0 10h-4'],
  rehacer: ['m15 14 5-5-5-5', 'M20 9H9a5 5 0 0 0 0 10h4'],
  rotar: ['M20 12a8 8 0 1 1-2.6-5.9', 'M20 4v5h-5'],
  mover: ['M12 3v18', 'M3 12h18', 'm9 6 3-3 3 3', 'm9 18 3 3 3-3', 'm6 9-3 3 3 3', 'm18 9 3 3-3 3'],
  duplicar: ['M9 9h11v11H9z', 'M5 15H4V4h11v1'],
  eliminar: ['M4 7h16', 'M10 11v6', 'M14 11v6', 'M6 7l1 13h10l1-13', 'M9 7V4h6v3'],
  significado: ['M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z', 'M7.5 7.5h.01'],
  vista: ['M3 11.5 12 4l9 7.5', 'M5.5 9.5V20h13V9.5'],
  limpiar: ['M15.5 3.5l5 5L10 19H5l-2-2a1.5 1.5 0 0 1 0-2.1z', 'M10 19h11', 'M8.5 10.5l5 5'],
  taller: ['M4 6h3', 'M10 6h10', 'M4 12h3', 'M10 12h10', 'M4 18h3', 'M10 18h10'],
  reloj: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
  galeria: ['M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z'],
  demo: ['M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.6l-5.3 2.8 1.2-6-4.5-4.1 6-.7z'],
  recorrido: ['M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z', 'M9 4v14', 'M15 6v14'],
  sol: ['M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M12 2v2', 'M12 20v2', 'M4.9 4.9l1.4 1.4', 'M17.7 17.7l1.4 1.4', 'M2 12h2', 'M20 12h2', 'M4.9 19.1l1.4-1.4', 'M17.7 6.3l1.4-1.4'],
  luna: ['M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5a6.5 6.5 0 0 0 10 10z'],
  ayuda: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M9.3 9a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.6-2.7 4', 'M12 17.5h.01'],
  presentacion: ['M3 4h18v12H3z', 'M8 20h8', 'M12 16v4'],
  cerrar: ['M6 6l12 12', 'M18 6 6 18'],
  descargar: ['M12 4v11', 'm7 10 5 5 5-5', 'M4 20h16'],
  subir: ['M12 20V9', 'm7 14 5-5 5 5', 'M4 4h16'],
  imagen: ['M3 5h18v14H3z', 'm3 16 5-5 4 4 3-3 6 6', 'M15.5 9.5h.01'],
  enlace: ['M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1', 'M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1'],
  guardar: ['M5 3h11l4 4v14H5z', 'M8 3v5h7', 'M8 21v-7h8v7'],
  play: ['M7 4l13 8-13 8z'],
  pausa: ['M7 4h3v16H7z', 'M14 4h3v16h-3z'],
  copiar: ['M9 9h11v11H9z', 'M5 15H4V4h11v1'],
};

export function icono(nombre, clase = 'icono') {
  const trazos = (P[nombre] || []).map((d) => `<path d="${d}"/>`).join('');
  return `<svg class="${clase}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${trazos}</svg>`;
}
