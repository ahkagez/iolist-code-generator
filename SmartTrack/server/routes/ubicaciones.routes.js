const express   = require('express');
const router    = express.Router();
const Ubicacion = require('../models/Ubicacion');

// GET /api/ubicaciones
router.get('/', async (req, res) => {
  try {
    const ubicaciones = await Ubicacion.find({ activo: true }).lean();
    res.json(ubicaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ubicaciones
router.post('/', async (req, res) => {
  try {
    const Model = Ubicacion.discriminators?.[req.body.tipo] || Ubicacion;
    const doc   = new Model(req.body);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/ubicaciones/:id
router.put('/:id', async (req, res) => {
  try {
    const { _id, __v, tipo, ...updates } = req.body;
    const doc = await Ubicacion.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: false }
    ).lean();
    if (!doc) return res.status(404).json({ error: 'Ubicación no encontrada' });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/ubicaciones/:id
router.delete('/:id', async (req, res) => {
  try {
    await Ubicacion.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
