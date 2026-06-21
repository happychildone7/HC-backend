const mongoose = require('mongoose');
const Counter = require('./Counter.js');
const Schema = mongoose.Schema;
const wishlistTypeEnum = [
                            'Wishlist', 'Favorite', 'Save_For_Later'
                        ];
const relatedTypeEnum = [
                            'HC_School', 'HC_Event', 'HC_Tutor', 'HC_Institute', 'HC_Product'
                         ];

const hcWishlistSchema = new Schema({
    wishlist_Number__c: {
        type: String,
        unique: true,
        immutable: true
    },
    contact__c: {
        type: Schema.Types.ObjectId,
        ref: 'HC_Contact'
    },
    related_To_Id__c: {
      type: String,
      required: true
    },
    related_Type__c: {
      type: String,
      required: true,
      enum: relatedTypeEnum
    },
    related_To_Code__c: {
        type: String,
        required: false
    },
    wishlist_Type__c: {
        type: String,
        enum: wishlistTypeEnum,
        default: 'Wishlist'
    },
    wishlisted_On__c: {
        type: Date,
        default: Date.now
    },
    notes__c: {
        type: String
    }
},{timestamps: true});

hcWishlistSchema.index(
  { contact__c: 1, related_To_Id__c: 1, related_Type__c: 1 },
  { unique: true }
);

/* ────── Auto-generate WishlistNumber before first save ────── */
hcWishlistSchema.pre('validate', async function (next) {
    if (this.isNew && !this.wishlist_Number__c) {
      try {
        // Atomically grab the next seq for 'event'
        const counter = await Counter.findOneAndUpdate(
          { _id: 'wishlist' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
  
        // Format to six-digit zero-padded string
        const code = String(counter.seq).padStart(6, '0');
        this.wishlist_Number__c = `HCW-${code}`;
      } catch (err) {
        return next(err);
      }
    }
    next();
});

module.exports = mongoose.model('HC_Wishlist',hcWishlistSchema,'HC_Wishlist');