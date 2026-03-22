const express = require("express");
const router = express.Router();
const {fetchDonation , claimDonation} = require("../controllers/donation.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/" , protect ,fetchDonation);

router.post("/:id/claim", protect , claimDonation);

module.exports = router;
