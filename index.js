const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routes/auth");
const appointmentRouter = require("./routes/appointment");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(authRouter);
app.use(appointmentRouter);

const DB = "mongodb+srv://POC:POC@cluster0.rstexg0.mongodb.net/";

mongoose.connect(DB).then(() => {
    console.log("Connected to database");
}).catch((error) => {
    console.log(error);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Connected at port ${PORT}`);
})