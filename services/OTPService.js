const HC_User = require('../Models/User');

const generateOtp = (length = 6) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min)).toString();
};
const createOtp = async(userId) => {
    const otp = generateOtp();
    const user = await HC_User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    user.otp__c = otp;
    user.otp_Expiry__c = new Date(Date.now() + 5*60*1000);
    user.otp_Attempts__c = 0;
    await user.save();
    return otp;
}
const verifyOtp = async(userId, otp, maxRetry) => {
    const user = await HC_User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    if (!user.otp__c) {
        throw new Error('No active OTP');
    }
    if (new Date() > user.otp_Expiry__c) {
        throw new Error('OTP expired');
    }
    if (user.otp_Attempts__c >= 5) {
        throw new Error('Maximum attempts exceeded');
    }
    if (user.otp__c !== otp) {
        user.otp_Attempts__c += 1;
        await user.save();
        throw new Error('Invalid OTP');
    }
    user.otp__c = null;
    user.otp_Expiry__c = null;
    user.otp_Attempts__c = 0;
    await user.save();
    return true;
};

module.exports = {
    generateOtp,
    createOtp,
    verifyOtp
}