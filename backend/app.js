const express = require("express");
const app = express();
const cookie = require("cookie-parser");

const AppError =  require("./src/utils/appError");

const authRoutes = require("./src/routes/auth.route");

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

module.exports = app; 