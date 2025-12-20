const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const { validateResult } = require('../middlewares/validateHelper');
const { verifyToken } = require('../middlewares/authMiddleware');
const pool = require('../config/db');

const {
  register,
  login,
  googleLogin,
} = require('../controllers/authController');

// ==============================
// 1. Registro de usuario
// ==============================
router.post(
  '/register',
  [
    check('full_name', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'El email no es válido').isEmail(),
    check(
      'password',
      'El password debe ser de mínimo 6 caracteres'
    ).isLength({ min: 6 }),
    validateResult,
  ],
  register
);

// ==============================
// 2. Login tradicional
// ==============================
router.post(
  '/login',
  [
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'El password es obligatorio').exists(),
    validateResult,
  ],
  login
);

// ==============================
// 3. Usuario autenticado
// ==============================
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await pool.query(
      `SELECT id, full_name, email, role, phone, address
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    res.json(user.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
});

// ==============================
// 4. Login / Registro con Google
// ==============================
router.post('/google', googleLogin);

module.exports = router;
