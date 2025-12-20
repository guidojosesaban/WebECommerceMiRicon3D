const { validationResult } = require('express-validator');

const validateResult = (req, res, next) => {
    try {
        validationResult(req).throw(); // Si hay error, salta al catch
        return next(); // Si todo ok, pasa al controlador
    } catch (err) {
        res.status(403).send({ errors: err.array() });
    }
};

module.exports = { validateResult };