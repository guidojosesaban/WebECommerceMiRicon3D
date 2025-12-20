const jwt = require('jsonwebtoken');

// 1. Verificar si el usuario tiene un Token válido
const verifyToken = (req, res, next) => {
    // Leer el token del header
    const token = req.header('x-auth-token');

    // Revisar si no hay token
    if (!token) {
        return res.status(401).json({ msg: 'No hay token, permiso no válido' });
    }

    // Validar el token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Guardamos los datos del usuario (id y role) en la request
        next(); // Continuar al siguiente paso
    } catch (error) {
        res.status(401).json({ msg: 'Token no válido' });
    }
};

// 2. Verificar si el usuario es ADMINISTRADOR
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') {
            next(); // Es admin, pase usted
        } else {
            res.status(403).json({ msg: 'Acceso denegado: Se requieren permisos de Administrador' });
        }
    });
};

module.exports = { verifyToken, verifyAdmin };