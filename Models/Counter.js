const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const hcCounterSchema = new Schema({
    _id: { 
        type: String, // 'school', 'tutor', …
        required: true 
    }, 
    seq: { 
        type: Number, default: 0 
    }
});

module.exports = mongoose.model('HC_Counter',hcCounterSchema,'HC_Counter')

