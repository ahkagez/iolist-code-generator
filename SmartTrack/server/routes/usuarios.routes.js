const express      = require('express');
const router       = express.Router();
const bcrypt       = require('bcryptjs');
const Usuario      = require('../models/Usuario');
const Empleado     = require('../models/Empleado');
const Departamento = require('../models/Departamento');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Construye el objeto de respuesta unificado empleado + cuenta
async function buildEntry(emp) {
  const usuario = await Usuario.findOne({ empleadoRef: emp._id, activo: true })
    .select('-passwordHash').lean();
  return {
    _id:            emp._id,
    nombre:         emp.nombre,
    prApellido:     emp.prApellido,
    sgApellido:     emp.sgApellido,
    departamentoId: emp.departamentoId,
    telefono:       emp.telefono,
    cargo:          emp.cargo,
    email:          usuario?.email  || null,
    rol:            usuario?.rol    || null,
    usuarioId:      usuario?._id    || null,
    hasAccount:     !!usuario,
  };
}

// GET /api/usuarios  — todos los empleados activos con datos de cuenta si tienen
router.get('/', async (req, res) => {
  try {
    const [empleados, usuarios] = await Promise.all([
      Empleado.find({ activo: true })
        .populate('departamentoId', 'nombre color icono')
        .sort({ prApellido: 1, nombre: 1 })
        .lean(),
      Usuario.find({ activo: true }).select('-passwordHash').lean()
    ]);

    const userByEmp = new Map(
      usuarios
        .filter(u => u.empleadoRef)
        .map(u => [String(u.empleadoRef), u])
    );

    const result = empleados.map(emp => {
      const usuario = userByEmp.get(String(emp._id));
      return {
        _id:            emp._id,
        nombre:         emp.nombre,
        prApellido:     emp.prApellido,
        sgApellido:     emp.sgApellido,
        departamentoId: emp.departamentoId,
        telefono:       emp.telefono,
        cargo:          emp.cargo,
        email:          usuario?.email  || null,
        rol:            usuario?.rol    || null,
        usuarioId:      usuario?._id    || null,
        hasAccount:     !!usuario,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/usuarios  — crea empleado + (opcionalmente) cuenta de acceso
// Si se envía email, la contraseña es obligatoria
router.post('/', async (req, res) => {
  let empleado = null;
  try {
    const { email, password, rol, nombre, prApellido, sgApellido,
            departamentoId, telefono, cargo } = req.body;

    if (!nombre || !prApellido || !departamentoId) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: nombre, primer apellido y departamento'
      });
    }

    const wantsAccount = !!email;
    if (wantsAccount && !password) {
      return res.status(400).json({ error: 'La contraseña es obligatoria al crear una cuenta de acceso' });
    }

    if (wantsAccount) {
      const emailLower = email.toLowerCase().trim();
      if (await Usuario.findOne({ email: emailLower })) {
        return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
      }
    }

    empleado = await Empleado.create({
      nombre:         nombre.trim(),
      prApellido:     prApellido.trim(),
      sgApellido:     (sgApellido || '').trim(),
      departamentoId,
      telefono:       telefono   || undefined,
      cargo:          (cargo     || '').trim() || undefined,
      activo:         true
    });

    if (wantsAccount) {
      await Usuario.create({
        email:        email.toLowerCase().trim(),
        passwordHash: await bcrypt.hash(password, 12),
        nombre:       `${nombre.trim()} ${prApellido.trim()}`,
        rol:          rol || 'operador',
        empleadoRef:  empleado._id,
        activo:       true
      });
    }

    const emp = await Empleado.findById(empleado._id)
      .populate('departamentoId', 'nombre color icono').lean();
    res.status(201).json(await buildEntry(emp));

  } catch (err) {
    if (empleado) await Empleado.findByIdAndDelete(empleado._id).catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/usuarios/:empId  — actualiza empleado y cuenta (crea cuenta si no tiene y se da email)
router.put('/:empId', async (req, res) => {
  try {
    const { email, password, rol, nombre, prApellido, sgApellido,
            departamentoId, telefono, cargo } = req.body;

    const empleado = await Empleado.findOne({ _id: req.params.empId, activo: true });
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

    // Actualizar empleado
    if (nombre        !== undefined) empleado.nombre         = nombre.trim();
    if (prApellido    !== undefined) empleado.prApellido     = prApellido.trim();
    if (sgApellido    !== undefined) empleado.sgApellido     = sgApellido.trim();
    if (departamentoId !== undefined) empleado.departamentoId = departamentoId;
    if (telefono      !== undefined) empleado.telefono       = telefono;
    if (cargo         !== undefined) empleado.cargo          = cargo.trim();
    await empleado.save();

    // Gestionar cuenta de acceso
    if (email !== undefined && email !== '') {
      const emailLower = email.toLowerCase().trim();
      let usuario = await Usuario.findOne({ empleadoRef: empleado._id, activo: true });

      if (usuario) {
        // Actualizar cuenta existente
        if (emailLower !== usuario.email) {
          const dup = await Usuario.findOne({ email: emailLower, _id: { $ne: usuario._id } });
          if (dup) return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
          usuario.email = emailLower;
        }
        if (rol)                         usuario.rol  = rol;
        if (nombre && prApellido)        usuario.nombre = `${nombre.trim()} ${prApellido.trim()}`;
        if (password && password.trim()) usuario.passwordHash = await bcrypt.hash(password, 12);
        await usuario.save();
      } else {
        // Crear cuenta nueva
        if (!password) return res.status(400).json({ error: 'La contraseña es obligatoria al crear una cuenta de acceso' });
        const dup = await Usuario.findOne({ email: emailLower });
        if (dup) return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
        await Usuario.create({
          email:        emailLower,
          passwordHash: await bcrypt.hash(password, 12),
          nombre:       `${empleado.nombre} ${empleado.prApellido}`,
          rol:          rol || 'operador',
          empleadoRef:  empleado._id,
          activo:       true
        });
      }
    }

    const emp = await Empleado.findById(empleado._id)
      .populate('departamentoId', 'nombre color icono').lean();
    res.json(await buildEntry(emp));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/usuarios/:empId/departamento  — drag & drop
router.patch('/:empId/departamento', async (req, res) => {
  try {
    const { departamentoId } = req.body;
    if (!departamentoId) return res.status(400).json({ error: 'departamentoId requerido' });

    if (!(await Departamento.findById(departamentoId))) {
      return res.status(404).json({ error: 'Departamento no encontrado' });
    }

    const empleado = await Empleado.findOne({ _id: req.params.empId, activo: true });
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

    await Empleado.findByIdAndUpdate(empleado._id, { departamentoId });
    res.json({ ok: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/usuarios/:empId  — elimina empleado y su cuenta asociada
router.delete('/:empId', async (req, res) => {
  try {
    const empleado = await Empleado.findOne({ _id: req.params.empId, activo: true });
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

    await Promise.all([
      empleado.deleteOne(),
      Usuario.deleteOne({ empleadoRef: empleado._id })
    ]);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
