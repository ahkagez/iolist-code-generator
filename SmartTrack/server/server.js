require('./config/env');
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { PORT } = require('./config/env');

const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del cliente
app.use(express.static(path.join(__dirname, '../client')));

// Rutas API
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/ubicaciones',   require('./routes/ubicaciones.routes'));
app.use('/api/empleados',     require('./routes/empleados.routes'));
app.use('/api/usuarios',      require('./routes/usuarios.routes'));
app.use('/api/departamentos', require('./routes/departamentos.routes'));
app.use('/api/logs',          require('./routes/logs.routes'));

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/login.html'));
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
  });
});
