const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EntityTypeEnum = [
                            'HC_Promotion', 'HC_Event', 'HC_School', 'HC_Tutor', 'HC_Institute'
                         ];

const hcAnalyticsSchema = new Schema({
    entity_Type__c: {
        type: String,
        required: true,
        enum: EntityTypeEnum,
        index: true
    },
    entity_Id__c: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
        refPath: 'entity_Type__c'
    },
    analytics_Date__c: {
        type: Date,
        required: true,
        index: true
    },
    impressions__c: {
        type: Number,
        default: 0,
        min: 0
    },
    clicks__c: {
        type: Number,
        default: 0,
        min: 0
    },
    views__c: {
        type: Number,
        default: 0,
        min: 0
    },
    saves__c: {
        type: Number,
        default: 0,
        min: 0
    },
    enquiries__c: {
        type: Number,
        default: 0,
        min: 0
    },
    bookings__c: {
        type: Number,
        default: 0,
        min: 0
    }
},{timestamps: true});

hcAnalyticsSchema.index(
    {
        entity_Type__c: 1,
        entity_Id__c: 1,
        analytics_Date__c: 1
    },
    {
        unique: true
    }
);


module.exports = mongoose.model('HC_Analytics',hcAnalyticsSchema,'HC_Analytics');