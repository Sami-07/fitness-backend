import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dashboardRoutes from "./routes/dashboard.js";
import 'dotenv/config'
import User from "./models/User.js";

const app = express();
app.use(cors({
    origin: "https://fitness-freak-xi.vercel.app",
    methods: ["GET", "POST"]
}))
// const corsOptions = {
//     // 
//     origin: 'https://fitness-freak-xi.vercel.app', // Replace with the origin of your frontend application

//     credentials: true,
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify the allowed HTTP methods
//     allowedHeaders: 'Content-Type,Authorization', // Specify the allowed headers
//     exposedHeaders: 'Content-Length', // Specify the headers exposed to the client
//     preflightContinue: false, // Disable preflight requests caching
//     optionsSuccessStatus: 204, // Set the response status for successful CORS preflight requests
// };

// // Use CORS middleware with options
// app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "30mb", extended: true }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))



const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => app.listen(PORT, () => console.log(`Server is running on port ${PORT}`)))
    .catch(err => console.log(err.message));



// app.post("/register", async function (req, res) {



//     let user = new User({
//         name: req.body.userName,
//         email: (req.body.email).toLowerCase()
//     })

//     await user.save();

// })
// app.post("/registergoogleuser", async function (req, res) {
//     const { displayName, email } = req.body;

//     let data = await User.findOne({ email: email });
//     if (data) {

//         res.json({ status: true });
//     }
//     else {
//         let user = new User({
//             name: req.body.displayName,
//             email: req.body.email
//         })
//         await user.save();
//         res.json({ status: true })
//     }

// })

//here, all the routes inside dashboardRoutes starts from "https://fitness-webapp-backend.vercel.app/dashboard"
app.use("/dashboard", dashboardRoutes);