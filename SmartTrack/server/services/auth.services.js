const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

class AuthService {
  async login(email, password) {
    const usuario = await Usuario.findOne({ email: email.toLowerCase().trim(), activo: true });
    if (!usuario) throw new Error('Credenciales incorrectas');

    const passwordOk = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordOk) throw new Error('Credenciales incorrectas');

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      usuario: {
        id: usuario._id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    };
  }

  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }

  async getUsuarioById(id) {
    return Usuario.findById(id).select('-passwordHash');
  }

  static async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }
}

module.exports = new AuthService();
