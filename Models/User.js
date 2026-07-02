const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema

const roleEnum = ['Consumer', 'Admin', 'Partner'];

const hcUserSchema = new Schema({
    role__c: {
        type: String,
        enum: roleEnum, 
        required: true
    },
    phone__c: { 
        type: String,
        required: false
    },
    mobile__c: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    mobile_Verified__c: {
        type: Boolean,
        default: false
    },
    otp__c: { 
        type: String
    },
    otp_Expiry__c: {
        type: Date
    },
    otp_Attempts__c: {
        type: Number,
        default: 0
    },
    email__c: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },
    password__c: {
        type: String
    },
    contact__c: { 
        type: Schema.Types.ObjectId,
        ref: 'HC_Contact',
        required: true
    },
    active__c: { 
        type: Boolean
    },
    last_Login__c: {
        type: Date
    }
},{timestamps: true});
hcUserSchema.index({ mobile__c: 1 });
hcUserSchema.index({ email__c: 1 });

// Hash password before saving
hcUserSchema.pre('save', async function (next) {
    if(!this.isModified('password__c')){
        return next();
    }
    try{
        const salt = await bcrypt.genSalt(10);
        this.password__c = await bcrypt.hash(this.password__c,salt);
        return next();
    }catch(error){
        return next(error);
    }
});

// Method to compare password during login
hcUserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password__c);
};

module.exports = mongoose.model('HC_User',hcUserSchema,'HC_User')