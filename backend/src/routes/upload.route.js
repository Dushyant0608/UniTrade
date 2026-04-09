const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { upload, uploadToCloudinary } = require("../middleware/upload.middleware");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

router.post("/", protect, upload.single("image"), asyncHandler(async (req, res) => {
        if (!req.file) {
            throw new AppError("No image provided", 400);
        }
        const url = await uploadToCloudinary(req.file.buffer);
        res.status(200).json({ success: true, url });
    })
);

module.exports = router;