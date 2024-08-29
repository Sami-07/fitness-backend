import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dashboardRoutes from "./routes/dashboard.js";

import User from "./models/User.js";
import cookieParser from 'cookie-parser'
// import { validate } from './middleware/auth.js';
import { registerFunction } from './controllers/dashboardControllers.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
// import { clerkClient } from '@clerk/clerk-sdk-node'
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import { createClerkClient } from '@clerk/clerk-sdk-node';
const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
})



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

app.post("/save-user", async (req, res) => {
    try {
        const { id, email, name } = req.body;
        const user = await User.findOne({

            _id: id
        });
        if (!user) {
            const newUser = new User({
                _id: id,
                email,
                name
            });
            await newUser.save();
        req.user = {
            id: id,
            email: email,
            name: name
        }

            res.json({ message: "User saved successfully" });
        } else {
            console.log("User already exists")
            res.json({ message: "User already exists" });
        }
    } catch (error) {
        console.log("user  saving error", error)
        res.status(500).json({ message: "Error while saving user" })
    }

})

app.post("/logout", (req, res) => {
    try {
        res.clearCookie("token");

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error while logging out" })
    }
})
// app.use(validate);
app.get("/current-user", async (req, res) => {
    try {
        if (!req.cookies.__session) {
            console.log("no token")
            return res.status(401).json({ status: false, message: "Unauthenticated! 1" })
        }
        const response = await clerkClient.verifyToken(req.cookies.__session)
        const user = await User.findOne({
            _id: response.sub
        });
        if (!user) {
            return res.status(401).json({ status: false, message: "Unauthenticated! 2" })
        }
        console.log("valid token", {
            id: user._id, name: user.name, email: user.email
        })
        res.json({ status: true, user: { id: user._id, name: user.name, email: user.email } })
    }
    catch (error) {
        console.log("invalid token", error)
        return res.status(401).json({ status: false, message: error.message })
    }

})
async function validate(req, res, next) {
    if (!req.cookies.__session) {
        return res.status(401).json({ message: "Unauthenticated!" })
    }

    const response = await clerkClient.verifyToken(req.cookies.__session)
    if (!response) {
        console.log("invalid token", response)
        return res.status(401).json({ message: "Unauthenticated!" })

    }

    console.log("valid token in middleware", response)
 
  
    req.user = {
        id: response.sub,
    }
    console.log("user in req.user", req.user)
    next();
}
app.get(
    '/protected-endpoint',


    validate,
)

app.use((err, req, res, next) => {
    console.log(req.cookies)
    res.status(401).json({ message: "Unauthenticated!" })
})
//here, all the routes inside dashboardRoutes starts from "https://fitness-webapp-backend.vercel.app/dashboard"
app.use("/dashboard", validate, dashboardRoutes);
