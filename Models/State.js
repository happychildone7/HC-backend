const mongoose = require('mongoose');

const Schema = mongoose.Schema

const hcStateSchema = new Schema({
    name__c: { 
        type: String, 
        required: true 
    },
    code__c: { 
        type: String, 
        required: false 
    },
    country__c: {
        type: Schema.Types.ObjectId,
        ref: 'HC_Country',
        required: true
    },
    active__c: { 
        type: Boolean,
        required: false
    }
},{timestamps: true})

module.exports = mongoose.model('HC_State',hcStateSchema,'HC_State')