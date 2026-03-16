# Arquitectura SOLID — Plataforma de Gestión Marítima

## Visión General

Plataforma web responsive (desktop + móvil) con mapa interactivo para gestionar ubicaciones (bases, oficinas, talleres, barcos), empleados, y registro de actividad (logs).

**Stack:** HTML + CSS (Frontend) · JavaScript vanilla (Lógica cliente) · MongoDB (Backend/DB)

> Necesitarás un servidor backend (Node.js + Express recomendado) para conectar JS con MongoDB. MongoDB no se conecta directamente desde el navegador.

---

## 1. Principios SOLID Aplicados

| Principio | Significado | Cómo se aplica aquí |
|---|---|---|
| **S** — Single Responsibility | Cada módulo/clase hace UNA sola cosa | Separar: Mapa, Empleados, Auth, Logs, API |
| **O** — Open/Closed | Abierto a extensión, cerrado a modificación | Nuevos tipos de punto (Dique, Puerto) sin tocar código existente |
| **L** — Liskov Substitution | Subtipos sustituibles por su tipo base | `Barco` y `Base` son ambos `Ubicacion`, intercambiables en el mapa |
| **I** — Interface Segregation | Interfaces pequeñas y específicas | No forzar a `Base` a implementar `moverCoordenadas()` si es fija |
| **D** — Dependency Inversion | Depender de abstracciones, no de implementaciones | Los módulos del mapa dependen de `UbicacionService`, no de MongoDB directamente |

---

## 2. Estructura de Carpetas

```
proyecto/
│
├── client/                         # FRONTEND
│   ├── index.html                  # Entry point
│   ├── login.html                  # Página de login
│   │
│   ├── css/
│   │   ├── variables.css           # Variables CSS (colores, tipografía, spacing)
│   │   ├── reset.css               # Reset/normalize
│   │   ├── layout.css              # Grid principal (mapa + sidebar)
│   │   ├── map.css                 # Estilos del mapa
│   │   ├── sidebar.css             # Panel lateral empleados
│   │   ├── modal.css               # Modales (detalle punto, edición)
│   │   ├── login.css               # Estilos login
│   │   └── responsive.css          # Media queries (móvil/tablet/desktop)
│   │
│   ├── js/
│   │   ├── app.js                  # Inicialización y orquestación
│   │   │
│   │   ├── config/
│   │   │   ├── constants.js        # URLs API, config mapa, estilos mapa
│   │   │   └── mapStyles.js        # Definiciones de estilos de mapa
│   │   │
│   │   ├── models/                 # (S) Modelos de datos — solo representación
│   │   │   ├── Ubicacion.js        # Clase base: id, nombre, coords, tipo
│   │   │   ├── Base.js             # Extiende Ubicacion (fija, sin drag)
│   │   │   ├── Barco.js            # Extiende Ubicacion (móvil, imágenes, drag)
│   │   │   ├── Empleado.js         # id, nombre, departamento, ubicacionActual
│   │   │   └── LogEntry.js         # userId, accion, timestamp, detalles
│   │   │
│   │   ├── services/               # (D) Capa de acceso a datos — abstracciones
│   │   │   ├── ApiClient.js        # Wrapper HTTP (fetch) — ÚNICO punto de contacto con API
│   │   │   ├── AuthService.js      # Login, logout, token management
│   │   │   ├── UbicacionService.js # CRUD ubicaciones (usa ApiClient)
│   │   │   ├── EmpleadoService.js  # CRUD empleados (usa ApiClient)
│   │   │   ├── LogService.js       # Registrar y consultar logs
│   │   │   └── CacheService.js     # LocalStorage/SessionStorage (estilo mapa, prefs)
│   │   │
│   │   ├── components/             # (S) Componentes UI — solo renderizado + eventos
│   │   │   ├── MapComponent.js     # Inicializa Leaflet/Mapbox, bindea markers
│   │   │   ├── MarkerFactory.js    # (O) Crea markers según tipo (Base vs Barco)
│   │   │   ├── Sidebar.js          # Lista empleados por departamento
│   │   │   ├── PointDetail.js      # Modal: info del punto, empleados, imágenes
│   │   │   ├── PointEditor.js      # Modal: editar coords, drag & drop
│   │   │   ├── MapStyleSelector.js # Selector de estilos + persistencia cache
│   │   │   ├── LoginForm.js        # Formulario login
│   │   │   └── LogViewer.js        # Vista de historial de logs
│   │   │
│   │   ├── controllers/            # (S) Orquestación — conectan servicios con componentes
│   │   │   ├── MapController.js    # Coordina mapa + markers + drag + click
│   │   │   ├── EmpleadoController.js # Coordina sidebar + filtros + preview ubicación
│   │   │   ├── AuthController.js   # Coordina login/logout + protección de rutas
│   │   │   └── LogController.js    # Coordina registro de acciones
│   │   │
│   │   └── utils/
│   │       ├── EventBus.js         # Pub/Sub para comunicación entre módulos
│   │       ├── validators.js       # Validación de coordenadas, inputs
│   │       └── formatters.js       # Formateo de fechas, duraciones, etc.
│   │
│   └── assets/
│       ├── icons/                  # Iconos markers (barco, base, oficina, taller)
│       └── img/
│
├── server/                         # BACKEND (Node.js + Express)
│   ├── server.js                   # Entry point del servidor
│   │
│   ├── config/
│   │   ├── db.js                   # Conexión MongoDB
│   │   └── env.js                  # Variables de entorno
│   │
│   ├── models/                     # Schemas MongoDB (Mongoose)
│   │   ├── Ubicacion.js            # Schema base con discriminator
│   │   ├── Empleado.js
│   │   ├── Usuario.js              # Auth: email, passwordHash, rol
│   │   └── Log.js
│   │
│   ├── routes/                     # (S) Cada recurso = su archivo de rutas
│   │   ├── auth.routes.js
│   │   ├── ubicaciones.routes.js
│   │   ├── empleados.routes.js
│   │   └── logs.routes.js
│   │
│   ├── controllers/                # (S) Lógica de cada endpoint
│   │   ├── auth.controller.js
│   │   ├── ubicaciones.controller.js
│   │   ├── empleados.controller.js
│   │   └── logs.controller.js
│   │
│   ├── services/                   # (S)(D) Lógica de negocio separada de HTTP
│   │   ├── auth.service.js         # Hashear password, verificar token
│   │   ├── ubicacion.service.js    # Lógica: crear, mover, listar por tipo
│   │   ├── empleado.service.js     # Lógica: asignar ubicación, listar por depto
│   │   └── log.service.js          # Lógica: registrar acción, calcular duración
│   │
│   └── middleware/
│       ├── auth.middleware.js      # Verificar JWT en rutas protegidas
│       ├── logger.middleware.js    # Log automático de peticiones
│       └── validator.middleware.js # Validación de body/params
│
└── package.json
```

---

## 3. Modelos de Datos (MongoDB Schemas)

### 3.1 Ubicación (Herencia con Discriminator)

```javascript
// server/models/Ubicacion.js
const ubicacionSchema = new Schema({
  nombre:      { type: String, required: true },
  tipo:        { type: String, enum: ['base', 'oficina', 'taller', 'barco'], required: true },
  coordenadas: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  esMovil:     { type: Boolean, default: false },  // (I) Solo barcos = true
  imagenes:    [{ url: String, descripcion: String }],
  activo:      { type: Boolean, default: true }
}, { timestamps: true, discriminatorKey: 'tipo' });

// Discriminator para Barco (extiende Ubicacion con campos extra)
const barcoSchema = new Schema({
  matricula:    String,
  eslora:       Number,
  propietario:  String
});

const Ubicacion = mongoose.model('Ubicacion', ubicacionSchema);
const Barco = Ubicacion.discriminator('barco', barcoSchema);
```

**Principio O + L:** Puedes añadir `Puerto`, `Dique`, etc. creando nuevos discriminators sin modificar el schema base. Todos son `Ubicacion` y funcionan igual en el mapa.

### 3.2 Empleado

```javascript
// server/models/Empleado.js
const empleadoSchema = new Schema({
  nombre:       { type: String, required: true },
  apellidos:    String,
  departamento: { type: String, enum: ['mecanica', 'electricidad', 'pintura', 'administracion', 'limpieza', 'otro'] },
  ubicacionActual: { type: Schema.Types.ObjectId, ref: 'Ubicacion', default: null },
  telefono:     String,
  avatar:       String,
  activo:       { type: Boolean, default: true }
}, { timestamps: true });
```

### 3.3 Usuario (Auth)

```javascript
// server/models/Usuario.js
const usuarioSchema = new Schema({
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  nombre:       String,
  rol:          { type: String, enum: ['admin', 'supervisor', 'operador'], default: 'operador' },
  empleadoRef:  { type: Schema.Types.ObjectId, ref: 'Empleado' }, // Vinculado a empleado
  activo:       { type: Boolean, default: true }
}, { timestamps: true });
```

### 3.4 Log (Registro de Actividad)

```javascript
// server/models/Log.js
const logSchema = new Schema({
  usuario:     { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  accion:      { type: String, enum: [
    'LOGIN', 'LOGOUT',
    'EMPLEADO_CREADO', 'EMPLEADO_EDITADO', 'EMPLEADO_MOVIDO',
    'UBICACION_CREADA', 'UBICACION_EDITADA', 'UBICACION_MOVIDA',
    'SESION_INICIO',    // Empleado marcó entrada en una ubicación
    'SESION_FIN'        // Empleado marcó salida
  ]},
  detalles:    { type: Schema.Types.Mixed },  // JSON flexible
  // Ejemplo detalles para SESION_FIN:
  // { empleadoId, ubicacionId, ubicacionNombre, inicio, fin, duracionMinutos }
  ip:          String,
  timestamp:   { type: Date, default: Date.now }
});

logSchema.index({ usuario: 1, timestamp: -1 });
logSchema.index({ accion: 1 });
logSchema.index({ 'detalles.empleadoId': 1 });
```

---

## 4. Flujos Clave (Cómo Aplica SOLID)

### 4.1 Click en un Punto del Mapa

```
Usuario hace click en marker
        │
        ▼
  MapComponent.js          (S) Solo detecta el click y emite evento
        │
        ▼
  EventBus.emit('point:selected', { ubicacionId })
        │
        ▼
  MapController.js         (S) Orquesta: pide datos al servicio
        │
        ▼
  UbicacionService.js      (D) Llama a ApiClient, no sabe de MongoDB
        │
        ▼
  ApiClient.js             (S) Hace fetch GET /api/ubicaciones/:id?populate=empleados
        │
        ▼
  PointDetail.js           (S) Renderiza modal con: nombre, empleados, imágenes
```

### 4.2 Drag de un Barco (Mover Coordenadas)

```
Usuario arrastra marker de barco
        │
        ▼
  MapComponent.js          Detecta 'dragend', extrae nuevas coords
        │
        ▼
  MapController.js         Verifica que esMovil === true (I)
        │                  Si no es móvil, cancela y revierte posición
        ▼
  UbicacionService.js      PUT /api/ubicaciones/:id/coordenadas
        │
        ▼
  [Backend]                ubicacion.controller → ubicacion.service → MongoDB
        │                  + log.service.registrar('UBICACION_MOVIDA', detalles)
        ▼
  EventBus.emit('ubicacion:actualizada')
        │
        ▼
  Sidebar actualiza vista previa de ubicación del empleado
```

### 4.3 Control de Tiempo (Sesiones en Ubicación)

```
Empleado "Juan" marca entrada en "Taller"
        │
        ▼
  POST /api/logs { accion: 'SESION_INICIO', detalles: { empleadoId, ubicacionId } }
        │
        ▼
  log.service.js crea registro con timestamp actual
  empleado.service.js actualiza ubicacionActual = tallerId
        │
        ▼
  ... (Juan trabaja 4 horas) ...
        │
        ▼
  Juan marca salida del "Taller"
        │
        ▼
  POST /api/logs { accion: 'SESION_FIN', detalles: { empleadoId, ubicacionId } }
        │
        ▼
  log.service.js:
    1. Busca último SESION_INICIO de Juan en Taller
    2. Calcula duración = ahora - inicio
    3. Guarda: { ...detalles, inicio, fin, duracionMinutos: 240 }
  empleado.service.js actualiza ubicacionActual = null
```

---

## 5. API REST — Endpoints

### Auth
```
POST   /api/auth/login          → { email, password } → { token, usuario }
POST   /api/auth/logout         → Invalida token + registra log
GET    /api/auth/me             → Datos del usuario autenticado
```

### Ubicaciones
```
GET    /api/ubicaciones                    → Lista todas (con filtro ?tipo=barco)
GET    /api/ubicaciones/:id                → Detalle + empleados asignados
POST   /api/ubicaciones                    → Crear nueva ubicación [admin]
PUT    /api/ubicaciones/:id                → Editar datos
PATCH  /api/ubicaciones/:id/coordenadas    → Mover coordenadas (solo si esMovil)
DELETE /api/ubicaciones/:id                → Desactivar [admin]
```

### Empleados
```
GET    /api/empleados                      → Lista (filtro ?departamento=X&ubicacion=Y)
GET    /api/empleados/:id                  → Detalle con ubicación actual
POST   /api/empleados                      → Crear [admin/supervisor]
PUT    /api/empleados/:id                  → Editar
PATCH  /api/empleados/:id/ubicacion        → Cambiar ubicación actual
```

### Logs
```
GET    /api/logs                           → Lista paginada (filtros: usuario, accion, fecha)
GET    /api/logs/empleado/:id/sesiones     → Historial de sesiones de un empleado
GET    /api/logs/empleado/:id/tiempo       → Tiempo total por ubicación
```

---

## 6. Frontend — Patrón de Comunicación

```
┌─────────────────────────────────────────────────────────┐
│                      EventBus                            │
│  (pub/sub central — desacopla todos los módulos)        │
└──────────┬──────────┬───────────┬──────────┬────────────┘
           │          │           │          │
     ┌─────▼──┐  ┌────▼────┐  ┌──▼───┐  ┌──▼──────┐
     │  Map   │  │Sidebar  │  │ Auth │  │  Logs   │
     │Controller│ │Controller│ │Ctrl  │  │Controller│
     └─────┬──┘  └────┬────┘  └──┬───┘  └──┬──────┘
           │          │           │          │
     ┌─────▼──┐  ┌────▼────┐  ┌──▼───┐  ┌──▼──────┐
     │  Map   │  │Sidebar  │  │Login │  │  Log    │
     │Component│ │Component│  │ Form │  │ Viewer  │
     └────────┘  └─────────┘  └──────┘  └─────────┘
```

**EventBus.js (clave para desacoplamiento):**

```javascript
// client/js/utils/EventBus.js
class EventBus {
  #listeners = {};

  on(event, callback) {
    (this.#listeners[event] ??= []).push(callback);
  }

  off(event, callback) {
    this.#listeners[event] = this.#listeners[event]?.filter(cb => cb !== callback);
  }

  emit(event, data) {
    this.#listeners[event]?.forEach(cb => cb(data));
  }
}

export const eventBus = new EventBus();
```

**Eventos principales:**

| Evento | Emisor | Consumidor |
|---|---|---|
| `point:selected` | MapComponent | MapController → PointDetail |
| `point:moved` | MapComponent | MapController → UbicacionService |
| `ubicacion:actualizada` | UbicacionService | MapComponent, Sidebar |
| `empleado:seleccionado` | Sidebar | MapComponent (centra mapa) |
| `auth:login` | AuthController | App (muestra interfaz) |
| `auth:logout` | AuthController | App (redirige a login) |
| `mapStyle:changed` | MapStyleSelector | MapComponent |

---

## 7. Selector de Estilo de Mapa + Cache

```javascript
// client/js/components/MapStyleSelector.js
import { CacheService } from '../services/CacheService.js';
import { eventBus } from '../utils/EventBus.js';

const MAP_STYLES = {
  standard:  { name: 'Estándar',    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
  satellite: { name: 'Satélite',    url: '...' },
  dark:      { name: 'Oscuro',      url: '...' },
  nautical:  { name: 'Náutico',     url: '...' },
};

export class MapStyleSelector {
  #currentStyle;

  constructor(containerEl) {
    this.container = containerEl;
    this.#currentStyle = CacheService.get('mapStyle') || 'standard';
    this.render();
  }

  render() { /* renderiza botones/selector */ }

  selectStyle(styleKey) {
    this.#currentStyle = styleKey;
    CacheService.set('mapStyle', styleKey);       // Persiste en localStorage
    eventBus.emit('mapStyle:changed', MAP_STYLES[styleKey]);
  }
}
```

```javascript
// client/js/services/CacheService.js — (S) Solo gestiona localStorage
export class CacheService {
  static get(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
  }
  static set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  static remove(key) {
    localStorage.removeItem(key);
  }
}
```

---

## 8. Resumen SOLID en Acción

```
 S — Cada archivo = 1 responsabilidad
     MapComponent solo renderiza mapa
     UbicacionService solo habla con la API de ubicaciones
     LogService solo registra logs

 O — Añadir tipo "Puerto" =
     1. Nuevo discriminator en MongoDB
     2. Nuevo icono en MarkerFactory
     3. CERO cambios en MapComponent, Sidebar, Controllers

 L — El mapa trata todo como "Ubicacion"
     No le importa si es Base o Barco
     Ambos tienen .coordenadas, .nombre, .tipo

 I — Base NO implementa moverCoordenadas()
     Solo Barco tiene esMovil:true → habilitado para drag
     El controller verifica antes de permitir la acción

 D — MapController depende de UbicacionService (abstracción)
     NO depende de MongoDB, fetch, ni URLs
     Si cambias de MongoDB a PostgreSQL, solo tocas el backend
     El frontend ni se entera
```

---

## 9. Tecnologías Recomendadas

| Capa | Tecnología | Por qué |
|---|---|---|
| Mapa interactivo | **Leaflet.js** | Gratis, ligero, plugins de drag markers |
| Tiles | OpenStreetMap / Mapbox | Múltiples estilos, náutico disponible |
| Backend | **Node.js + Express** | Necesario para conectar JS con MongoDB |
| DB | **MongoDB + Mongoose** | Schemas flexibles, discriminators, geoespacial |
| Auth | **JWT (jsonwebtoken)** | Stateless, fácil de implementar |
| Password hash | **bcrypt** | Estándar de seguridad |
| Responsive | **CSS Grid + Flexbox** | Nativo, sin dependencias |
| Cache cliente | **localStorage** | Persiste estilo de mapa, preferencias |

---

## 10. Orden de Implementación Sugerido

```
Fase 1 — Cimientos
  ├── Configurar proyecto (package.json, estructura carpetas)
  ├── Conexión MongoDB + Schemas (Ubicacion, Empleado, Usuario, Log)
  ├── API Auth (login/registro/JWT middleware)
  └── Login.html funcional

Fase 2 — Mapa Base
  ├── Integrar Leaflet.js en index.html
  ├── Cargar ubicaciones desde API y pintar markers
  ├── Click en marker → modal con info + empleados
  └── Selector de estilos de mapa + cache

Fase 3 — Interactividad
  ├── Drag & drop de markers de barcos
  ├── Edición manual de coordenadas
  ├── Subida/visualización de imágenes de barcos
  └── EventBus conectando todos los módulos

Fase 4 — Sidebar Empleados
  ├── Lista por departamento
  ├── Click en empleado → centra mapa en su ubicación
  ├── Cambiar ubicación de empleado
  └── Responsive (sidebar colapsable en móvil)

Fase 5 — Logs y Auditoría
  ├── Registro automático de acciones
  ├── Control de sesiones (entrada/salida por ubicación)
  ├── Vista de historial con filtros
  └── Cálculo de tiempo total por ubicación
```
