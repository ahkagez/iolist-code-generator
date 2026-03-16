const mongoose = require('mongoose');
const { Schema } = mongoose;

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

Ubicacion.discriminator('barco', new Schema({
  matricula:   String,
  eslora:      Number,
  manga:       Number,
  propietario: String,
  tipoBarco:   { type: String, enum: ['velero', 'motor', 'catamaran', 'superyacht', 'otro'], default: 'otro' }
}));

Ubicacion.discriminator('base',    new Schema({}));
Ubicacion.discriminator('oficina', new Schema({}));
Ubicacion.discriminator('taller',  new Schema({}));

module.exports = Ubicacion;
