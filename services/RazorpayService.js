const razorpay = require('../configurations/razorpay.js');

const createOrder = async ({ amount,receipt }) => {
    return await razorpay.orders.create({
        amount: amount * 100,
        currency: 'INR',
        receipt
    });

};
const fetchPayment = async (paymentId) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createOrder,
    fetchPayment
};