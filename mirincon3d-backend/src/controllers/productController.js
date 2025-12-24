const pool = require('../config/db');

// --- OBTENER TODOS ---
const getProducts = async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM products';
        let values = [];

        if (category && category !== 'Todas') {
            query += ' WHERE category = $1';
            values.push(category);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, values);
        
        // Formateamos para que el front no sufra parseando
        const formattedProducts = result.rows.map(p => ({
            ...p,
            // Convertimos los strings de la DB de vuelta a objetos JSON
            colors: p.colors ? p.colors.map(c => typeof c === 'string' ? JSON.parse(c) : c) : []
        }));

        res.json(formattedProducts);
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

        if (result.rows.length === 0) return res.status(404).json({ msg: 'Producto no encontrado' });

        const product = result.rows[0];
        // Parsear colores para enviar JSON limpio
        if (product.colors && Array.isArray(product.colors)) {
            product.colors = product.colors.map(c => typeof c === 'string' ? JSON.parse(c) : c);
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error del servidor');
    }
};

// --- CREAR PRODUCTO ---
const createProduct = async (req, res) => {
    const { title, description, price, stock, category, images, colors, is_on_offer, discount_price, is_featured } = req.body;

    try {
        // CONVERSIÓN CRÍTICA: Objetos -> JSON Strings
        const formattedColors = colors ? colors.map(c => JSON.stringify(c)) : [];

        const result = await pool.query(
            `INSERT INTO products 
            (title, description, price, stock, category, images, colors, is_on_offer, discount_price, is_featured) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [title, description, price, stock, category, images, formattedColors, is_on_offer || false, discount_price || 0, is_featured || false]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creando producto');
    }
};

// --- ACTUALIZAR PRODUCTO (AQUÍ ESTÁ LA CORRECCIÓN) ---
const updateProduct = async (req, res) => {
    const { id } = req.params;
    // Extraemos todo lo que envía el frontend
    const { 
        title, 
        description, 
        price, 
        stock, 
        category, 
        images, 
        colors, // El frontend envía objetos: [{name: 'Rojo', hex: '#F00'}]
        is_on_offer, 
        discount_price,
        is_featured 
    } = req.body;

    console.log(`📝 Actualizando Producto #${id}. Datos recibidos:`, req.body);

    try {
        // 1. PREPARAR COLORES: Postgres TEXT[] necesita Strings, no Objetos.
        let formattedColors = null;
        if (colors && Array.isArray(colors)) {
            formattedColors = colors.map(c => {
                // Si ya es string, lo dejamos. Si es objeto, lo convertimos a string.
                return typeof c === 'object' ? JSON.stringify(c) : c;
            });
        }

        // 2. QUERY EXPLÍCITA
        // Usamos COALESCE para mantener el valor anterior si el nuevo es null/undefined
        const query = `
            UPDATE products 
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                price = COALESCE($3, price),
                stock = COALESCE($4, stock),
                category = COALESCE($5, category),
                images = COALESCE($6, images),
                colors = COALESCE($7, colors),
                is_on_offer = COALESCE($8, is_on_offer),
                discount_price = COALESCE($9, discount_price),
                is_featured = COALESCE($10, is_featured)
            WHERE id = $11
            RETURNING *
        `;

        const values = [
            title, 
            description, 
            price, 
            stock, 
            category, // <--- Aquí verificamos que category se pase correctamente
            images, 
            formattedColors, // <--- Pasamos el array de STRINGS
            is_on_offer, 
            discount_price, 
            is_featured,
            id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Producto no encontrado' });
        }

        console.log("✅ Producto actualizado en DB:", result.rows[0]);
        res.json(result.rows[0]);

    } catch (error) {
        console.error("❌ Error actualizando producto:", error);
        res.status(500).send('Error actualizando producto');
    }
};

// --- ELIMINAR ---
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ msg: 'Producto eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error eliminando producto');
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };