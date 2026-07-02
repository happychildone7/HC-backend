const express = require('express');
const {
    sendOtp,
    verifyOtp
} = require('../Controllers/HC_OtpCtrl');

const router = express.Router();

router.post('/send', sendOtp);
router.post('/verify', verifyOtp);

module.exports = router;