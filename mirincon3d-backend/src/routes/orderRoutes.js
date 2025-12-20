const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

// Rutas Cliente
router.post('/', verifyToken, createOrder);
router.get('/my-orders', verifyToken, getMyOrders);

// Rutas Admin (Protegidas con verifyAdmin)
router.get('/all', verifyAdmin, getAllOrders);        // Ver todo
router.put('/:id/status', verifyAdmin, updateOrderStatus); // Avanzar barra de progreso

module.exports = router;