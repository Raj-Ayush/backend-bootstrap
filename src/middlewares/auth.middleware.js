const {verifyToken} = require('../utils/jwt.util');
require('dotenv').config();

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({message: 'Access denied'});
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({message: 'Invalid or expired token', error});
    }
};

module.exports = authenticate;
