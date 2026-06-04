const jwt = require('jsonwebtoken');
const { secretKey } = require('../configurations/jwtConfig')

const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email__c,
        role: user.role__c
    }
    return jwt.sign(payload,secretKey,{ expiresIn: '1hr'});
};

const verifyToken = (req, res, token, next) => {
    jwt.verify(token, secretKey, (err,decodedUser) => {
        if(err){
            return res.status(401).json({ error: 'Invalid or expired token.' }); 
        }
        req.user = decodedUser;
        next();
    });
};

module.exports = {
    generateToken,
    verifyToken
};