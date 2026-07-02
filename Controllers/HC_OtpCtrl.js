const HC_User = require('../Models/User');
const otpService = require('../services/OTPService');

const sendOtp = async(req,res) => {
    try{
        const{
            mobile__c
        } = req.body;
        console.log('ccccaaaa>',mobile__c);
        if(!mobile__c){
            return res.status(400).json({ success: false,message: 'Mobile number is required' });
        }
        const user = await HC_User.findOne({ mobile__c });
        console.log('ccccaaaa1>',user);
        if(!user) {
            return res.status(404).json({ success: false,message: 'User not found' });
        }
        const otp = await otpService.createOtp(user._id);
        console.log('otp>>',otp);
        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            // DEV ONLY
            otp
        });
    }catch(err){
        console.error(err);
        return res.status(500).json({ success: false,message: error.message });
    }
}
const verifyOtp = async(req,res) => {
    try{    
        const {
            mobile__c,
            otp
        } = req.body;
        const user = await HC_User.findOne({ mobile__c });
        if (!user) {
            return res.status(404).json({ success: false,message: 'User not found' });
        }
        await otpService.verifyOtp(user._id,otp,5);
        return res.status(200).json({
            success: true,
            message: 'OTP verified'
        });
    }catch(err){
        console.error(err);
        return res.status(400).json({ success: false,message: err.message });
    }
}
module.exports = {
    sendOtp,
    verifyOtp
}