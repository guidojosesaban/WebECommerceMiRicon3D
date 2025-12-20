// server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const pool = require('./config/db'); // tu conexión a DB

const app = express();
const port = process.env.PORT || 3000;

// --- SEGURIDAD 1: Rate Limiter ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.'
});
app.use(limiter);

// --- SEGURIDAD 2: Helmet ---
app.use(helmet());

// --- SEGURIDAD 3: CORS PARA DEV Y PROD ---
const allowedOrigins = [
  'http://localhost:5173', // frontend local
  'https://webecommercemiricon3d-1.onrender.com' // frontend Render
];

app.use(
  cors({
    origin: function(origin, callback){
      if(!origin) return callback(null, true); // Postman / scripts
      if(allowedOrigins.includes(origin)){
        callback(null, true);
      } else {
        callback(new Error('CORS no permitido'));
      }
    },
    optionsSuccessStatus: 200
  })
);

// --- LOGS Y PARSEO ---
app.use(morgan('dev'));
app.use(express.json());

// --- RUTAS ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// --- ENDPOINT RAÍZ ---
app.get('/', (req, res) => {
  res.json({ message: 'API Segura de MIRINCON3D funcionando 🚀' });
});

// --- LEVANTAR SERVIDOR ---
app.listen(port, () => {
  console.log(`🛡️ Servidor corriendo en http://localhost:${port}`);
});
