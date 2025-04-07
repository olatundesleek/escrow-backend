const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized!' });
        }

        req.userId = decoded.id;
        next();
    });
};

const isAdmin = (req, res, next) => {
    User.findById(req.userId, (err, user) => {
        if (err || !user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        if (user.role !== 'admin') {
            return res.status(403).send({ message: 'Require Admin Role!' });
        }

        next();
    });
};

module.exports = {
    authMiddleware,
    isAdmin
};