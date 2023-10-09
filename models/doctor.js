const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');

const doctorSchema = mongoose.Schema({
    contact: { type: String, required: true },
    gender: { type: String, required: true },
    image: { type: String},
    specialization: { type: String, required: true },
    description: { type: String, required: true },
    experience: { type: String, required: true },
    fees: {type: String, required: true},
    time: {type: String, required: true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

doctorSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Doctor', doctorSchema);