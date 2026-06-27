const Promotion = require('../Models/Promotion');
const checkPromotionOverlap = async({
    listingId,
    requestedStartDate,
    duration
}) => {
    const now = new Date();
    const existingPromotions = await Promotion.find({
        related_To_Id__c: listingId,
        $or: [
            {
                payment_Status__c: "Paid"
            },
            {
                payment_Status__c: "Pending",
                reservation_Expires_At__c: { $gt: now }
            }
        ]
    });
    const requestedStart = new Date(requestedStartDate);
    const requestedEnd = new Date(requestedStart);
    requestedEnd.setDate(
        requestedEnd.getDate() + duration - 1
    );
    for(const promotion of existingPromotions){
        const existingStart = promotion.start_Date__c ?? promotion.requested_Start_Date__c;
        const existingEnd = new Date(existingStart);
        existingEnd.setDate(existingEnd.getDate() + promotion.duration_Days__c - 1);
        const overlaps = requestedStart <= existingEnd && requestedEnd >= existingStart;
        if (overlaps) {
            return {
                overlap: true,
                promotion
            }
        }
    }
    return {
        overlap: false
    };
}
module.exports = {
    checkPromotionOverlap
};