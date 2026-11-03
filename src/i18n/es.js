// Textos de la interfaz en español de México (tuteo).
// Si quieres traducir la app, copia este archivo y cambia los textos.

export const T = {
  app: {
    nombre: 'Simulador LSP',
    lema: 'Construye, cuenta y reflexiona',
    cargando: 'Cargando el simulador…',
    sinWebGL:
      'Tu navegador no pudo iniciar los gráficos 3D (WebGL). Prueba con una versión reciente de Chrome, Edge, Firefox o Safari.',
  },

  barra: {
    taller: 'Modo Taller',
    tallerAyuda: 'Abre la guía de 4 pasos para facilitar una sesión',
    calentamiento: 'Calentamiento',
    calentamientoAyuda: 'Ejercicios cortos para practicar antes del reto',
    galeria: 'Galería',
    galeriaAyuda: 'Guarda, carga, importa y exporta modelos',
    demo: 'Cargar demo',
    demoAyuda: 'Carga un modelo de ejemplo con su historia',
    recorrido: 'Recorrido',
    recorridoAyuda: 'Haz un recorrido guiado por la interfaz',
    temaClaro: 'Cambiar a tema claro',
    temaOscuro: 'Cambiar a tema oscuro',
    atajos: 'Atajos de teclado (?)',
    presentacion: 'Modo presentación',
    presentacionAyuda: 'Pantalla completa con texto grande para proyectar',
    salirPresentacion: 'Salir de presentación',
  },

  herramientas: {
    grupo: 'Herramientas de construcción',
    seleccionar: 'Seleccionar (Esc)',
    deshacer: 'Deshacer (Ctrl+Z)',
    rehacer: 'Rehacer (Ctrl+Y)',
    rotar: 'Girar 90° (R)',
    mover: 'Mover pieza (M)',
    duplicar: 'Duplicar pieza (D)',
    eliminar: 'Eliminar pieza (Supr)',
    significado: 'Agregar significado (S)',
    restablecerVista: 'Restablecer vista',
    limpiar: 'Limpiar todo',
    contador: (n) => (n === 1 ? '1 pieza' : `${n} piezas`),
  },

  paleta: {
    titulo: 'Piezas',
    colores: 'Colores',
    colorActual: (nombre) => `Color actual: ${nombre}`,
    categoria: (n, nombre) => `${nombre} (tecla ${n})`,
    elegir: (nombre) => `Elegir ${nombre}`,
  },

  categorias: {
    ladrillos: 'Ladrillos',
    placas: 'Placas',
    inclinados: 'Inclinados',
    transparentes: 'Transparentes',
    ruedas: 'Ruedas',
    ventanas: 'Ventanas y puertas',
    naturaleza: 'Naturaleza',
    figuras: 'Figura genérica',
    especiales: 'Especiales',
  },

  estado: {
    seleccion: 'Haz clic en una pieza para seleccionarla, o elige una pieza de la paleta.',
    colocar: (nombre) =>
      `Colocando: ${nombre}. Haz clic para poner la pieza, R para girar, Esc para terminar.`,
    mover: (nombre) => `Moviendo: ${nombre}. Haz clic en el nuevo lugar o pulsa Esc para cancelar.`,
    seleccionada: (nombre) => `Seleccionada: ${nombre}.`,
    compartir: 'Paso Compartir: haz clic en cualquier pieza para darle un significado.',
    tecladoCursor: 'Usa las flechas para mover la vista previa y Enter para colocar.',
  },

  avisos: {
    fuera: 'La pieza no cabe dentro de la base.',
    choque: 'Ahí ya hay otra pieza.',
    sinApoyo: 'La pieza necesita apoyarse en algo.',
    muyAlto: 'Llegaste a la altura máxima.',
    noCabeGiro: 'Al girarla, la pieza choca con otra. Muévela primero.',
    seleccionaPrimero: 'Primero selecciona una pieza.',
    sinDeshacer: 'No hay nada que deshacer.',
    sinRehacer: 'No hay nada que rehacer.',
    deshecho: 'Acción deshecha.',
    rehecho: 'Acción rehecha.',
    eliminada: 'Pieza eliminada.',
    limpio: 'Base limpia. Puedes deshacer si fue un error.',
    guardado: (nombre) => `Guardaste “${nombre}” en la galería.`,
    cargado: (nombre) => `Cargaste “${nombre}”.`,
    omitidas: (n) => `${n} pieza(s) no se pudieron colocar porque chocaban o estaban fuera de la base.`,
    exportado: 'Archivo descargado.',
    importado: 'Modelo importado.',
    copiado: 'Resumen copiado al portapapeles.',
    noCopiado: 'No se pudo copiar. Selecciona el texto y cópialo a mano.',
    sinAlmacen:
      'Tu navegador no permite guardar datos locales. Puedes usar la app, pero exporta tus modelos a JSON para no perderlos.',
    almacenLleno: 'No hay espacio para guardar. Elimina modelos viejos de la galería o exporta a JSON.',
    tiempo: '¡Se acabó el tiempo! Terminen la idea que tienen en las manos.',
    enlaceCopiado: 'Enlace copiado. Quien lo abra verá este modelo.',
    enlaceGrande: 'El modelo es muy grande para compartirlo por enlace. Usa Exportar JSON.',
    enlaceCargado: 'Cargaste un modelo compartido por enlace.',
    enlaceInvalido: 'El enlace compartido está dañado o incompleto.',
    demoCargada: 'Cargaste el modelo de ejemplo.',
  },

  dialogo: {
    aceptar: 'Aceptar',
    cancelar: 'Cancelar',
    cerrar: 'Cerrar',
    guardar: 'Guardar',
    confirmarLimpiar: '¿Quieres quitar todas las piezas de la base? Puedes deshacerlo con Ctrl+Z.',
    confirmarLimpiarTitulo: 'Limpiar todo',
    confirmarCargar: 'Se reemplazará el modelo actual. ¿Quieres continuar?',
    confirmarCargarTitulo: 'Cargar modelo',
    confirmarEliminar: (nombre) => `¿Eliminar “${nombre}” de la galería? Esto no se puede deshacer.`,
    confirmarEliminarTitulo: 'Eliminar modelo',
    significadoTitulo: 'Significado de la pieza',
    significadoAyuda:
      '¿Qué representa esta pieza en tu historia? Escribe una frase corta (por ejemplo: “la confianza que nos sostiene”). Déjalo vacío para quitarlo.',
    significadoEtiqueta: 'Significado',
  },

  atajos: {
    titulo: 'Atajos de teclado',
    lista: [
      ['1 – 9', 'Abrir una categoría de la paleta'],
      ['Clic', 'Colocar la pieza o seleccionar una existente'],
      ['R', 'Girar 90° la pieza (nueva o seleccionada)'],
      ['M', 'Mover la pieza seleccionada'],
      ['D', 'Duplicar la pieza seleccionada'],
      ['S', 'Agregar significado a la pieza seleccionada'],
      ['Supr / Delete', 'Eliminar la pieza seleccionada'],
      ['Ctrl + Z', 'Deshacer'],
      ['Ctrl + Y / Ctrl + Shift + Z', 'Rehacer'],
      ['Esc', 'Cancelar la acción actual'],
      ['Flechas + Enter', 'Mover la vista previa y colocar con el teclado'],
      ['Arrastrar', 'Girar la cámara (clic derecho o dos dedos: desplazar)'],
      ['Rueda / pellizco', 'Acercar o alejar'],
      ['?', 'Mostrar u ocultar esta ayuda'],
    ],
    tactil:
      'En tableta: toca para colocar o seleccionar; usa los botones de la barra para girar y eliminar.',
  },

  taller: {
    titulo: 'Modo Taller',
    cerrar: 'Cerrar Modo Taller',
    pasos: ['Reto', 'Construcción', 'Compartir', 'Reflexión'],
    pasoDe: (n, total) => `Paso ${n} de ${total}`,
    anterior: 'Anterior',
    siguiente: 'Siguiente',
    terminar: 'Terminar',
    reto: {
      intro:
        'Todo empieza con una buena pregunta. Escribe un reto abierto que invite a construir y no tenga una sola respuesta correcta.',
      etiqueta: 'Pregunta del reto',
      placeholder: 'Ejemplo: ¿Cómo se ve tu equipo cuando trabaja en su mejor momento?',
      ejemplos: 'O elige una pregunta de ejemplo',
      elige: '— Elige una pregunta —',
      usar: 'Usar esta pregunta',
      consejo:
        'Consejo: lee la pregunta en voz alta dos veces y asegúrate de que todas las personas la entienden antes de empezar.',
    },
    construccion: {
      intro:
        'Construyan su respuesta sin planearla demasiado. Confía en tus manos: elige piezas que te llamen la atención y deja que la idea aparezca.',
      minutos: 'Minutos',
      iniciar: 'Iniciar',
      pausar: 'Pausar',
      reanudar: 'Reanudar',
      reiniciar: 'Reiniciar',
      sonido: 'Sonido suave al terminar',
      progreso: 'Tiempo transcurrido',
      terminado: '¡Tiempo!',
      recordatorio: 'Recuerda el reto:',
      sinPregunta: 'Aún no hay pregunta. Regresa al paso 1 para escribirla.',
    },
    compartir: {
      intro:
        'Cada constructor cuenta la historia de su modelo. Quienes escuchan preguntan por las piezas, no por la persona.',
      historia: 'Historia del modelo',
      historiaPlaceholder: 'Mi modelo muestra…',
      instruccion:
        'Haz clic en cualquier pieza del modelo para ponerle un significado. Aparecerá un marcador numerado en 3D.',
      significados: 'Significados',
      sinSignificados: 'Todavía no hay significados. Haz clic en una pieza para agregar uno.',
      editar: 'Editar',
      quitar: 'Quitar',
      ir: (n) => `Seleccionar la pieza ${n}`,
    },
    reflexion: {
      intro:
        'Cierren la ronda conectando el modelo con la realidad. Estas preguntas ayudan a ir más allá de la primera impresión:',
      preguntas: [
        '¿Qué pieza te sorprendió más cuando contaste tu historia?',
        '¿Qué aparece en tu modelo que no habías dicho antes en voz alta?',
        'Si quitaras una sola pieza, ¿cuál cambiaría más el significado?',
        '¿Qué patrón ves en común con los modelos de otras personas?',
        '¿Qué primer paso concreto te llevas para mañana?',
      ],
      notas: 'Notas de reflexión',
      notasPlaceholder: 'Ideas clave, acuerdos y siguientes pasos…',
      resumen: 'Resumen',
      pregunta: 'Pregunta',
      historia: 'Historia',
      significados: 'Significados',
      vacio: '(sin escribir)',
      copiar: 'Copiar resumen',
      guardar: 'Guardar en galería',
    },
  },

  calentamiento: {
    titulo: 'Calentamiento',
    intro:
      'Antes del reto principal, haz uno o dos ejercicios cortos. Sirven para soltar las manos y practicar cómo contar una historia con piezas.',
    minutos: (n) => `${n} min`,
    iniciar: 'Iniciar',
    pausar: 'Pausar',
    reanudar: 'Reanudar',
    reiniciar: 'Reiniciar',
  },

  galeria: {
    titulo: 'Galería y archivos',
    guardarTitulo: 'Guardar el modelo actual',
    nombre: 'Nombre del modelo',
    nombrePlaceholder: 'Ejemplo: Equipo de ventas – marzo',
    guardar: 'Guardar',
    guardados: 'Modelos guardados',
    vacia: 'Aún no guardas ningún modelo.',
    cargar: 'Cargar',
    exportar: 'Exportar JSON',
    eliminar: 'Eliminar',
    piezas: (n) => (n === 1 ? '1 pieza' : `${n} piezas`),
    archivos: 'Archivos',
    exportarActual: 'Exportar modelo actual (JSON)',
    importar: 'Importar modelo (JSON)',
    png: 'Descargar imagen (PNG)',
    enlace: 'Copiar enlace para compartir',
    enlaceAyuda: 'Funciona con modelos pequeños (hasta unas 150 piezas).',
    sinNombre: 'Modelo sin nombre',
    sinAlmacen: 'El guardado local no está disponible en este navegador. Usa Exportar JSON.',
  },

  errores: {
    jsonInvalido: 'El archivo no es un JSON válido. ¿Seguro que lo exportaste desde este simulador?',
    noEsObjeto: 'El archivo no contiene un modelo.',
    formato: 'El archivo no parece ser un modelo de este simulador.',
    version: 'Al archivo le falta el número de versión.',
    versionNueva: (v) =>
      `El archivo usa la versión ${v} del formato, que es más nueva que esta app. Actualiza la página e inténtalo de nuevo.`,
    sinPiezas: 'El archivo no tiene una lista de piezas.',
    demasiadas: (max) => `El modelo tiene más de ${max} piezas; es demasiado grande.`,
    texto: (campo) => `El campo “${campo}” debe ser texto.`,
    pieza: (i, motivo) => `Pieza ${i + 1}: ${motivo}`,
    tipo: (t) => `el tipo “${t}” no existe`,
    coordenada: (c) => `la coordenada ${c} no es válida`,
    rotacion: 'la rotación debe ser 0, 1, 2 o 3',
    color: 'el color no es válido',
    significado: 'el significado debe ser texto corto',
    archivoGrande: 'El archivo es demasiado grande (máximo 2 MB).',
    lectura: 'No se pudo leer el archivo.',
    mas: (n) => `…y ${n} problema(s) más.`,
    titulo: 'No se pudo importar',
  },

  bienvenida: {
    titulo: 'Te damos la bienvenida',
    texto:
      'Cargamos un modelo de ejemplo para que veas cómo funciona. Puedes explorarlo, hacer un recorrido guiado o empezar con la base vacía.',
    recorrido: 'Hacer recorrido',
    vacio: 'Empezar en blanco',
    cerrar: 'Cerrar aviso',
  },

  movil: {
    texto:
      'Estás en una pantalla pequeña. Puedes probar el simulador, pero funciona mejor en una tableta o computadora.',
    cerrar: 'Entendido',
  },

  tour: {
    saltar: 'Saltar recorrido',
    anterior: 'Anterior',
    siguiente: 'Siguiente',
    terminar: 'Terminar',
    paso: (n, total) => `${n} / ${total}`,
    pasos: [
      {
        titulo: '1. Elige piezas',
        texto:
          'Aquí están las piezas por categoría y los colores. Elige una pieza y luego haz clic en la base para ponerla.',
      },
      {
        titulo: '2. Construye en 3D',
        texto:
          'La vista previa se pone verde donde la pieza cabe y roja donde no. Arrastra para girar la cámara y usa la rueda para acercarte.',
      },
      {
        titulo: '3. Edita tu modelo',
        texto:
          'Con una pieza seleccionada puedes girarla, moverla, duplicarla, cambiarle el color o eliminarla. También puedes deshacer.',
      },
      {
        titulo: '4. Facilita con el Modo Taller',
        texto:
          'Te guía por los 4 pasos: reto, construcción con temporizador, compartir la historia y reflexión.',
      },
      {
        titulo: '5. Guarda y comparte',
        texto:
          'En la Galería guardas tus modelos en este navegador, exportas a JSON o descargas una imagen.',
      },
      {
        titulo: '6. Atajos y ayuda',
        texto:
          'Pulsa ? para ver los atajos de teclado. Puedes repetir este recorrido cuando quieras.',
      },
    ],
  },

  pie: {
    aviso:
      'LEGO® y SERIOUS PLAY® son marcas registradas de LEGO Group. Este es un proyecto independiente, no afiliado ni respaldado por LEGO Group. Se basa en la guía de código abierto LEGO® SERIOUS PLAY® Open-Source publicada por LEGO Group bajo la licencia ',
    licencia: 'CC BY-SA 3.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    privacidad: 'Tus modelos se guardan solo en este navegador.',
  },
};
