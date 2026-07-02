const HCUser = require('../Models/User.js');
const HCContact = require('../Models/Contact.js');
const sendEmail = require('../utils/emailService.js');
const getOtpEmailTemplate = require('../utils/emailTemplate.js');
const RedisService = require('../services/RedisService.js');

//register a user
const registerUser = async (req, res) => {
    try{
        const { email__c,password__c,phone__c } = req.body;
        if(!email__c || !password__c){
            return res.status(400).json({ error: 'Required fields missing.' });
        }
        // 2. Check for existing user by email or phone
        const userExists = await HCUser.findOne({
            $or: [
                { email__c: email__c },
                { phone__c: phone__c || null }
            ]
        });
        if(userExists && userExists.length>0){
            return res.status(400).json({ error: 'User with this email or phone already exists.' });
        }

        const otp = Math.floor(100000+Math.random() * 900000).toString();
        console.log('check',otp);
        await RedisService.set(`verify:otp:${email__c}`,
                                { 
                                    email__c,
                                    password__c,
                                    phone__c,
                                    otp 
                                },
                                3600
                            );
        console.log('Key saved:', `verify:otp:${email__c}`);
        await sendEmail({
            to: email__c,
            subject: 'Welcome to Happy Child: Your Verification Code',
            html: getOtpEmailTemplate(otp)
        });
        return res.status(200).json({ message: 'Verification email sent.' });
    }catch (err){
        console.error('Error in registerUser:', err.message);
        return res.status(500).json({ error: 'Server error during registration.' });
    }
};

//verify user email
const verifyUser = async (req, res) => {
    const { email__c,enteredOtp } = req.body;
    const redisKey = `verify:otp:${email__c}`;
    console.log('keycheck',redisKey)
    const otpData = await RedisService.get(redisKey);
    if(!otpData){
        return res.status(400).json({ error: 'OTP expired or invalid.' });
    }
    const { password__c, phone__c, otp: storedOtp } = otpData;
    if(enteredOtp !== storedOtp){
        return res.status(400).json({ error: 'Incorrect OTP.' });
    }

    //Create Contact (role: Patient)
    const contact = new HCContact({
        email__c: email__c,
        phone__c: phone__c || '',
        contact_Type__c: 'Consumer',
        active__c: true
    });
    await contact.save();

    //Create User
    const newUser = new HCUser({
        role__c: 'Consumer',
        email__c: email__c,
        phone__c: phone__c || '',
        password__c: password__c,
        contact__c: contact._id,
        active__c: true,
        last_Login__c: new Date()
    });
    await newUser.save();
    await RedisService.remove(redisKey);
    return res.status(201).json({ message: 'User registered successfully.', userId: newUser._id });
};

module.exports = {
    registerUser,
    verifyUser
}