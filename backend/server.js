// ===================================
// SERVIDOR PRINCIPAL - VITALPET
// ===================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Crear aplicación Express
const app = express();

// ===================================
// MIDDLEWARE
// ===================================

// CORS - Permitir peticiones desde frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://'],
  credentials: true
}));

// Body Parser - Convertir JSON a objetos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de peticiones
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.path}`);
  next();
});

// ===================================
// RUTAS
// ===================================

// Ruta de prueba (raíz)
app.get('/', (req, res) => {
  res.json({
    mensaje: '✅ Backend de VitalPet está funcionando',
    version: '1.0.0',
    estado: 'activo'
  });
});

// Aquí irán las rutas de autenticación (se crearán después)
// app.use('/api/auth', require('./routes/auth'));

// Aquí irán las rutas de productos (se crearán después)
// app.use('/api/productos', require('./routes/productos'));

// Aquí irán las rutas de pedidos (se crearán después)
// app.use('/api/pedidos', require('./routes/pedidos'));

// Aquí irán las rutas de citas (se crearán después)
// app.use('/api/citas', require('./routes/citas'));

// Aquí irán las rutas de mascotas (se crearán después)
// app.use('/api/mascotas', require('./routes/mascotas'));

// Aquí irán las rutas de admin (se crearán después)
// app.use('/api/admin', require('./routes/admin'));

// ===================================
// MANEJO DE ERRORES
// ===================================

// Ruta 404 - No encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    status: err.status || 500
  });
});

// ===================================
// INICIAR SERVIDOR
// ===================================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log('\n================================');
  console.log('🚀 SERVIDOR DE VITALPET');
  console.log('================================');
  console.log(`✅ Puerto: ${PORT}`);
  console.log(`✅ Ambiente: ${NODE_ENV}`);
  console.log(`✅ URL: http://localhost:${PORT}`);
  console.log('================================\n');
});

module.exports = app;
