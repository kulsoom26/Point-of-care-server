const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');

const appointmentSchema = mongoose.Schema({
    contact: { type: String, required: true },
    gender: { type: String, required: true },
    reason: { type: String},
    age: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, required: true },
    date: {type: String, required: true},
    time: {type: String, required: true},
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

appointmentSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Appointment', appointmentSchema);