const mongoose = require('mongoose')

const Schema = mongoose.Schema

const LocationSchema = new Schema({
    line1__c: {
        type: String
    },
    line2__c: {
        type: String
    },
    location_Name__c: {
        type: String
    },
    location_Type__c: {
        type: String,
        enum: ['Urban','Suburban','Rural','Semi-Urban','Hill-Area','Coastal','Remote','Tribal'], 
        required: true
    },
    city__c: {
        type: String,
        required: true
    },
    state__c: {
        type: String,
        required: true
    },
    country__c: {
        type: String,
        required: true
    },
    pin__c: {
        type: String
    },
    coordinates__c: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true
        },
            coordinates: {
            type: [Number], // [lng, lat]
            required: true,
            index: '2dsphere'
        }
    }
},{timestamps: true})

module.exports = mongoose.model('HC_Location',LocationSchema,'HC_Location')

