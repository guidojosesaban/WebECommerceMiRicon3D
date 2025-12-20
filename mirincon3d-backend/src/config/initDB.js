const pool = require('./db');

const createTables = async () => {
    const query = `
    -- Tabla Usuarios
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer',
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla Productos
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        discount_price DECIMAL(10, 2),
        is_on_offer BOOLEAN DEFAULT FALSE,
        is_featured BOOLEAN DEFAULT FALSE,
        stock INTEGER DEFAULT 0,
        images TEXT[], 
        colors TEXT[],
        measures VARCHAR(100),
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla Ordenes
    CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        shipping_address JSONB NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'transfer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla Items Orden
    CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price_at_purchase DECIMAL(10, 2) NOT NULL
    );
    `;

    try {
        await pool.query(query);
        console.log("🚀 Tablas creadas exitosamente en Neon!");
        pool.end(); // Cerramos conexión al terminar
    } catch (error) {
        console.error("❌ Error creando tablas:", error);
        pool.end();
    }
};

createTables();