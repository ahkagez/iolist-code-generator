const mongoose = require('mongoose');
const { Schema } = mongoose;

const logSchema = new Schema({
  usuario:   { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  accion:    {
    type: String,
    enum: [
      'LOGIN', 'LOGOUT',
      'EMPLEADO_CREADO', 'EMPLEADO_EDITADO', 'EMPLEADO_MOVIDO',
      'UBICACION_CREADA', 'UBICACION_EDITADA', 'UBICACION_MOVIDA',
      'SESION_INICIO', 'SESION_FIN'
    ],
    required: true
  },
  detalles:  { type: Schema.Types.Mixed },
  ip:        String,
  timestamp: { type: Date, default: Date.now }
});

logSchema.index({ usuario: 1, timestamp: -1 });
logSchema.index({ accion: 1 });
logSchema.index({ 'detalles.empleadoId': 1 });

module.exports = mongoose.model('Log', logSchema);
