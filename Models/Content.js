const mongoose = require('mongoose')

const Schema = mongoose.Schema

const hcContentSchema = new Schema({
    related_Type__c: {
        type: String,
        required: true
    },
    related_To_Id__c: {
        type: Schema.Types.ObjectId,
        required: true
    },
    type__c: {
        type: String,
        required: true
    },
    location__c: {
        type: Schema.Types.ObjectId,
        ref: 'HC_Location',  // Reference to HMS_Location collection
        required: false
    },
    primary_Image__c: {
        type: Boolean,
        required: false
    },
    title__c: {
        type: String,
        required: false
    },
    description__c: {
        type: String,
        required: false
    },
    image_URL__c: {
        type: String,
        required: false
    },
    public_Id__c: {
        type: String,
        required: false
    },
    related_To_Code__c: {
        type: String,
        required: false
    },
    active__c: {
        type: Boolean
    }
},{timestamps: true})

module.exports = mongoose.model('HC_Content',hcContentSchema,'HC_Content')

