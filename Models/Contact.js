const mongoose = require('mongoose');
const Counter = require('./Counter.js');

const Schema = mongoose.Schema

const hcContactSchema = new Schema({
    first_Name__c: { 
        type: String, 
        required: false 
    },
    middle_Name__c: { 
        type: String, 
        required: false 
    },
    last_Name__c: { 
        type: String,
        required: false
    },
    full_Name__c: { 
        type: String,
        required: false 
    },
    contact_Type__c: {
        type: String,
        enum: ['Internal', 'Consumer'], 
        required: true
    },
    phone__c: { 
        type: String,
        required: false
    },
    email__c: { 
        type: String,
        required: false
    },
    gender__c: { 
        type: String,
        required: false
    },
    date_Of_Birth__c: { 
        type: Date,
        required: false
    },
    qualification__c: {
        type: String,
        required: false 
    },
    specialization__c: { 
        type: String,
        required: false 
    }, 
    experience_Years__c: {
        type: Number,
        required: false
    },
    active__c: { 
        type: Boolean,
        required: false
    },
    contact_Code__c: {
        type: String,
        unique: true,
        immutable: true
    }
},{timestamps: true})

/* ────── Auto-generate registrationNumber before first save ────── */
hcContactSchema.pre('validate', async function (next) {
    if (this.isNew && !this.contact_Code__c) {
      try {
        // Atomically grab the next seq for 'event'
        const counter = await Counter.findOneAndUpdate(
          { _id: 'contact' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
  
        // Format to six-digit zero-padded string
        const code = String(counter.seq).padStart(6, '0');
        this.contact_Code__c = `HCC-${code}`;
      } catch (err) {
        return next(err);
      }
    }
    next();
});
/* hcContactSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = this.getUpdate();

    // check if contact_Code__c already being set
    if (
      update.contact_Code__c ||
      update.$set?.contact_Code__c
    ) {
      return next();
    }
    const docToUpdate = await this.model.findOne(this.getQuery());

      // populate only if existing record has no code
      if (docToUpdate && !docToUpdate.contact_Code__c) {
        const counter = await Counter.findOneAndUpdate(
          { _id: 'contact' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );

       const code = `HCC-${String(counter.seq).padStart(6, '0')}`;
        this.setUpdate({
           ...update,
            $set: {
            ...(update.$set || {}),
            contact_Code__c: code
            }
        });
      }

    next();
  } catch (err) {
    next(err);
  }
}); */

module.exports = mongoose.model('HC_Contact',hcContactSchema,'HC_Contact')