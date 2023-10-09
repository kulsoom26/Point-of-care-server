const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');

const patientSchema = mongoose.Schema({
    contact: { type: String, required: true },
    gender: { type: String, required: true },
    image: { type: String},
    age: { type: String, required: true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

patientSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Patient', patientSchema);
