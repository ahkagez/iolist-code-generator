const mongoose = require('mongoose');
const { Schema } = mongoose;

const departamentoSchema = new Schema({
  nombre:  { type: String, required: true, unique: true, trim: true },
  color:   { type: String, default: '#6B7280' },
  icono:   { type: String, default: 'default' },
  activo:  { type: Boolean, default: true }
});

module.exports = mongoose.model('Departamento', departamentoSchema);
