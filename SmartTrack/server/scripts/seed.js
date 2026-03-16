// ============================================================
// SEED DATA — SmartTrack para Baltic Yachts
// MongoDB + Mongoose
// ============================================================
// Ejecutar: node seed.js
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// ─── Conexión ────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smarttrack';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

// ─── SCHEMAS ─────────────────────────────────────────────────
const { Schema } = mongoose;

// 1. Departamentos
const departamentoSchema = new Schema({
  nombre:  { type: String, required: true, unique: true, trim: true },
  color:   { type: String, default: '#6B7280' },
  icono:   { type: String, default: 'default' },
  activo:  { type: Boolean, default: true }
});
const Departamento = mongoose.model('Departamento', departamentoSchema);

// 2. Ubicaciones
const ubicacionSchema = new Schema({
  nombre:      { type: String, required: true, trim: true },
  tipo:        { type: String, enum: ['base', 'oficina', 'taller', 'barco'], required: true },
  coordenadas: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  esMovil:     { type: Boolean, default: false },
  descripcion: { type: String, maxlength: 500 },
  activo:      { type: Boolean, default: true }
}, { timestamps: true, discriminatorKey: 'tipo' });

const Ubicacion = mongoose.model('Ubicacion', ubicacionSchema);

const barcoSchema = new Schema({
  matricula:   String,
  eslora:      Number,
  manga:       Number,
  propietario: String,
  tipoBarco:   { type: String, enum: ['velero', 'motor', 'catamaran', 'superyacht', 'otro'], default: 'otro' }
});
barcoSchema.pre('save', function(next) { this.esMovil = true; next(); });
const Barco = Ubicacion.discriminator('barco', barcoSchema);

// Parche para permitir ubicaciones fijas sin esquema extra
Ubicacion.discriminator('base', new Schema({}));
Ubicacion.discriminator('oficina', new Schema({}));
Ubicacion.discriminator('taller', new Schema({}));

// 3. Imágenes
const imagenSchema = new Schema({
  ubicacionId: { type: Schema.Types.ObjectId, ref: 'Ubicacion', required: true },
  url:         { type: String, required: true },
  thumbnail:   String,
  descripcion: String,
  subidaPor:   { type: Schema.Types.ObjectId, ref: 'Usuario' },
  orden:       { type: Number, default: 0 }
}, { timestamps: true });
const Imagen = mongoose.model('Imagen', imagenSchema);

// 4. Empleados
const empleadoSchema = new Schema({
  nombre:           { type: String, required: true, trim: true },
  prApellido:       { type: String, required: true, trim: true },
  sgApellido:       { type: String, trim: true, default: '' },
  departamentoId:   { type: Schema.Types.ObjectId, ref: 'Departamento', required: true },
  ubicacionActualId:{ type: Schema.Types.ObjectId, ref: 'Ubicacion', default: null },
  telefono:         String,
  email:            { type: String, trim: true, lowercase: true },
  avatar:           String,
  cargo:            { type: String, trim: true },
  activo:           { type: Boolean, default: true }
}, { timestamps: true });

empleadoSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombre} ${this.prApellido} ${this.sgApellido || ''}`.trim();
});
const Empleado = mongoose.model('Empleado', empleadoSchema);

// 5. Usuarios
const usuarioSchema = new Schema({
  email:        { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  nombre:       String,
  rol:          { type: String, enum: ['admin', 'supervisor', 'operador'], default: 'operador' },
  empleadoRef:  { type: Schema.Types.ObjectId, ref: 'Empleado', default: null },
  ultimoLogin:  Date,
  activo:       { type: Boolean, default: true }
}, { timestamps: true });
const Usuario = mongoose.model('Usuario', usuarioSchema);

// 6. Sesiones
const sesionSchema = new Schema({
  empleadoId:    { type: Schema.Types.ObjectId, ref: 'Empleado', required: true },
  ubicacionId:   { type: Schema.Types.ObjectId, ref: 'Ubicacion', required: true },
  horaEntrada:   { type: Date, required: true },
  horaSalida:    { type: Date, default: null },
  duracionMinutos: { type: Number, default: null },
  estado:        { type: String, enum: ['activa', 'finalizada'], default: 'activa' },
  registradoPor: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  notas:         { type: String, maxlength: 300 }
}, { timestamps: true });
const Sesion = mongoose.model('Sesion', sesionSchema);

// 7. Logs
const logSchema = new Schema({
  usuarioId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  accion:    { type: String, required: true },
  detalles:  { type: Schema.Types.Mixed, default: {} },
  ip:        String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });
const Log = mongoose.model('Log', logSchema);

// ─── SEED FUNCTION ───────────────────────────────────────────

async function seed() {
  console.log('Limpiando base de datos...');
  await Promise.all([
    Departamento.deleteMany({}),
    Ubicacion.deleteMany({}),
    Imagen.deleteMany({}),
    Empleado.deleteMany({}),
    Usuario.deleteMany({}),
    Sesion.deleteMany({}),
    Log.deleteMany({})
  ]);

  console.log('Creando departamentos...');
  const departamentos = await Departamento.insertMany([
    { nombre: 'Mecánica',       color: '#EF4444', icono: 'wrench' },
    { nombre: 'Electricidad',   color: '#3B82F6', icono: 'bolt' },
    { nombre: 'Pintura',        color: '#8B5CF6', icono: 'paint-brush' },
    { nombre: 'Administración', color: '#10B981', icono: 'briefcase' },
    { nombre: 'Limpieza',       color: '#F59E0B', icono: 'sparkles' },
    { nombre: 'Carpintería',    color: '#92400E', icono: 'hammer' }
  ]);

  const [mecanica, electricidad, pintura, administracion, limpieza, carpinteria] = departamentos;

  console.log('Creando ubicaciones fijas...');
  const base = await Ubicacion.create({
    nombre: 'Base Principal Baltic Yachts',
    tipo: 'base',
    coordenadas: { lat: 39.5596, lng: 2.6346 },
    esMovil: false,
    descripcion: 'Base principal de operaciones en el puerto de Palma'
  });

  const oficina = await Ubicacion.create({
    nombre: 'Oficina Muelle Viejo',
    tipo: 'oficina',
    coordenadas: { lat: 39.5672, lng: 2.6401 },
    esMovil: false,
    descripcion: 'Oficina administrativa junto al Muelle Viejo'
  });

  const taller = await Ubicacion.create({
    nombre: 'Taller STP',
    tipo: 'taller',
    coordenadas: { lat: 39.5530, lng: 2.6258 },
    esMovil: false,
    descripcion: 'Taller técnico en las instalaciones de STP Palma'
  });

  const tallerPintura = await Ubicacion.create({
    nombre: 'Taller de Pintura',
    tipo: 'taller',
    coordenadas: { lat: 39.5545, lng: 2.6280 },
    esMovil: false,
    descripcion: 'Taller especializado en pintura y acabados náuticos'
  });

  console.log('Creando barcos...');
  const hackelberry = await Barco.create({
    nombre: 'Hackelberry',
    tipo: 'barco',
    coordenadas: { lat: 39.5620, lng: 2.6380 },
    descripcion: 'Superyacht de 52m en mantenimiento regular',
    matricula: 'PM-3-1492',
    eslora: 52,
    manga: 10.2,
    propietario: 'Hackelberry Holdings Ltd.',
    tipoBarco: 'superyacht'
  });

  const winwin = await Barco.create({
    nombre: 'WinWin',
    tipo: 'barco',
    coordenadas: { lat: 39.5585, lng: 2.6320 },
    descripcion: 'Velero de regata de 33m',
    matricula: 'PM-3-2087',
    eslora: 33,
    manga: 7.5,
    propietario: 'WinWin Racing Syndicate',
    tipoBarco: 'velero'
  });

  const serenity = await Barco.create({
    nombre: 'Serenity',
    tipo: 'barco',
    coordenadas: { lat: 39.5640, lng: 2.6415 },
    descripcion: 'Yate a motor de 28m, recién llegado para reparaciones',
    matricula: 'PM-3-3341',
    eslora: 28,
    manga: 6.8,
    propietario: 'Mediterranean Yachts S.L.',
    tipoBarco: 'motor'
  });

  const tramontana = await Barco.create({
    nombre: 'Tramontana',
    tipo: 'barco',
    coordenadas: { lat: 39.5560, lng: 2.6290 },
    descripcion: 'Catamarán de 18m para charter',
    matricula: 'PM-3-4455',
    eslora: 18,
    manga: 9.2,
    propietario: 'Balear Charter Group',
    tipoBarco: 'catamaran'
  });

  console.log('Creando imágenes...');
  await Imagen.insertMany([
    { ubicacionId: hackelberry._id, url: '/uploads/barcos/hackelberry/exterior_01.jpg', thumbnail: '/uploads/barcos/hackelberry/exterior_01_thumb.jpg', descripcion: 'Vista lateral estribor', orden: 1 },
    { ubicacionId: hackelberry._id, url: '/uploads/barcos/hackelberry/puente_01.jpg',   thumbnail: '/uploads/barcos/hackelberry/puente_01_thumb.jpg',   descripcion: 'Puente de mando',      orden: 2 },
    { ubicacionId: hackelberry._id, url: '/uploads/barcos/hackelberry/sala_maquinas.jpg',thumbnail: '/uploads/barcos/hackelberry/sala_maquinas_thumb.jpg',descripcion: 'Sala de máquinas',     orden: 3 },
    { ubicacionId: winwin._id, url: '/uploads/barcos/winwin/vela_mayor.jpg',   thumbnail: '/uploads/barcos/winwin/vela_mayor_thumb.jpg',   descripcion: 'Vela mayor desplegada',  orden: 1 },
    { ubicacionId: winwin._id, url: '/uploads/barcos/winwin/cubierta.jpg',     thumbnail: '/uploads/barcos/winwin/cubierta_thumb.jpg',     descripcion: 'Cubierta principal',     orden: 2 },
    { ubicacionId: serenity._id, url: '/uploads/barcos/serenity/proa.jpg',     thumbnail: '/uploads/barcos/serenity/proa_thumb.jpg',       descripcion: 'Vista de proa',          orden: 1 },
    { ubicacionId: serenity._id, url: '/uploads/barcos/serenity/interior.jpg', thumbnail: '/uploads/barcos/serenity/interior_thumb.jpg',   descripcion: 'Salón principal',        orden: 2 },
    { ubicacionId: tramontana._id, url: '/uploads/barcos/tramontana/aerea.jpg',thumbnail: '/uploads/barcos/tramontana/aerea_thumb.jpg',   descripcion: 'Vista aérea fondeado',   orden: 1 },
  ]);

  console.log('Creando empleados...');

  const jordi = await Empleado.create({
    nombre: 'Jordi', prApellido: 'Bosch', sgApellido: 'Ciejka',
    departamentoId: administracion._id, ubicacionActualId: oficina._id,
    telefono: '+34 612 345 678', email: 'jordi.bosch@balticyacht.fi',
    avatar: '/uploads/empleados/jordi-bosch.jpg', cargo: 'Coordinador de Operaciones'
  });

  const miguel = await Empleado.create({
    nombre: 'Miguel', prApellido: 'Ramírez', sgApellido: 'Torres',
    departamentoId: mecanica._id, ubicacionActualId: hackelberry._id,
    telefono: '+34 623 456 789', email: 'miguel.ramirez@balticyacht.fi',
    avatar: '/uploads/empleados/miguel-ramirez.jpg', cargo: 'Mecánico Senior'
  });

  const ana = await Empleado.create({
    nombre: 'Ana', prApellido: 'Martínez', sgApellido: 'Vidal',
    departamentoId: electricidad._id, ubicacionActualId: hackelberry._id,
    telefono: '+34 634 567 890', email: 'ana.martinez@balticyacht.fi',
    avatar: '/uploads/empleados/ana-martinez.jpg', cargo: 'Electricista Naval'
  });

  const pedro = await Empleado.create({
    nombre: 'Pedro', prApellido: 'Soler', sgApellido: 'Mas',
    departamentoId: mecanica._id, ubicacionActualId: taller._id,
    telefono: '+34 645 678 901', email: 'pedro.soler@balticyacht.fi',
    avatar: '/uploads/empleados/pedro-soler.jpg', cargo: 'Mecánico de Motores'
  });

  const laura = await Empleado.create({
    nombre: 'Laura', prApellido: 'Font', sgApellido: 'Crespí',
    departamentoId: pintura._id, ubicacionActualId: tallerPintura._id,
    telefono: '+34 656 789 012', email: 'laura.font@balticyacht.fi',
    avatar: '/uploads/empleados/laura-font.jpg', cargo: 'Pintora Especialista'
  });

  const toni = await Empleado.create({
    nombre: 'Toni', prApellido: 'Barceló', sgApellido: 'Riera',
    departamentoId: carpinteria._id, ubicacionActualId: winwin._id,
    telefono: '+34 667 890 123', email: 'toni.barcelo@balticyacht.fi',
    avatar: '/uploads/empleados/toni-barcelo.jpg', cargo: 'Carpintero Naval'
  });

  const marta = await Empleado.create({
    nombre: 'Marta', prApellido: 'Pons', sgApellido: 'Seguí',
    departamentoId: limpieza._id, ubicacionActualId: serenity._id,
    telefono: '+34 678 901 234', email: 'marta.pons@balticyacht.fi',
    avatar: '/uploads/empleados/marta-pons.jpg', cargo: 'Responsable de Limpieza'
  });

  const carlos = await Empleado.create({
    nombre: 'Carlos', prApellido: 'Ferrer', sgApellido: 'Amengual',
    departamentoId: electricidad._id, ubicacionActualId: serenity._id,
    telefono: '+34 689 012 345', email: 'carlos.ferrer@balticyacht.fi',
    avatar: '/uploads/empleados/carlos-ferrer.jpg', cargo: 'Técnico Electrónico'
  });

  const ines = await Empleado.create({
    nombre: 'Inés', prApellido: 'Rosselló', sgApellido: '',
    departamentoId: administracion._id, ubicacionActualId: base._id,
    telefono: '+34 690 123 456', email: 'ines.rossello@balticyacht.fi',
    avatar: '/uploads/empleados/ines-rossello.jpg', cargo: 'Administrativa'
  });

  const rafael = await Empleado.create({
    nombre: 'Rafael', prApellido: 'Muñoz', sgApellido: 'Capó',
    departamentoId: mecanica._id, ubicacionActualId: tramontana._id,
    telefono: '+34 601 234 567', email: 'rafael.munoz@balticyacht.fi',
    avatar: '/uploads/empleados/rafael-munoz.jpg', cargo: 'Mecánico Junior'
  });

  const marina = await Empleado.create({
    nombre: 'Marina', prApellido: 'Llull', sgApellido: 'Gomila',
    departamentoId: pintura._id, ubicacionActualId: null,
    telefono: '+34 612 098 765', email: 'marina.llull@balticyacht.fi',
    avatar: '/uploads/empleados/marina-llull.jpg', cargo: 'Ayudante de Pintura', activo: true
  });

  const pau = await Empleado.create({
    nombre: 'Pau', prApellido: 'Galmés', sgApellido: 'Sureda',
    departamentoId: limpieza._id, ubicacionActualId: hackelberry._id,
    telefono: '+34 623 098 765', email: 'pau.galmes@balticyacht.fi',
    avatar: '/uploads/empleados/pau-galmes.jpg', cargo: 'Limpieza de Interiores'
  });

  console.log(`  → 12 empleados creados`);

  console.log('Creando usuarios...');
  const salt = await bcrypt.genSalt(10);

  const userJordi = await Usuario.create({
    email: 'jordi.bosch@balticyacht.fi',
    passwordHash: await bcrypt.hash('Admin2026!', salt),
    nombre: 'Jordi Bosch Ciejka', rol: 'admin',
    empleadoRef: jordi._id, ultimoLogin: new Date('2026-03-15T08:30:00')
  });

  const userMiguel = await Usuario.create({
    email: 'miguel.ramirez@balticyacht.fi',
    passwordHash: await bcrypt.hash('Super2026!', salt),
    nombre: 'Miguel Ramírez Torres', rol: 'supervisor',
    empleadoRef: miguel._id, ultimoLogin: new Date('2026-03-15T07:45:00')
  });

  const userAna = await Usuario.create({
    email: 'ana.martinez@balticyacht.fi',
    passwordHash: await bcrypt.hash('Oper2026!', salt),
    nombre: 'Ana Martínez Vidal', rol: 'operador',
    empleadoRef: ana._id, ultimoLogin: new Date('2026-03-14T09:00:00')
  });

  const userPedro = await Usuario.create({
    email: 'pedro.soler@balticyacht.fi',
    passwordHash: await bcrypt.hash('Oper2026!', salt),
    nombre: 'Pedro Soler Mas', rol: 'operador',
    empleadoRef: pedro._id, ultimoLogin: new Date('2026-03-15T08:00:00')
  });

  const userInés = await Usuario.create({
    email: 'ines.rossello@balticyacht.fi',
    passwordHash: await bcrypt.hash('Oper2026!', salt),
    nombre: 'Inés Rosselló', rol: 'operador',
    empleadoRef: ines._id, ultimoLogin: new Date('2026-03-14T08:15:00')
  });

  console.log(`  → 5 usuarios creados`);

  console.log('Creando sesiones...');
  await Sesion.create({
    empleadoId: miguel._id, ubicacionId: hackelberry._id,
    horaEntrada: new Date('2026-03-10T07:30:00'), horaSalida: new Date('2026-03-10T15:45:00'),
    duracionMinutos: 495, estado: 'finalizada', registradoPor: userMiguel._id, notas: 'Revisión sistema hidráulico'
  });
  await Sesion.create({
    empleadoId: miguel._id, ubicacionId: hackelberry._id,
    horaEntrada: new Date('2026-03-11T08:00:00'), horaSalida: new Date('2026-03-11T16:30:00'),
    duracionMinutos: 510, estado: 'finalizada', registradoPor: userMiguel._id, notas: 'Continuación revisión hidráulica + cambio filtros'
  });
  await Sesion.create({
    empleadoId: ana._id, ubicacionId: hackelberry._id,
    horaEntrada: new Date('2026-03-11T08:30:00'), horaSalida: new Date('2026-03-11T16:00:00'),
    duracionMinutos: 450, estado: 'finalizada', registradoPor: userAna._id, notas: 'Revisión cuadro eléctrico principal'
  });

  await Sesion.create({
    empleadoId: miguel._id, ubicacionId: hackelberry._id,
    horaEntrada: new Date('2026-03-16T07:30:00'), estado: 'activa',
    registradoPor: userMiguel._id, notas: 'Ajuste final motor estribor'
  });
  await Sesion.create({
    empleadoId: ana._id, ubicacionId: hackelberry._id,
    horaEntrada: new Date('2026-03-16T08:00:00'), estado: 'activa',
    registradoPor: userAna._id, notas: 'Cableado nuevo sistema de navegación'
  });

  console.log(`  → Sesiones base generadas exitosamente`);

  console.log('Creando logs...');
  const logs = [
    { usuarioId: userJordi._id,  accion: 'AUTH_LOGIN', detalles: { metodo: 'email' }, ip: '192.168.1.10', timestamp: new Date('2026-03-15T08:30:00') },
    { usuarioId: userMiguel._id, accion: 'AUTH_LOGIN', detalles: { metodo: 'email' }, ip: '192.168.1.22', timestamp: new Date('2026-03-15T07:45:00') },
    { usuarioId: userAna._id,    accion: 'AUTH_LOGIN', detalles: { metodo: 'email' }, ip: '192.168.1.35', timestamp: new Date('2026-03-14T09:00:00') }
  ];
  await Log.insertMany(logs);
  console.log(`  → Logs iniciales creados`);

  console.log('\n════════════════════════════════════════');
  console.log('  SEED COMPLETADO - BALTIC YACHTS');
  console.log('════════════════════════════════════════');
  console.log('\nUsuarios de acceso actualizados:');
  console.log('  Admin:      jordi.bosch@balticyacht.fi    / Admin2026!');
  console.log('  Supervisor: miguel.ramirez@balticyacht.fi / Super2026!');
  console.log('  Operador:   ana.martinez@balticyacht.fi   / Oper2026!');
  console.log('  Operador:   pedro.soler@balticyacht.fi    / Oper2026!');
  console.log('  Operador:   ines.rossello@balticyacht.fi  / Oper2026!');
  console.log('════════════════════════════════════════\n');

  await mongoose.connection.close();
  console.log('Conexión cerrada. ¡Listo!');
}

seed().catch(err => {
  console.error('Error en seed:', err);
  mongoose.connection.close();
});