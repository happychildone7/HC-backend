const Payment = require('../Models/Payment');
const RazorpayService = require('../services/RazorpayService.js');
const crypto = require('crypto');
const Promotion = require('../Models/Promotion.js');
const razorKey = process.env.RAZORPAY_KEY_SECRET;
const mongoose = require('mongoose');
const { activatePromotionPayment, markPaymentPaid } = require('../services/PaymentActivationService.js');

const createPayment = async(req,res) => {
    try{
        const {
            related_To_Id__c,
            related_Type__c,
            amount__c
        } = req.body;
        if(!related_To_Id__c){
            return res.status(400).json({ error:'Related record required' });
        }
        if(!amount__c || amount__c <=0){
            return res.status(400).json({ error:'Amount required' });
        }
        const payment =
            await Payment.create({
                related_To_Id__c,
                related_Type__c,
                amount__c,
                payment_Status__c:'Pending'
            });
        return res.status(201).json({ payment });
    }catch(error){
        return res.status(500).json({
            error:error.message
        });
    }
};
const getPayment = async(req,res) => {
    try{
        const payment = await Payment.findById(req.params.paymentId).populate('related_To_Id__c').lean();
        if(!payment){
            return res.status(404).json({ error:'Payment not found' });
        }
        return res.status(200).json(payment);
    }catch(error){
        return res.status(500).json({ error:error.message });
    }
};
const verifyPayment = async(req,res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const{
            paymentId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;
        const payment = await Payment.findById(paymentId);
        if(!payment){
            return res.status(404).json({ success: false,error: "Payment not found." });
        }
        if (payment.payment_Status__c === "Paid") {
            return res.status(200).json({ success: true, message: "Payment already verified" });
        }
        const razorBody = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac("sha256",razorKey).update(razorBody.toString()).digest("hex");
        if(expectedSignature !== razorpay_signature){
            return res.status(400).json({ success: false,error: "Invalid payment signature" });
        }
        const razorpayPaymentInfo = await RazorpayService.fetchPayment(razorpay_payment_id);
        if(razorpayPaymentInfo.status !== 'captured' || razorpayPaymentInfo.order_id !== razorpay_order_id){
            return res.status(400).json({ success: false,error: "Razorpay payment info incorrect." })
        }
        if(Number(razorpayPaymentInfo.amount) !== Number(payment.amount__c * 100)){
            return res.status(400).json({ success:false,error: "Amount mismatch" });
        }
        await markPaymentPaid(
            payment,
            {
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                session
            }
        )
        await session.commitTransaction();
        return res.status(200).json({ 
            success:true,
            paymentId: payment._id,
            relatedId: payment.related_To_Id__c,
            relatedType: payment.related_Type__c 
        });
    }catch(error){
        await session.abortTransaction();
        return res.status(500).json({ error:error.message });
    }finally {
        session.endSession();
    }
};
const createOrder = async (req,res) => {
    try {
        const { paymentId } = req.params;
        const payment = await Payment.findById(paymentId);
        if(!payment){
            return res.status(404).json({
                success:false,
                error:'Payment not found'
            });
        }
        if(payment.payment_Status__c === 'Paid'){
            return res.status(400).json({
                success:false,
                error:'Payment already completed'
            });
        }
        if (!payment.amount__c || payment.amount__c <= 0){
            return res.status(400).json({ success:false,error:"Invalid payment amount"});
        }
        const order = await RazorpayService.createOrder({
                amount: payment.amount__c,
                receipt: payment.payment_Number__c
            });
        payment.gateway_Order_Id__c = order.id;
        await payment.save();
        return res.status(200).json({
            success:true,
            paymentId: payment._id,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({ success:false,error:error.message });
    }
};
const razorpayWebhook = async(req,res) => {
    try{
        console.log('webhook>>',req.body.toString());
        const signature = req.headers["x-razorpay-signature"];
        const expectedSignature = crypto.createHmac("sha256",process.env.RAZORPAY_WEBHOOK_SECRET).update(req.body).digest("hex");
        if(expectedSignature !== signature){
            console.log("Invalid webhook signature");
            return res.status(400).json({
                success: false,
                message: "Invalid signature"
            });
        }
        const payload = JSON.parse(req.body.toString());
        const event = payload.event;
        if(event === "payment.captured"){
            const paymentEntity = payload.payload.payment.entity;
            const razorpayPaymentId = paymentEntity.id;
            const razorpayOrderId = paymentEntity.order_id;
            const payment = await Payment.findOne({
                                gateway_Order_Id__c: razorpayOrderId
                            });
            if (!payment || payment.payment_Status__c === 'Paid') {
                return res.status(200).json({ success: true,message: "Payment already processed" });
            }
            await markPaymentPaid(
                payment,
                {
                    razorpayOrderId: razorpayOrderId,
                    razorpayPaymentId: razorpayPaymentId
                }
            )
        }
        return res.status(200).json({ success: true });
    }catch(err){
        console.error(err);
        return res.status(500).json({ success: false,error: err });
    }
};

module.exports = {
    createPayment,
    getPayment,
    verifyPayment,
    createOrder,
    razorpayWebhook
}