const express = require('express');
const {
    createPayment,
    getPayment,
    verifyPayment,
    createOrder
} = require('../Controllers/HC_PaymentCtrl.js');

const router = express.Router();

router.post('/',createPayment);
router.get('/:paymentId',getPayment);
router.post('/verify',verifyPayment);
router.post('/:paymentId/createOrder',createOrder);

module.exports = router;