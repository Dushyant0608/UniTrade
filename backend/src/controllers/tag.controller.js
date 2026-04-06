const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { generateTags } = require("../engines/autoTagger");

/**
 * Suggest Tags controller
 *
 * Called mid-form by the frontend after image upload to Cloudinary.
 * Returns AI-generated tag suggestions as removable chips.
 */
const suggestTags = asyncHandler(async (req, res) => {
    const { imageUrl, title, description, category } = req.body;

    if (!title || !category) {
        throw new AppError("Title and category are required for tag suggestions", 400);
    }

    const tags = await generateTags(imageUrl || null, title, description || "", category);

    res.status(200).json({
        success: true,
        tags
    });
});

module.exports = { suggestTags };
