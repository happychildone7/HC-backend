const { verifyToken } = require('../utils/jwtUtils');

const protect = (req, res, next) => {
    const token = req.cookies?.hc_token;
    console.log('cookieToken>',token);
    if(!token) return res.status(401).json({ error: 'Access denied. No token provided.' })
    verifyToken(req, res, token, next);
};

module.exports = {
    protect
}
