const express = require("express");
const router = express.Router();

const {signup, verifyEmail, login, logout, getMe} = require("../controllers/auth.controller");
const {protect} = require("../middleware/auth.middleware");

router.post("/signup" , signup);
router.get("/verify/:token" , verifyEmail);
router.post("/login" , login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;
