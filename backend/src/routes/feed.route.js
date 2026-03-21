const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { getFeed , getExplore ,recordClick } = require("../controllers/feed.controller");

/**
 * - Get Personalized Feed Route
 * - GET /api/feed 
 */
router.get("/feed" , protect ,getFeed);

/**
 * - Get Explore page Route
 * - Get /api/explore
 */
router.get("/explore" , protect , getExplore)

/**
 * - Click Handler route
 * - POST /api/item/:id/click
 */
router.post("/item/:id/click", protect , recordClick);



module.exports = router;