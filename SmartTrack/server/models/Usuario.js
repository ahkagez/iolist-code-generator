const mongoose = require('mongoose');
const { Schema } = mongoose;

const usuarioSchema = new Schema({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  nombre:       { type: String, trim: true },
  rol:          { type: String, enum: ['admin', 'supervisor', 'operador'], default: 'operador' },
  empleadoRef:  { type: Schema.Types.ObjectId, ref: 'Empleado' },
  activo:       { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
