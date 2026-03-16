const express      = require('express');
const router       = express.Router();
const Departamento = require('../models/Departamento');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

// GET /api/departamentos
router.get('/', async (req, res) => {
  try {
    const depts = await Departamento.find({ activo: true }).sort({ nombre: 1 }).lean();
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
