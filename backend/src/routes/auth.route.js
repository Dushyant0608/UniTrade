const express = require("express");
const router = express.Router();

const {signup, verifyEmail, login} = require("../controllers/auth.controller");

router.post("/signup" , signup);
router.get("/verify/:token" , verifyEmail);
router.post("/login" , login);

module.exports = router;
