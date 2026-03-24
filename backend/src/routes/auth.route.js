const express = require("express");
const router = express.Router();

const {signup, verifyEmail, login, logout} = require("../controllers/auth.controller");

router.post("/signup" , signup);
router.get("/verify/:token" , verifyEmail);
router.post("/login" , login);
router.post("/logout", logout)

module.exports = router;
