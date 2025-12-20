const pool = require('../config/db');
const { sendOrderEmails } = require('../config/mailer');

// --- CREAR ORDEN (Cliente) ---
const createOrder = async (req, res) => {
    const userId = req.user.id;
    const { items, shipping_address } = req.body; 

    const client = await pool.connect(); 

    try {
        await client.query('BEGIN');

        let totalAmount = 0;
        const itemsWithDetails = [];

        // 1. Validar Stock y Calcular Precio
        for (const item of items) {
            const productRes = await client.query(
                'SELECT title, price, discount_price, is_on_offer, stock FROM products WHERE id = $1', 
                [item.productId]
            );
            
            if (productRes.rows.length === 0) {
                throw new Error(`Producto ID ${item.productId} no encontrado`);
            }
            
            const product = productRes.rows[0];
            
            if (product.stock < item.quantity) {
                throw new Error(`Sin stock suficiente para: ${product.title}`);
            }

            const finalPrice = product.is_on_offer ? product.discount_price : product.price;
            totalAmount += parseFloat(finalPrice) * item.quantity;
            
            itemsWithDetails.push({ 
                title: product.title,
                quantity: item.quantity, 
                price: finalPrice 
            });

            // Descontar Stock
            await client.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2', 
                [item.quantity, item.productId]
            );
        }

        // 2. Crear la Orden
        const orderRes = await client.query(
            'INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES ($1, $2, $3, $4) RETURNING id',
            [userId, totalAmount, JSON.stringify(shipping_address), 'pending']
        );
        const orderId = orderRes.rows[0].id;

        // 3. Guardar Items
        for (const item of items) {
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
                [orderId, item.productId, item.quantity, itemsWithDetails.find(i => i.title).price]
            );
        }

        await client.query('COMMIT');

        // 4. Obtener datos del usuario
        const userRes = await pool.query(
            'SELECT email, full_name, phone FROM users WHERE id = $1', 
            [userId]
        );
        const user = userRes.rows[0];

        // 5. 📧 ENVIAR EMAILS CON EMAILJS (sin bloquear respuesta)
        sendOrderEmails({
            customerEmail: user.email,
            orderId: orderId,
            items: itemsWithDetails,
            total: totalAmount,
            shippingAddress: shipping_address,
            clientName: user.full_name || user.email.split('@')[0],
            clientPhone: user.phone || 'No proporcionado'
        }).then(emailResult => {
            console.log('✅ Emails enviados correctamente:', emailResult);
        }).catch(error => {
            console.error('❌ Error enviando emails (no crítico):', error.message);
        });

        // Responder inmediatamente
        res.status(201).json({ 
            success: true,
            msg: 'Pedido creado exitosamente', 
            orderId,
            total: totalAmount
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creando orden:', error);
        res.status(400).json({ 
            success: false,
            msg: error.message || 'Error al procesar el pedido' 
        });
    } finally {
        client.release();
    }
};

// --- MIS PEDIDOS (Cliente) ---
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(`
            SELECT o.*, json_agg(json_build_object('quantity', oi.quantity, 'price', oi.price_at_purchase)) as items 
            FROM orders o 
            LEFT JOIN order_items oi ON o.id = oi.order_id 
            WHERE o.user_id = $1 
            GROUP BY o.id 
            ORDER BY o.created_at DESC
        `, [userId]);
        
        res.json({
            success: true,
            orders: result.rows
        });
    } catch (error) {
        console.error('❌ Error obteniendo órdenes:', error);
        res.status(500).json({ 
            success: false,
            msg: 'Error obteniendo pedidos' 
        });
    }
};

// --- TODOS LOS PEDIDOS (Solo Admin) ---
const getAllOrders = async (req, res) => {
    try {
        const query = `
            SELECT 
                o.id,
                o.total_amount,
                o.shipping_address,
                o.status,
                o.created_at,
                u.full_name,
                u.email,
                u.phone,
                json_agg(
                    json_build_object(
                        'quantity', oi.quantity, 
                        'price', oi.price_at_purchase
                    )
                ) as items
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id, u.full_name, u.email, u.phone
            ORDER BY o.created_at DESC
        `;
        const result = await pool.query(query);
        
        res.json({
            success: true,
            orders: result.rows
        });
    } catch (error) {
        console.error('❌ Error obteniendo pedidos:', error);
        res.status(500).json({ 
            success: false,
            msg: 'Error obteniendo pedidos' 
        });
    }
};

// --- CAMBIAR ESTADO (Solo Admin) ---
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 

    // Estados válidos
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            success: false,
            msg: 'Estado inválido',
            validStatuses 
        });
    }

    try {
        const result = await pool.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                msg: 'Orden no encontrada' 
            });
        }

        // TODO: Aquí podrías enviar email notificando cambio de estado
        // const order = result.rows[0];
        // sendStatusUpdateEmail(order);

        res.json({
            success: true,
            msg: 'Estado actualizado correctamente',
            order: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Error actualizando estado:', error);
        res.status(500).json({ 
            success: false,
            msg: 'Error actualizando estado' 
        });
    }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };