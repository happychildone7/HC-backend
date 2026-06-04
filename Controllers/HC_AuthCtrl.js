const bcrypt = require('bcryptjs');
const HCUser = require('../Models/User.js');
const HCContact = require('../Models/Contact.js');
const { generateToken } = require('../utils/jwtUtils.js');
const { client } = require('../utils/oauthUtils.js');

const loginUser = async (req,res) => {
    const { email__c,password__c } = req.body;
    if(!email__c || !password__c){
        return res.status(400).json({ error: 'Required fields missing.' });
    }
    const existingUser = await HCUser.findOne({ email__c: email__c}).populate('contact__c');
    if(!existingUser) return res.status(401).json({ error: 'User not found. Please check the Email.' });
    const isMatch = await bcrypt.compare(password__c,existingUser.password__c);
    if(!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = generateToken(existingUser);
    console.log('toklen>',existingUser);

    res.cookie('hc_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 60 * 60 * 1000 // 1 hour 
    });

    return res.status(200).json({
        message: 'Login successful',
        user: {
            id: existingUser._id,
            email: existingUser.email__c,
            phone: existingUser.phone__c,
            role: existingUser.role__c,
            contactId: existingUser.contact__c?._id
        }
    });
};

const googleLogin = async (req,res) => {
    const { accessCode } = req.body;
    console.log('usercheck',accessCode);
    try{
        const { tokens } = await client.getToken(accessCode);
        console.log('usercheck',tokens);
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;
        let user = await HCUser.findOne({ email__c: email}).populate('contact__c');
        let contact = null;
        if(!user){
            //Create Contact (role: Patient)
            contact = new HCContact({
                email__c: email,
                contact_Type__c: 'Consumer',
                active__c: true
            });
            await contact.save();

            //Create User
            user = new HCUser({
                role__c: 'Consumer',
                email__c: email,
                password__c: 'GOOGLE_AUTH_USER',
                contact__c: contact._id,
                active__c: true,
                last_Login__c: new Date()
            });
            await user.save();
        }
        else{
            contact = user.contact__c;
        }
        const token = generateToken(user);
        console.log('toklen>',token);

        res.cookie('hc_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 60 * 60 * 1000 // 1 hour 
        });

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email__c,
                phone: user.phone__c,
                role: user.role__c,
                contactId: user.contact__c?._id
            },
            contact
        });
    }catch (err){
        return res.status(500).json({ error: 'Google Signin failed.' });
    }
};

const facebookLogin = async (req,res) => {
    const { accessToken,userId } = req.body;
    try{
        // Validate token with Facebook
        const fbRes = await fetch(
            `https://graph.facebook.com/${userId}?fields=id,name,email,picture&access_token=${accessToken}`
        );
        const fbUser = await fbRes.json();
        if(!fbUser || fbUser.error){
            return res.status(401).json({ error: 'Invalid facebook token.' });
        }
        //find user ib db with fb email
        let user = await HCUser.findOne({ email__c: fbUser.email}).populate('contact__c');
        console.log('payload>.',user);
        if(!user){
            //Create Contact (role: Patient)
            const contact = new HCContact({
                email__c: fbUser.email,
                contact_Type__c: 'Consumer',
                active__c: true
            });
            await contact.save();

            //Create User
            user = new HCUser({
                role__c: 'Conusmer',
                email__c: fbUser.email,
                password__c: 'FACEBOOK_AUTH_USER',
                contact__c: contact._id,
                active__c: true,
                last_Login__c: new Date()
            });
            await user.save();
        }
        const token = generateToken(user);
        console.log('toklen>',token);

        res.cookie('hc_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 60 * 60 * 1000 // 1 hour 
        });

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email__c,
                phone: user.phone__c,
                role: user.role__c,
                contactId: user.contact__c?._id
            }
        });
    }catch (err){
        return res.status(500).json({ error: 'Facebook Signin failed.' });
    }
};

const checkLoginStatus = async (req, res) => {
    try{
        const user = await HCUser.findById(req.user.id).populate('contact__c');
        if(!user) return res.status(404).json({ error: 'User not found or session ended.' });
        return res.status(200).json({ 
            user: {
                id: user._id,
                email: user.email__c,
                phone: user.phone__c,
                role: user.role__c,
                contactId: user.contact__c?._id
            },
            contact: user.contact__c
        });
    }catch (err){
        return res.status(500).json({ error: 'Failed to fetch user.' });
    }
};

const logoutUser = async (req, res) => {
    try{
        res.clearCookie('hc_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });
        res.status(200).json({ message: 'Logged out successfully.' });
    }catch (err){
        res.status(500).json({ error: 'Error in logout.' });
    }
};

module.exports = {
    loginUser,
    googleLogin,
    facebookLogin,
    checkLoginStatus,
    logoutUser
}