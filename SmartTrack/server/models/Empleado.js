const mongoose = require('mongoose');
const { Schema } = mongoose;

const empleadoSchema = new Schema({
  nombre:            { type: String, required: true, trim: true },
  prApellido:        { type: String, required: true, trim: true },
  sgApellido:        { type: String, trim: true, default: '' },
  departamentoId:    { type: Schema.Types.ObjectId, ref: 'Departamento', required: true },
  ubicacionActualId: { type: Schema.Types.ObjectId, ref: 'Ubicacion', default: null },
  telefono:          String,
  email:             { type: String, trim: true, lowercase: true },
  avatar:            String,
  cargo:             { type: String, trim: true },
  activo:            { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Empleado', empleadoSchema);
