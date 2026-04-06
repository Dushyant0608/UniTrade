const express = require("express");
const router = express.Router();
const {protect} = require("../middleware/auth.middleware")
const {suggestTags} = require("../controllers/tag.controller");


router.post("/suggest", protect , suggestTags);

module.exports = router;