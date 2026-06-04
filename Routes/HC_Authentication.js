const express = require('express');
const { protect } = require('../middlewares/authMiddleware.js');
const {
    loginUser,
    googleLogin,
    facebookLogin,
    checkLoginStatus,
    logoutUser
} = require('../Controllers/HC_AuthCtrl.js');

const router = express.Router();

router.post('/login',loginUser);
router.post('/googleLogin',googleLogin);
router.post('/facebookLogin',facebookLogin);
router.get('/sessionCheck',protect,checkLoginStatus);
router.post('/logout',protect,logoutUser);

module.exports = router;