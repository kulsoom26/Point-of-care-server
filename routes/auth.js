const express = require("express");
const bcryptjs = require("bcryptjs");
const User = require("../models/user");
const Doctor = require("../models/doctor");
const Patient = require("../models/patient");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

//User Registration
authRouter.post("/api/signup", async (req, res) => {
    try{
        const {name, email, password, role} = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser){
            return res
            .status(400)
            .json({ msg: "User with same email already exists!" });
        }

        const hashedPassword = await bcryptjs.hash(password, 8);

        let user = new User({
            email,
            password: hashedPassword,
            name,
            role,
        });
        user = await user.save();
        const token = jwt.sign({ id: user._id }, "passwordKey");
        res.json({token, ...user._doc });


    }catch (error) {
        res.status(500).json({ error: error.message});
    }
});

//User Signin
authRouter.post("/api/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        let doctor;
        let patient;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "User is not registered!" });
        }

        const passwordMatch = await bcryptjs.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ msg: "Incorrect password!" });
        }

        if(user.role == 'Doctor'){
            doctor = await Doctor.findOne({ userId: user._id });
        }
        if (user.role == 'Patient'){
            patient = await Patient.findOne({ userId: user._id });
        }

        const token = jwt.sign({ id: user._id }, "passwordKey");
        
        if(user.role == 'Doctor'){
            res.json({ token, user, doctor });
        }
        if(user.role == 'Patient'){
            res.json({ token, user, patient });
        }
        

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


authRouter.post("/tokenIsValid", async (req, res) => {
    try{
        const token = req.header("x-auth-token");
        if(!token) return res.json(false);
        const verified = jwt.verify(token, "passwordKey");
        if (!verified) return res.json(false);
        if(!user) return res.json(false);
        res.json(true);

        const user = await User.findById(verified.id);
    } catch (error){

    }
});

//get user data
authRouter.get("/", auth, async (req, res) => {
    const user = await User.findById(req.user);
    res.json({...user._doc, token: req.token});
});

//add doctor
authRouter.post("/api/addDoctor", async (req, res) => {
    try{
        const {userId, contact, gender, experience, image, specialization, description, fees, time} = req.body;

        let doctor = new Doctor({
            userId,
            fees,
            description,
            image,
            specialization,
            gender,
            contact,
            experience,
            time,
          });
        doctor = await doctor.save();
        res.json(doctor);
        console.log(res.json);

    }catch (error) {
        res.status(500).json({ error: error.message});
    }
});

authRouter.post("/api/addPatient", async (req, res) => {
    try{
        const {userId, age, contact, gender, image} = req.body;

        let patient = new Patient({
            userId,
            image,
            gender,
            contact,
            age,
          });
        patient = await patient.save();
        res.json(patient);

    }catch (error) {
        res.status(500).json({ error: error.message});
    }
});


authRouter.post("/api/emailVerification", async (req, res) => {
    try {
        const { email} = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            console.log(false);
            return res.json(false);
        }
        else{
            console.log(true);
            return res.json(user);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

authRouter.post("/api/passwordReset", async (req, res) => {
    try {
        const { email, password, confirmPassword} = req.body;
        if (password != confirmPassword) {
            return res.status(400).json({ msg: "Please match the password!" });
        }
        const user = await User.findOne({ email });
        const hashedPassword = await bcryptjs.hash(password, 8);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ msg: "Password updated successfully!" });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

authRouter.post("/api/updateDoctor", async (req, res) => {
    try {
        const { email, name, contact, gender, specialization, experience, description, time, fees, image } = req.body;
        if (!email || !name || !contact || !gender || !specialization || !experience || !description || !time || !fees) {
            return res.status(400).json({ msg: "Please fill all the fields!" });
        }

        const updatedUser = await User.findOneAndUpdate({ email }, { name }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ msg: "User not found" });
        }
        

        const updatedDoctor = await Doctor.findOneAndUpdate({ userId: updatedUser._id }, {
            image,
            contact,
            gender,
            specialization,
            experience,
            description,
            time,
            fees
        }, { new: true });

        if (!updatedDoctor) {
            return res.status(404).json({ msg: "Doctor not found" });
        }
        console.log(updatedDoctor, updatedUser);
        res.status(200).json({ updatedUser, updatedDoctor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


authRouter.post("/api/updatePatient", async (req, res) => {
    try {
        const { name, contact, gender, email,age, image} = req.body;
        if (!email || !name || !contact || !gender || !age) {
            return res.status(400).json({ msg: "Please fill all the fields!" });
        }
        const updatedUser = await User.findOneAndUpdate({ email }, { name }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        const updatedPatient = await Patient.findOneAndUpdate({ userId: updatedUser._id }, {
            image,
            contact,
            gender,
            age,
        }, { new: true });

        if (!updatedPatient) {
            return res.status(404).json({ msg: "Patient not found" });
        }
        console.log(updatedPatient, updatedUser);
        res.status(200).json({ updatedUser, updatedPatient });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

authRouter.post("/api/deleteAccount", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let deletedUser;
    let deletedType;

    if (user.role === 'Doctor') {
      const doctor = await Doctor.findOne({ userId: user._id });

      if (doctor) {
        deletedType = await Doctor.findByIdAndDelete(doctor._id);
      }
    } else if (user.role === 'Patient') {
      const patient = await Patient.findOne({ userId: user._id });

      if (patient) {
        deletedType = await Patient.findByIdAndDelete(patient._id);
      }
    }

    deletedUser = await User.findByIdAndDelete(user._id);

    

    res.status(200).json(true);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

authRouter.get("/api/user/getAllDoctors", async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('userId', ['name', 'email', 'role']);
        console.log(doctors)
        res.status(200).json(doctors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



module.exports =authRouter;