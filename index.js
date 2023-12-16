import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dashboardRoutes from "./routes/dashboard.js";
import 'dotenv/config'
// import { auth } from "./config/firebaseConfig.js"
import User from "./models/User.js";
// import  admin from "firebase-admin"
// import serviceAccount from "./config/serviceAccount.json" assert {type: "json"}
import admin from "firebase-admin"
const app = express();
app.use(bodyParser.json({ limit: "30mb", extended: true }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))

app.use(cors());

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// })

mongoose.connect(process.env.MONGODB_URI)
    .then(() => app.listen(5000, () => console.log("Server is running on port 5000")))
    .catch(err => console.log(err.message));

// app.use(async (req, res, next) => {
//     const idToken = req.headers.authorization.split(' ')[1];
//     console.log("id in use", idToken);
//     try {
//         const decodedToken = await admin.auth.verifyIdToken(idToken);
//         req.user = decodedToken; // Attach the user information to the request object
//         console.log("req", req.user)
//         next();
//     } catch (error) {
//         // Handle authentication failure
//         res.status(401).json({ error: 'Unauthorized' });
//     }
// });

app.post("/register", async function (req, res) {
    let user = new User({
        name: req.body.userName,
        email: req.body.email
    })
    await user.save();

})










//here, all the routes inside dashboardRoutes starts from "https://localhost:300/dashboard"
app.use("/dashboard", dashboardRoutes);