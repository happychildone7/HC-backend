const mongoose = require('mongoose');

const Schema = mongoose.Schema

const hcCountrySchema = new Schema({
    name__c: { 
        type: String, 
        required: false 
    },
    code__c: { 
        type: String, 
        required: false 
    },
    active__c: { 
        type: Boolean,
        required: false
    }
},{timestamps: true})

module.exports = mongoose.model('HC_Country',hcCountrySchema,'HC_Country')