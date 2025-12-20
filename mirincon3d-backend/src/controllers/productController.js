const pool = require('../config/db');

// --- OBTENER TODOS (Con filtro opcional por categoría) ---
const getProducts = async (req, res) => {
    try {
        const { category } = req.query; // Ejemplo: /api/products?category=Hogar
        let query = 'SELECT * FROM products';
        let values = [];

        if (category) {
            query += ' WHERE category = $1';
            values.push(category);
        }

        query += ' ORDER BY created_at DESC'; // Ordenar por más nuevos

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error obteniendo productos');
    }
};

// --- OBTENER UNO POR ID ---
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Producto no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error del servidor');
    }
};

// --- CREAR PRODUCTO (Solo Admin) ---
const createProduct = async (req, res) => {
    const { title, description, price, stock, category, images, colors, measures } = req.body;

    try {
        const query = `
            INSERT INTO products 
            (title, description, price, stock, category, images, colors, measures) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *
        `;
        
        const values = [title, description, price, stock, category, images, colors, measures];
        
        const newProduct = await pool.query(query, values);
        res.status(201).json(newProduct.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error creando producto');
    }
};

// --- ACTUALIZAR PRODUCTO (Solo Admin) ---
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { title, price, discount_price, is_on_offer, stock, is_featured, description } = req.body;

    try {
        // COALESCE($1, title) significa: "Usa el valor nuevo ($1), si es null, usa el que ya estaba (title)"
        const query = `
            UPDATE products 
            SET title = COALESCE($1, title),
                price = COALESCE($2, price),
                discount_price = COALESCE($3, discount_price),
                is_on_offer = COALESCE($4, is_on_offer),
                stock = COALESCE($5, stock),
                is_featured = COALESCE($6, is_featured),
                description = COALESCE($7, description)
            WHERE id = $8
            RETURNING *
        `;
        
        const result = await pool.query(query, [title, price, discount_price, is_on_offer, stock, is_featured, description, id]);

        if (result.rows.length === 0) return res.status(404).json({ msg: 'Producto no encontrado' });

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error actualizando producto');
    }
};

// --- ELIMINAR PRODUCTO (Solo Admin) ---
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ msg: 'Producto no encontrado' });

        res.json({ msg: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error eliminando producto');
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };