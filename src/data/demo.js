// Modelo de ejemplo que se carga en la primera visita o con "Cargar demo".

export const DEMO = {
  nombre: 'Demo: el equipo ideal',
  pregunta: '¿Cómo se ve el equipo ideal para tu proyecto?',
  historia:
    'En el centro estamos las personas del equipo, paradas sobre una base común: el propósito que nos une. ' +
    'A un lado hay una torre con una bandera arriba; es la meta y todos la pueden ver desde donde estén. ' +
    'La escalera nos recuerda que avanzamos paso a paso. El arco es el puente con otras áreas, ' +
    'y el vehículo rojo es nuestra capacidad de movernos rápido cuando hace falta. ' +
    'El árbol y las plantas hablan de cuidarnos, y el signo de interrogación dice que aquí preguntar está bien visto.',
  reflexion: '',
  piezas: [
    { tipo: 'placa-4x4', x: 12, y: 0, z: 12, rot: 0, color: '#8A9099', significado: 'Una base común: el propósito que compartimos' },
    { tipo: 'figura', x: 12, y: 1, z: 12, rot: 0, color: '#1D4E9E', significado: 'Personas distintas, cada una con su estilo' },
    { tipo: 'figura', x: 15, y: 1, z: 12, rot: 0, color: '#E8711C' },
    { tipo: 'figura-chica', x: 12, y: 1, z: 15, rot: 0, color: '#2E8B57' },
    { tipo: 'figura', x: 15, y: 1, z: 15, rot: 0, color: '#6F42C1' },
    { tipo: 'ladrillo-2x2', x: 20, y: 0, z: 12, rot: 0, color: '#1D4E9E' },
    { tipo: 'ladrillo-2x2', x: 20, y: 3, z: 12, rot: 0, color: '#4FA3E0' },
    { tipo: 'ladrillo-2x2', x: 20, y: 6, z: 12, rot: 0, color: '#1D4E9E' },
    { tipo: 'bandera', x: 20, y: 9, z: 12, rot: 0, color: '#C8102E', significado: 'La meta, visible para todas las personas' },
    { tipo: 'arco', x: 6, y: 0, z: 18, rot: 0, color: '#E8711C', significado: 'Puentes para colaborar con otras áreas' },
    { tipo: 'ventana-1x2', x: 6, y: 0, z: 10, rot: 0, color: '#F2F2EE', significado: 'Una ventana abierta a ideas de fuera' },
    { tipo: 'escalera', x: 24, y: 0, z: 18, rot: 0, color: '#F5C518', significado: 'Crecemos paso a paso' },
    { tipo: 'arbol', x: 6, y: 0, z: 24, rot: 0, color: '#2E8B57', significado: 'Cuidar el bienestar del equipo' },
    { tipo: 'interrogacion', x: 16, y: 0, z: 22, rot: 0, color: '#6F42C1', significado: 'Las preguntas son bienvenidas' },
    { tipo: 'cara', x: 22, y: 0, z: 24, rot: 0, color: '#F5C518', significado: 'Buen humor en los días pesados' },
    { tipo: 'ruedas-2x4', x: 10, y: 0, z: 22, rot: 0, color: '#22262B' },
    { tipo: 'ladrillo-2x4', x: 10, y: 3, z: 22, rot: 1, color: '#C8102E', significado: 'Movernos rápido cuando el cliente lo necesita' },
    { tipo: 'planta', x: 5, y: 0, z: 27, rot: 0, color: '#2E8B57' },
    { tipo: 'flor', x: 8, y: 0, z: 27, rot: 0, color: '#D6336C' },
    { tipo: 'trans-2x2', x: 20, y: 0, z: 16, rot: 0, color: '#4FA3E0', significado: 'Transparencia: todos sabemos cómo vamos' },
  ],
};
