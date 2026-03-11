/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║          I/O List Code Generator — Configuration File          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Edita este archivo para personalizar la herramienta.
 * No necesitas saber CSS, HTML ni JavaScript.
 *
 * ── COLORES ─────────────────────────────────────────────────────────
 * Puedes usar cualquiera de estos formatos:
 *   '#ff0000'          →  código hexadecimal (el más común)
 *   'rgb(255, 0, 0)'   →  formato RGB
 *   'red'              →  nombre de color en inglés
 *
 * ── NÚMEROS ─────────────────────────────────────────────────────────
 * Escribe solo el número, sin comillas ni unidades.
 *   fontSize: 14       →  correcto
 *   fontSize: '14px'   →  incorrecto
 */

window.APP_CONFIG = {

  // ════════════════════════════════════════════════════════════════════
  //  TEMA CLARO  (se activa al hacer clic en el icono luna/sol)
  //  Mismas claves que 'theme' y 'syntax' — solo cambia los valores
  // ════════════════════════════════════════════════════════════════════
  themeLight: {
    bgMain:       '#f8fafc',
    bgSidebar:    '#f1f5f9',
    bgEditor:     '#ffffff',
    bgGutter:     '#f1f5f9',
    bgWindowBar:  '#e2e8f0',
    bgPanel:      '#e2e8f0',
    borderColor:  '#e2e8f0',
    borderDark:   '#cbd5e1',
    textMain:     '#0f172a',
    textCode:     '#334155',
    textMuted:    '#64748b',
    lineNumbers:  '#94a3b8',
    accent:       '#0284c7',
    uploadCardBg: 'rgba(213, 222, 238, 0.7)',
    uploadBtn:    '#0284c7',
    uploadBtnText: '#ffffff',
    uploadWave1:  '#0284c7',
    uploadWave2:  '#0369a1',
    yachtSail1:     '#7dd3fc',
    yachtSail2:     '#0f172a',
    yachtMast:      '#475569',
    yachtHullTop:   '#94a3b8',
    yachtWaterline: '#f8fafc',
    yachtHullBot:   '#64748b',
  },

  syntaxLight: {
    keyword:   '#0070c1',
    type:      '#267f99',
    comment:   '#008000',
    string:    '#a31515',
    number:    '#098658',
    hwAddress: '#795e26',
    attribute: '#af00db',
    xmlTag:    '#800000',
  },


  // ════════════════════════════════════════════════════════════════════
  //  CONFIGURACIÓN DE LA APLICACIÓN
  // ════════════════════════════════════════════════════════════════════
  app: {
    // Fila del Excel que contiene los encabezados de columna (NAME, Alarm, TYPE…)
    headerRowNumber: 10,

    // Nombre de la hoja de Excel que se usará
    // Si no existe esa hoja, se usará la primera que encuentre
    preferredSheetName: 'IO-list',
  },


  // ════════════════════════════════════════════════════════════════════
  //  EDITOR DE CÓDIGO  (los paneles de texto con el código PLC)
  // ════════════════════════════════════════════════════════════════════
  editor: {
    // Tipo de letra del editor
    fontFamily: 'Consolas, "Courier New", monospace',

    // Tamaño de la letra (en píxeles)
    fontSize: 13,

    // Espacio entre líneas
    //   1.0 = muy junto   |   1.7 = cómodo   |   2.0 = muy separado
    lineHeight: 1.7,

    // Ancho de un carácter TAB (en espacios)
    tabSize: 4,
  },


  // ════════════════════════════════════════════════════════════════════
  //  COLORES DE SINTAXIS PLC
  //  Qué color tiene cada elemento del código generado
  // ════════════════════════════════════════════════════════════════════
  syntax: {
    // Palabras clave:  VAR  END_VAR  IF  THEN  FOR  AT  RETAIN …
    keyword:   '#569cd6',

    // Tipos de datos:  BOOL  INT  REAL  DINT  STRING …
    type:      '#4ec9b0',

    // Comentarios:  // esto es un comentario  y  (* también esto *)
    comment:   '#6a9955',

    // Cadenas de texto:  'valor entre comillas'
    string:    '#ce9178',

    // Números:  0   1   3.14   16#FF
    number:    '#b5cea8',

    // Direcciones de hardware:  %IX0.0   %QX0.1   %IW2
    hwAddress: '#dcdcaa',

    // Atributos del compilador:  {attribute 'qualified_only'}
    attribute: '#c586c0',

    // Etiquetas XML  (sección Alarms.tmc):  <EventId>   <Name>
    xmlTag:    '#4da6ff',
  },


  // ════════════════════════════════════════════════════════════════════
  //  TEMA VISUAL  (colores generales de la interfaz)
  // ════════════════════════════════════════════════════════════════════
  theme: {
    // Fondo principal de la página
    bgMain:       '#0f172a',

    // Fondo de la barra lateral izquierda (menú de navegación)
    bgSidebar:    '#0d1117',

    // Fondo del editor de código
    bgEditor:     '#0d1117',

    // Fondo de la columna de números de línea
    bgGutter:     '#0a0e17',

    // Fondo de la barra de título de cada panel (donde están los botones Copy)
    bgWindowBar:  '#1e293b',

    // Fondo de tarjetas, píldoras y botones
    bgPanel:      '#1e293b',

    // Color de los bordes entre elementos
    borderColor:  '#1e293b',

    // Color de los bordes más marcados (separadores, bordes de ventana)
    borderDark:   '#334155',

    // Color del texto principal
    textMain:     '#f8fafc',

    // Color del texto dentro del editor (código sin resaltado)
    textCode:     '#adbac7',

    // Color del texto secundario (subtítulos, pistas)
    textMuted:    '#64748b',

    // Color de los números de línea del editor
    lineNumbers:  '#3d5063',

    // Color de acento: barra activa del menú, logo, botón de subir archivo
    accent:       '#38bdf8',

    // Fondo de la tarjeta de carga (pantalla inicial)
    uploadCardBg: 'rgba(30, 41, 59, 0.7)',

    // Color del botón de seleccionar archivo (pantalla inicial)
    uploadBtn:    '#0284c7',

    // Color del texto del botón de seleccionar archivo
    uploadBtnText: '#ffffff',

    // Olas del fondo (pantalla inicial)
    //   uploadWave1 = ola delantera (más clara, opaca al 50%)
    //   uploadWave2 = ola trasera (más oscura, opaca al 100%)
    uploadWave1:  '#0284c7',
    uploadWave2:  '#0369a1',

    // Barco (pantalla inicial)
    yachtSail1:     '#7dd3fc',   // vela izquierda (azul claro)
    yachtSail2:     '#f8fafc',   // vela derecha (blanca)
    yachtMast:      '#94a3b8',   // palo mayor
    yachtHullTop:   '#cbd5e1',   // cubierta del casco
    yachtWaterline: '#0f172a',   // línea de flotación (oscura)
    yachtHullBot:   '#334155',   // quilla / fondo del casco
  },

};
