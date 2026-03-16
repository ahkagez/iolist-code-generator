const express       = require('express');
const router        = express.Router();
const Empleado      = require('../models/Empleado');
require('../models/Departamento'); // registrar modelo para populate

// GET /api/empleados
// Devuelve todos los empleados activos con el departamento populado
router.get('/', async (req, res) => {
  try {
    const empleados = await Empleado
      .find({ activo: true })
      .populate('departamentoId', 'nombre color icono')
      .sort({ prApellido: 1, nombre: 1 })
      .lean();
    res.json(empleados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
