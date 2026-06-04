const mongoose = require('mongoose');
const Counter = require('./Counter.js');
const Schema = mongoose.Schema;
const eventTypeEnum = [
                        'Annual_Day', 'Sports_Day', 'Cultural_Fest', 'Science_Fair', 'PTM',
                        'Workshop', 'Seminar', 'Field_Trip', 'Talent_Show', 'Quiz', 'Festival', 'Other'
                      ];
const amenetiesEnum = [
                        'AC_Hall', 'Outdoor_Venue', 'Stage', 'Sports_Ground', 
                        'Refreshments', 'Parking', 'Transport', 'Certificates'
                      ];

const hcEventSchema = new Schema({
    Name__c: {
        type: String
    },
    event_Code__c: {
        type: String,
        unique: true,
        immutable: true
    },
    description__c: { 
        type: String
    },
    event_Type__c: {
        type: String,
        enum: eventTypeEnum
    },
    event_Date__c: {
        type: Date,
        min: 0
    },
    event_Start_Time__c: {
        type: String,
        validate: {
            validator: function(v) {
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Invalid time format (HH:MM)'
        }
    },
    event_End_Time__c: {
        type: String
    },
    duration_Hours__c: {
        type: Number
    },
    fee_Range__c: {
        type: String,
        enum: ['Free', 'Low(₹0-500)', 'Medium(₹500-2000)', 'High(₹2000+)']
    },
    age_Group__c: {
        type: String,
        enum: ['Playgroup-KG', '1-5', '6-10', '11-12', 'All Ages']
    },
    format__c: {
        type: String,
        enum: ['Online', 'Offline', 'Hybrid']
    },
    amenities__c: {
        type: [String],
        enum: amenetiesEnum
    },
    school__c: {
        type: Schema.Types.ObjectId,
        ref: 'HC_School'
    },
    location__c: {
        type: Schema.Types.ObjectId,
        ref: 'HC_Location'
    },
    capacity__c: {
        type: Number,
        min: 0
    },
    registered_Count__c: {
        type: Number,
        default: 0
    },
    active__c: {
        type: Boolean,
        default: false
    },
    status__c: {
        type: String,
        enum: ['Draft', 'Published', 'Ongoing', 'Completed', 'Cancelled'],
        default: 'Draft'
    },
    primary_Contact__c: {
        type: Schema.Types.ObjectId,
        ref: 'HC_Contact'
    }
},{timestamps: true});

/* ────── Auto-generate eventCode before first save ────── */
hcEventSchema.pre('validate', async function (next) {
    if (this.isNew && !this.event_Code__c) {
      try {
        // Atomically grab the next seq for 'event'
        const counter = await Counter.findOneAndUpdate(
          { _id: 'event' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
  
        // Format to six-digit zero-padded string
        const code = String(counter.seq).padStart(6, '0');
        this.event_Code__c = `HCE-${code}`;
      } catch (err) {
        return next(err);
      }
    }
    next();
});

module.exports = mongoose.model('HC_Event',hcEventSchema,'HC_Event');