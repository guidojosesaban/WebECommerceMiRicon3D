const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ===============================
// REGISTRO TRADICIONAL
// ===============================
const register = async (req, res) => {
  const { full_name, email, password } = req.body;

  try {
    const userExist = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userExist.rows.length > 0) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO users (full_name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, role`,
      [full_name, email, hashPassword]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      msg: 'Usuario registrado con éxito',
      token,
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// ===============================
// LOGIN TRADICIONAL
// ===============================
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const user = userResult.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete user.password;

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// ===============================
// LOGIN / REGISTRO CON GOOGLE
// ===============================
const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email } = payload;

    if (!email) {
      return res.status(400).json({ msg: 'Email no proporcionado por Google' });
    }

    const userExist = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    let user;

    if (userExist.rows.length > 0) {
      user = userExist.rows[0];
    } else {
      const randomPassword =
        Math.random().toString(36).slice(-10) +
        Math.random().toString(36).slice(-10);

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(randomPassword, salt);

      const newUser = await pool.query(
        `INSERT INTO users (full_name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, email, hashPassword, 'customer']
      );

      user = newUser.rows[0];
    }

    const jwtToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      msg: 'Login con Google exitoso',
      token: jwtToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error en Google Auth:', error);
    res.status(401).json({ msg: 'Token de Google inválido' });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
};
