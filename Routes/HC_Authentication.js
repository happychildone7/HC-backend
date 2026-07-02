const express = require('express');
const { protect } = require('../middlewares/authMiddleware.js');
const {
    loginUser,
    loginWithOtp,
    googleLogin,
    facebookLogin,
    checkLoginStatus,
    logoutUser,
    sendPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword
} = require('../Controllers/HC_AuthCtrl.js');

const router = express.Router();

router.post('/login',loginUser);
router.post('/loginWithOtp/',loginWithOtp);
router.post('/googleLogin',googleLogin);
router.post('/facebookLogin',facebookLogin);
router.get('/sessionCheck',protect,checkLoginStatus);
router.post('/logout',protect,logoutUser);
router.post('/forgotPassword/sendOtp',sendPasswordResetOtp);
router.post('/forgotPassword/verifyOtp',verifyPasswordResetOtp);
router.post('/resetPassword',resetPassword);

module.exports = router;