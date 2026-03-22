const express = require("express");
const app = express();
const cookie = require("cookie-parser");

const AppError =  require("./src/utils/appError");

const authRoutes = require("./src/routes/auth.route");
const itemRoutes = require("./src/routes/item.route");
const feedRoutes = require("./src/routes/feed.route");
const donationRoute = require("./src/routes/donation.route");

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookie());

//Global Error Handler
app.use((err, req , res , next)=>{
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : "Something went wrong";

    res.status(statusCode).json({
        success : false,
        message
    });
});


app.get("/health" , (req,res)=>{
    res.send("server is running");
});


app.use("/api/auth" , authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api", feedRoutes);
app.use("/api/donations" , donationRoute);

module.exports = app; 