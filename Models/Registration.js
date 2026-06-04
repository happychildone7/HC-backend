const mongoose = require('mongoose');
const Counter = require('./Counter.js');
const Schema = mongoose.Schema;
const statusEnum = [
                     'Draft', 'Registered', 'Waitlisted', 'Cancelled', 'Rejected', 'Checked_In'
                    ];
const attendanceStatusEnum = [
                                'Not_Checked_In', 'Attended', 'No_Show'
                             ];
const paymentStatusEnum = [
                            'Not_Required', 'Paid', 'Pending', 'Refunded', 'Failed'
                         ];

const hcRegistrationSchema = new Schema({
    registration_Number__c: {
        type: String,
        unique: true,
        immutable: true
    },
    contact__c: {
        type: Schema.Types.ObjectId,
        ref: 'HC_Contact'
    },
    event__c: {
        type: Schema.Types.ObjectId,
        ref: 'HC_Event'
    },
    status__c: {
        type: String,
        enum: statusEnum
    },
    attendance_Status__c: { 
        type: String,
        enum: attendanceStatusEnum
    },
    payment_Status__c: { 
        type: String,
        enum: paymentStatusEnum
    },
    registered_On__c: {
        type: Date,
        default: Date.now
    },
    waitlist_Position__c: {
        type: Number,
        min: 1
    },
    seat_Count__c: {
        type: Number,
        default: 1,
        min: 1
    },
    notes__c: {
        type: String
    },
    consent__c: {
        type: Boolean,
        default: false
    }
},{timestamps: true});

hcRegistrationSchema.index(
  { contact__c: 1, event__c: 1 },
  { unique: true }
);

/* ────── Auto-generate registrationNumber before first save ────── */
hcRegistrationSchema.pre('validate', async function (next) {
    if (this.isNew && !this.registration_Number__c) {
      try {
        // Atomically grab the next seq for 'event'
        const counter = await Counter.findOneAndUpdate(
          { _id: 'registration' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
  
        // Format to six-digit zero-padded string
        const code = String(counter.seq).padStart(6, '0');
        this.registration_Number__c = `HCR-${code}`;
      } catch (err) {
        return next(err);
      }
    }
    next();
});

module.exports = mongoose.model('HC_Registration',hcRegistrationSchema,'HC_Registration');