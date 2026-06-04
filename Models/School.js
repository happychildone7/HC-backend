const mongoose = require('mongoose');
const Counter = require('./Counter.js');

const Schema = mongoose.Schema
const classEnum = [
  'Play Group', 'Pre-Nursery', 'Nursery', 'LKG', 'UKG',
  'Class_1', 'Class_2', 'Class_3', 'Class_4', 'Class_5', 'Class_6', 'Class_7', 'Class_8', 'Class_9', 'Class_10', 'Class_11', 'Class_12'
];
const facilityEnum = ['Playground', 'Library', 'Computer_Lab', 'Swimming_Pool', 'Canteen', 'Sports_Complex', 'Horse_Riding'];

const hcSchoolSchema = new Schema({
    Name__c: {
        type: String,
        required: true
    },
    description__c: {
        type: String
    },
    location__c: {
        type: Schema.Types.ObjectId,
        ref: 'HC_Location',
        required: true
    },
    contact__c: {
        type: Schema.Types.ObjectId,
        ref: 'HC_Contact'
    },
    board__c: {
        type: String, 
        enum: ['CBSE','ICSE','State','IB','CISCE'] 
    },
    ownership_Type__c: {
        type: String,
        enum: ['Government','Private','International']
    },
    type__c: {
        type: String, 
        enum: ['Day','Boarding','Online'] 
    },
    fee_Monthly_Min__c: {
        type: Number
    },
    co_Ed_Status__c: {
        type: String, 
        enum: ['Boys_Only','Girls_Only','Co_Ed'] 
    },
    medium_Instruction__c: {
        type: String,
        enum: ['English','Hindi','Bengali']
    },
    classes__c: {
        type: [String],
        enum: classEnum
    },
    age_Criteria_Min__c: {
        type: Number 
    },
    age_Criteria_Max__c: {
        type: Number 
    },
    beginning_Class__c: {
        type: String
    },
    end_Class__c: {
        type: String
    },
    facilities__c: {
        type: [String],
        enum: facilityEnum
    },          // playground, lab, pool...
    rating_Avg__c: {
        type: Number, 
        default: 0 
    },
    rating_Count__c: {
        type: Number, 
        default: 0 
    },
    admission_Status__c: {
        type: String, 
        enum: ['Ongoing','Closed'] 
    },
    school_Code__c: {
        type:   String,
        unique: true,
        immutable: true
    },
    active__c: { 
        type: Boolean,
        default: false
    }
},{timestamps: true});

/* ────── Auto-generate schoolCode before first save ────── */
hcSchoolSchema.pre('validate', async function (next) {
    if (this.isNew && !this.school_Code__c) {
      try {
        // Atomically grab the next seq for 'school'
        const counter = await Counter.findOneAndUpdate(
          { _id: 'school' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
  
        // Format to six-digit zero-padded string
        const code = String(counter.seq).padStart(6, '0');
        this.school_Code__c = `HCS-${code}`;
      } catch (err) {
        return next(err);
      }
    }
    next();
});

module.exports = mongoose.model('HC_School',hcSchoolSchema,'HC_School')

