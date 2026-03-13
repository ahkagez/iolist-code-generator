# IO List Code Generator

Herramienta web para generar código PLC de TwinCAT 3 a partir de listas de I/O en formato Excel. Diseñada para ingenieros de automatización industrial que trabajan con entornos Beckhoff TwinCAT 3 (IEC 61131-3).

---

## ¿Qué hace?

Lee un archivo Excel con la configuración de entradas/salidas de hardware y genera automáticamente:

- **GVL** — Variables globales (IO_Tags, tags internos, Modbus, subsistemas)
- **Alarm_tags** — Declaraciones de alarmas digitales y analógicas
- **Alarms PRG** — Código de programa para gestión de alarmas
- **IO_Tags.xml / GVL.xml / Alarm_tags.xml** — Archivos XML compatibles con TwinCAT (formato PLCopen)
- **Alarms.tmc** — Declaraciones de eventos para TwinCAT Module Configuration

---

## Uso

1. Abre `index.html` en el navegador (no requiere servidor).
2. Arrastra o selecciona tu archivo Excel (`.xlsx`, `.xls`, `.xlsm`).
3. La herramienta detecta automáticamente la fila de cabecera buscando las columnas `NAME` y `ALARM`.
4. Navega por las pestañas del sidebar para ver el código generado.
5. Copia el código al portapapeles o descarga los archivos XML/TMC directamente.

---

## Estructura del proyecto

```
1-Proyect/
├── index.html          # Interfaz de usuario (Vue 3)
├── config.js           # Configuración centralizada (temas, colores, ajustes)
├── css/
│   └── styles.css      # Estilos completos con variables CSS
└── js/
    ├── app.js           # Punto de entrada Vue 3, estado reactivo, coordinación
    ├── generators.js    # Motor de generación de código (lógica principal)
    ├── excel-helpers.js # Utilidades para procesar datos del Excel
    ├── plc-helpers.js   # Formateo y resaltado de sintaxis PLC
    ├── templates.js     # Plantillas XML estáticas (PLCopen / TwinCAT)
    ├── xml-builders.js  # Construcción de XML y descarga de archivos
    └── theme.js         # Gestión de temas (aplica variables CSS desde config)
```

### Descripción de cada archivo

| Archivo | Responsabilidad |
|---------|----------------|
| `index.html` | Plantilla HTML con Vue 3. Define la UI completa: pantalla de carga, sidebar de navegación y ventanas de código. |
| `config.js` | Toda la configuración en un solo lugar: colores de tema claro/oscuro, colores de sintaxis PLC, fuente del editor, fila de cabecera en Excel, nombre de hoja preferido. |
| `js/app.js` | Inicializa la app Vue 3. Gestiona el estado (pantalla activa, tema, archivos cargados, salidas generadas), la subida de archivos y el portapapeles. |
| `js/generators.js` | El núcleo. Parsea el Excel fila a fila, identifica tipos de tag por sufijo (`_DI`, `_DO`, `_AI`, `_AO`), y construye todas las declaraciones PLC y bloques de código de alarmas. |
| `js/excel-helpers.js` | Funciones de bajo nivel para limpiar celdas, normalizar cabeceras, detectar marcas de alarma y localizar la fila de cabecera. |
| `js/plc-helpers.js` | Alinea declaraciones de variables en columnas, y resalta la sintaxis PLC (keywords, tipos, comentarios, direcciones hardware `%IX`, pragmas). |
| `js/templates.js` | Cadenas de texto con las plantillas XML completas para `IO_Tags.xml`, `Alarm_tags.xml` y el archivo `.tmc`. |
| `js/xml-builders.js` | Inserta el código generado en las plantillas XML, escapa caracteres especiales y ofrece funciones de descarga como Blob. |
| `js/theme.js` | Lee `config.js` y aplica los valores como propiedades CSS personalizadas (`--sidebar-bg`, `--plc-kw`, etc.) al cambiar de tema. |

---

## Tecnologías

| Tecnología | Uso |
|------------|-----|
| [Vue 3](https://vuejs.org/) | Framework frontend (cargado via CDN) |
| [SheetJS (XLSX)](https://sheetjs.com/) | Parseo de archivos Excel |
| CSS3 | Variables CSS, Grid, Flexbox, animaciones |
| TwinCAT PLCopen XML | Formato de salida compatible con TwinCAT 3.5 |
| IEC 61131-3 | Estándar de programación PLC (ST — Structured Text) |

> No requiere instalación ni dependencias locales. Todo funciona directamente en el navegador.

---

## Configuración

Edita `config.js` para personalizar el comportamiento sin tocar el resto del código:

```js
// Fila donde está la cabecera en el Excel (por defecto, fila 10)
HEADER_ROW: 10,

// Nombre de la hoja a buscar primero
PREFERRED_SHEET: 'IO-list',

// Fuente y tamaño del editor de código
editor: { fontFamily: 'Consolas', fontSize: '13px', lineHeight: '1.7' },

// Colores del tema oscuro y claro
themes: { dark: { ... }, light: { ... } },

// Colores de resaltado de sintaxis PLC
syntax: { keyword: '#569cd6', type: '#4ec9b0', ... }
```

---

## Columnas esperadas en el Excel

La herramienta busca automáticamente las columnas por nombre (no por posición). Las columnas clave son:

| Columna | Descripción |
|---------|-------------|
| `NAME` | Nombre del tag PLC |
| `ALARM` | Marca `x` para indicar que la fila es una alarma |
| `DESCRIPTION` | Descripción del tag |
| Sufijos `_DI / _DO / _AI / _AO` | Determinan si el tag es entrada/salida digital/analógica y generan la declaración `AT %IX` / `AT %QX` correspondiente |

---

## Características destacadas

- **Deteccion automatica de tipo de tag** por sufijo en el nombre
- **Alarmas digitales y analogicas**: para analógicas genera hasta 4 umbrales (LowLow, Low, High, HighHigh) con habilitación y retardo independientes
- **Escalado de entradas analógicas**: genera el bloque `VariableScale` con `RawZero/RawFull/ScaledZero/ScaledFull`
- **Resaltado de sintaxis PLC** en tiempo real en el editor
- **Tema claro/oscuro** con transición suave
- **Panel de debug** con estadísticas de generación (filas procesadas, número de alarmas, etc.)
- **Sin backend**: todo el procesamiento ocurre en el navegador del cliente
