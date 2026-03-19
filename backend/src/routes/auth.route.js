const express = require("express");
const router = express.Router();

router.post("/signup" , signup);
router.get("/verify/:token" , verifyEmail);
router.post("/login" , login);

module.exports = router;
