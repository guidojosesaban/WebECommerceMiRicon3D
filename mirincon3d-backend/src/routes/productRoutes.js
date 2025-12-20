const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

// --- RUTAS PÚBLICAS (Cualquiera las ve) ---
router.get('/', getProducts);       // Ver catálogo
router.get('/:id', getProductById); // Ver detalle de un producto

// --- RUTAS PROTEGIDAS (Solo Admin) ---
// El middleware 'verifyAdmin' protege estas rutas
router.post('/', verifyAdmin, createProduct);      // Crear
router.put('/:id', verifyAdmin, updateProduct);    // Editar
router.delete('/:id', verifyAdmin, deleteProduct); // Borrar

module.exports = router;