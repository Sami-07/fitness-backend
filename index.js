import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dashboardRoutes from "./routes/dashboard.js";

import User from "./models/User.js";
import cookieParser from 'cookie-parser'
import { validate } from './middleware/auth.js';
import { registerFunction } from './controllers/dashboardControllers.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const app = express();
app.use(cookieParser())

app.use(cors({
    // origin: 'http://localhost:3000',
    origin: "https://fitness-freak-xi.vercel.app",
    // origin: "https://fitness-freak-sami07s-projects.vercel.app",
    // origin : "*",
    credentials: true,
    // exposedHeaders: ["set-cookie"]
    exposedHeaders: ["Set-cookie"],
}));
app.use(bodyParser.json({ limit: "30mb", extended: true }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
    .then(() => app.listen(PORT, () => console.log(`Server is running on port ${PORT}`)))
    .catch(err => console.log(err.message));

app.get("/api-health", (req, res) => {
    // res.cookie("test", "test", {
    //     maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: "none",
    //     secure: true
    // })
    res.send("Hello to Fitness Webapp API");
})
app.post("/register", registerFunction);
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            email: email,

        });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (user) {
            const token = await jwt.sign({ id: user._id, name: user.name, email }, process.env.JWT_SECRET, { expiresIn: "30d" })

            res.cookie("token", token, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true,
                sameSite: 'None'

            })
            res.json({ message: "Logged in successfully", user: { name: user.name, email: user.email } });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error while logging in" })
    }
}
)


app.post("/logout", (req, res) => {
    try {
        res.clearCookie("token");

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error while logging out" })
    }
})
app.use(validate);

//here, all the routes inside dashboardRoutes starts from "https://fitness-webapp-backend.vercel.app/dashboard"
app.use("/dashboard", dashboardRoutes);
