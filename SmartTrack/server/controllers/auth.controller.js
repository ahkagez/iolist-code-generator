const authService = require('../services/auth.services');
const Log = require('../models/Log');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const { token, usuario } = await authService.login(email, password);

    await Log.create({
      usuario: usuario.id,
      accion: 'LOGIN',
      ip: req.ip,
      detalles: { email: usuario.email }
    });

    res.json({ token, usuario });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    if (req.usuario) {
      await Log.create({
        usuario: req.usuario.id,
        accion: 'LOGOUT',
        ip: req.ip
      });
    }
    res.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};

const me = async (req, res) => {
  try {
    const usuario = await authService.getUsuarioById(req.usuario.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

module.exports = { login, logout, me };
