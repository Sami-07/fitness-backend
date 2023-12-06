import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dashboardRoutes from "./routes/dashboard.js";
import 'dotenv/config'
const app = express();
app.use(bodyParser.json({ limit: "30mb", extended: true }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))

app.use(cors());
app.use("/dashboard", dashboardRoutes);
//here, all the routes inside dashboardRoutes starts from "https://localhost:300/dashboard"
const CONNECTION_URL = ""

mongoose.connect(process.env.MONGODB_URI)
    .then(() => app.listen(5000, () => console.log("Server is running on port 5000")))
    .catch(err => console.log(err.message));