const mongoose = require('mongoose');
const Counter = require('./Counter.js');
const Schema = mongoose.Schema;

const relatedTypeEnum = [
                            'School', 'Event', 'Tutor', 'Institute', 'Product', 'None'
                         ];
const promotionTypeEnum = [
                                'Featured', 'Premium', 'HomepageBanner'
                             ];
const paymentStatusEnum = [
                     'Pending', 'Paid', 'Expired'
                    ];

const hcPromotionSchema = new Schema({
    promotion_Number__c: {
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
    promotion_Type__c: {
        type: String,
        enum: promotionTypeEnum,
        default: 'Featured'
    },
    priority__c: {
        type: Number,
        default: 1
    },
    start_Date__c: {
        type: Date
    },
    end_Date__c: {
        type: Date
    },
    active__c: {
        type: Boolean,
        default: false
    },
    payment_Status__c: {
        type: String,
        enum: paymentStatusEnum,
        default: 'Pending'
    },
    notes__c: {
        type: String
    }
},{timestamps: true});

hcPromotionSchema.index({
    related_To_Id__c: 1,
    related_Type__c: 1,
    promotion_Type__c: 1,
    active__c: 1
});

/* ────── Auto-generate PromotionNumber before first save ────── */
hcPromotionSchema.pre('validate', async function (next) {
    if (this.isNew && !this.promotion_Number__c) {
      try {
        // Atomically grab the next seq for 'event'
        const counter = await Counter.findOneAndUpdate(
          { _id: 'promotion' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
  
        // Format to six-digit zero-padded string
        const code = String(counter.seq).padStart(6, '0');
        this.promotion_Number__c = `HCR-${code}`;
      } catch (err) {
        return next(err);
      }
    }
    next();
});

module.exports = mongoose.model('HC_Promotion',hcPromotionSchema,'HC_Promotion');