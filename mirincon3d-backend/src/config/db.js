const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Esto permite la conexión segura con Neon
    }
});

pool.on('connect', () => {
    console.log('✅ Base de Datos Conectada a Neon (Nube)');
});

pool.on('error', (err) => {
    console.error('❌ Error en Base de Datos:', err);
    process.exit(-1);
});

module.exports = pool;