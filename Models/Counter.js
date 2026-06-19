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

module.exports = mongoose.models.HC_Counter || mongoose.model('HC_Counter',hcCounterSchema);

