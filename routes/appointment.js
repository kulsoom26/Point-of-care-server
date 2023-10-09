const express = require("express");
const User = require("../models/user");
const mongoose = require('mongoose');
const Doctor = require("../models/doctor");
const Patient = require("../models/patient");
const Appointment = require("../models/appointment");
const appointmentRouter = express.Router();
const jwt = require("jsonwebtoken");

appointmentRouter.get('/api/user/getDoctorInformation/:userId', async (req, res) => {
    try {
        const id = req.params.userId;
        const filter = { userId: id };
        const doctor = await Doctor.findOne(filter).populate('userId', ['name', 'email', 'role']);
        
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        console.log(doctor);
        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

appointmentRouter.post("/api/user/addAppointment", async (req, res) => {
    try {
        const { doctorId, userId, contact, gender, reason, status, date, name, age, time } = req.body;
        if (!time || !name || !contact || !gender || !reason || !status || !date || !age) {
            return res.status(400).json({ msg: "Please fill all the fields!" });
        }
        const existingAppointment = await Appointment.findOne({
            doctorId,
            date,
            time
        });

        if (existingAppointment) {
            return res.status(400).json({ msg: "Doctor already has an appointment at the requested time." });
        }

        let appointment = new Appointment({
            doctorId,
            userId,
            time,
            reason,
            name,
            status,
            gender,
            contact,
            date,
            age,
        });
        appointment = await appointment.save();
        res.json(appointment);
        console.log(appointment);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

appointmentRouter.get('/api/user/getUserAppointments/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const filter = { userId: userId };

        const appointmentsList = [];
        const appointments = await Appointment.find(filter)
            .populate({
                path: 'doctorId',
                populate: {
                    path: 'userId',
                    model: 'User',
                    select: 'name'
                },
                select: 'image userId'
            })
            .select('name status date time');

            appointments.forEach(appointment => {
                const { _id, name, status, date, time, doctorId } = appointment;
                const { image, userId } = doctorId;
                const appointmentObject = {
                    _id,
                    name,
                    status,
                    date,
                    time,
                    doctorId: {
                        image,
                        doctorName: userId.name
                    }
                };
                appointmentsList.push(appointmentObject);
            });
        

        res.status(200).json(appointmentsList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


appointmentRouter.get('/api/user/getDoctorAppointments/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(userId);
        const filter = { doctorId: userId };
        const appointments = await Appointment.find(filter);
        console.log(appointments);
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


appointmentRouter.get('/api/user/getSingleAppointment/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: id };
        const appointment = await Appointment.findOne(filter);
        
        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }
        console.log(appointment);
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


appointmentRouter.post("/api/user/updateAppointment/:id", async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const {
            doctorId,
            userId,
            contact,
            gender,
            reason,
            status,
            date,
            name,
            age,
            time
        } = req.body;

        if (!time || !name || !contact || !gender || !reason || !status || !date || !age) {
            return res.status(400).json({ msg: "Please fill all the fields!" });
        }

        const existingAppointment = await Appointment.findById(appointmentId);

        if (!existingAppointment) {
            return res.status(404).json({ msg: "Appointment not found." });
        }
        const conflictingAppointment = await Appointment.findOne({
            _id: { $ne: appointmentId },
            doctorId,
            date,
            time
        });

        if (conflictingAppointment) {
            return res.status(400).json({ msg: "Doctor already has an appointment at the requested time." });
        }
        existingAppointment.doctorId = doctorId;
        existingAppointment.userId = userId;
        existingAppointment.contact = contact;
        existingAppointment.gender = gender;
        existingAppointment.reason = reason;
        existingAppointment.status = status;
        existingAppointment.date = date;
        existingAppointment.name = name;
        existingAppointment.age = age;
        existingAppointment.time = time;
        const updatedAppointment = await existingAppointment.save();

        res.json(updatedAppointment);
        console.log(updatedAppointment);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




appointmentRouter.post("/api/user/cancelAppointment", async (req, res) => {
    try {
        const appointmentId = req.body.id;
        const {
            status,
        } = req.body;
        console.log(appointmentId);
      console.log(status);
      const existingAppointment = await Appointment.findById(appointmentId);
      existingAppointment.status = status;
      const updatedAppointment = await existingAppointment.save();
      console.log(updatedAppointment);
  
      res.json(updatedAppointment);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: error.message });
    }
  });


  appointmentRouter.post("/api/user/completeAppointment/:id", async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const {
            status,
        } = req.body;
        console.log(appointmentId);
      console.log(status);
      const existingAppointment = await Appointment.findById(appointmentId);
      existingAppointment.status = status;
      const updatedAppointment = await existingAppointment.save();
      console.log(updatedAppointment);
  
      res.json(updatedAppointment);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: error.message });
    }
  });
  



module.exports = appointmentRouter;
