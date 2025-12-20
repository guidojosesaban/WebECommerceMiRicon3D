const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit'); // <--- NUEVO
require('dotenv').config();

const pool = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

// --- SEGURIDAD 1: Rate Limiter (Anti Fuerza Bruta) ---
// Esto impide que una misma IP haga muchas peticiones seguidas
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo 100 peticiones por IP cada 15 min
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.'
});
app.use(limiter);

// --- SEGURIDAD 2: Helmet (Headers HTTP Seguros) ---
app.use(helmet());

// --- SEGURIDAD 3: CORS Restrictivo ---
// Solo permitimos peticiones desde nuestro Frontend (Vite usa puerto 5173 por defecto)
const corsOptions = {
    origin: 'http://localhost:5173', // <--- CAMBIAR ESTO CUANDO SUBAS A PRODUCCIÓN
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// --- LOGS Y PARSEO ---
app.use(morgan('dev'));
app.use(express.json());

// --- RUTAS ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.get('/', (req, res) => {
    res.json({ message: 'API Segura de MIRINCON3D funcionando 🚀' });
});

app.listen(port, () => {
    console.log(`🛡️  Servidor blindado corriendo en http://localhost:${port}`);
});