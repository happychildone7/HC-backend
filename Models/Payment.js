const mongoose = require('mongoose');
const Counter = require('./Counter.js');
const Schema = mongoose.Schema;

const relatedTypeEnum = [ 'HC_Promotion', 'HC_Registration', 'Admission', 'ProductOrder', 'Subscription' ];
const paymentStatusEnum = [ 'Pending', 'Paid', 'Failed', 'Refunded' ];
const gatewayEnum = [ 'Razorpay' ];


const hcPaymentSchema = new Schema({
    payment_Number__c: {
        type: String,
        unique: true,
        immutable: true
    },
    related_To_Id__c: {
        type: Schema.Types.ObjectId,
        required: true
    },
    related_Type__c: {
        type: String,
        required: true,
        enum: relatedTypeEnum
    },
    amount__c: {
        type: Number,
        required: true
    },
    currency__c: {
        type: String,
        default: 'INR'
    },
    gateway__c: {
        type: String,
        enum: gatewayEnum,
        default: 'Razorpay'
    },
    payment_Status__c: {
        type: String,
        enum: paymentStatusEnum,
        default: 'Pending'
    },
    gateway_Order_Id__c: {
        type: String
    },
    gateway_Payment_Id__c: {
        type: String
    },
    gateway_Signature__c: {
        type: String
    },
    paid_At__c: {
        type: Date
    },
    created_By__c: {
        type: Schema.Types.ObjectId,
        ref: 'HC_User'
    }
},{timestamps: true});

hcPaymentSchema.index({
    related_To_Id__c: 1,
    related_Type__c: 1,
});
hcPaymentSchema.index({
    payment_Status__c:1
});

/* ────── Auto-generate PaymentNumber before first save ────── */
hcPaymentSchema.pre('validate', async function (next) {
    if (this.isNew && !this.payment_Number__c) {
      try {
        // Atomically grab the next seq for 'event'
        const counter = await Counter.findOneAndUpdate(
          { _id: 'payment' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
  
        // Format to six-digit zero-padded string
        const code = String(counter.seq).padStart(6, '0');
        this.payment_Number__c = `HCPMT-${code}`;
      } catch (err) {
        return next(err);
      }
    }
    next();
});

module.exports = mongoose.model('HC_Payment',hcPaymentSchema,'HC_Payment');