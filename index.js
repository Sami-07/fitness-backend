import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dashboardRoutes from "./routes/dashboard.js";
import 'dotenv/config'
import User from "./models/User.js";

const app = express();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://fitness-freak-xi.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
    } else {
      next();
    }
  });
// app.use(cors({
//     origin: "https://fitness-freak-xi.vercel.app",
//     methods: ["POST", "GET"],
//     credentials: true
// }));
// app.use(bodyParser.json({ limit: "30mb", extended: true }))
// app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => app.listen(PORT, () => console.log(`Server is running on port ${PORT}`)))
    .catch(err => console.log(err.message));



app.post("/register", async function (req, res) {



    let user = new User({
        name: req.body.userName,
        email: (req.body.email).toLowerCase()
    })

    await user.save();

})
app.post("/registergoogleuser", async function (req, res) {
    const { displayName, email } = req.body;

    let data = await User.findOne({ email: email });
    if (data) {

        res.json({ status: true });
    }
    else {
        let user = new User({
            name: req.body.displayName,
            email: req.body.email
        })
        await user.save();
        res.json({ status: true })
    }

})

//here, all the routes inside dashboardRoutes starts from "https://fitness-webapp-backend.vercel.app/dashboard"
app.use("/dashboard", dashboardRoutes);