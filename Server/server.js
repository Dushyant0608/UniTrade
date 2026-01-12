const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

const MONGO_URI = "mongodb+srv://Sanji:MrPrince@cluster0.vm8wqdi.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB connected succesfully"))
    .catch((err) => console.log("Connection",err));

    app.get('/' , (req,res) => {
        res.send("UniTrade API is running.....")
    });

    app.listen(PORT , () => {
        console.log(`Server is running on ${PORT}`)
    });
