const Promotion = require("../Models/Promotion");
const Payment = require("../Models/Payment");

const activatePromotionPayment = async (payment,session = null) => {
    if(payment.related_Type__c !== "HC_Promotion"){
        return;
    }
    const promotionQuery = Promotion.findById(payment.related_To_Id__c);
    const promotion = session
                        ? await promotionQuery.session(session)
                        : await promotionQuery;
    if(!promotion){
        return;
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    const requestedStart = new Date(promotion.requested_Start_Date__c);
    requestedStart.setHours(0,0,0,0);
    const effectiveStart = requestedStart > today ? requestedStart: today;
    const effectiveEnd = new Date(effectiveStart);
    effectiveEnd.setDate(effectiveEnd.getDate() + promotion.duration_Days__c - 1);

    promotion.payment_Status__c = "Paid";
    promotion.active__c = true;
    promotion.start_Date__c = effectiveStart;
    promotion.end_Date__c = effectiveEnd;

    await promotion.save({ session });
};
const markPaymentPaid = async(payment,{
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    session = null
}) => {
    payment.payment_Status__c = "Paid";
    payment.gateway_Order_Id__c = razorpayOrderId;
    payment.gateway_Payment_Id__c = razorpayPaymentId;
    payment.paid_At__c = new Date();
    if(razorpaySignature) payment.gateway_Signature__c = razorpaySignature;
    await payment.save({ session });
    await activatePromotionPayment(payment,session);
}

module.exports = {
    activatePromotionPayment,
    markPaymentPaid
};