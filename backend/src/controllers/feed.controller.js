const User = require("../models/usermodel");
const Item = require("../models/item");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const {
    getPersonalizedFeed,
    recordClick,
    pruneDecayedTags
} = require('../engines/RecommendationEngine');

/**
 * - Get Feed controller
 */
const getFeed = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id);
    if(!user){
        throw new AppError("User not found",404);
    }

    const inventory = await Item.find({});

    const feed = getPersonalizedFeed(user,inventory);

    res.status(200).json({
        success : true,
        count : feed.length,
        feed
    });
});

/**
 * - Get Explore controller
 */
const getExplore = asyncHandler(async(req,res)=>{
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const items = await Item.find({
        status : "active",
        sellerId : { $ne : req.user._id}
    })
    .sort({ listedAt : -1})
    .skip(skip)
    .limit(limit)
    .populate("sellerId" , "name email");

    const total = await Item.countDocuments({
        status : "active",
        sellerId : { $ne : req.user._id}
    })

    res.status(200).json({
        success    : true,
        page,
        totalPages : Math.ceil(total / limit),
        count      : items.length,
        items
    });
})

/**
 * record Click controller
 */
const recordClickHandler = asyncHandler(async(req,res)=>{
    const item = await Item.findById(req.params.id);
    if(!item){
        throw new AppError("Item not found",404);
    }

    if (item.sellerId.toString() === req.user._id.toString()) {
        throw new AppError("Cannot record click on your own item", 400);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const updatedHistory = recordClick(
        user.viewHistoryTags,
        item.tags
    );

    const cleanedHistory = pruneDecayedTags(updatedHistory);

    user.viewHistoryTags = cleanedHistory;
    await user.save();

    res.status(200).json({
        success : true,
        message : "Click recorded"
    });
});

module.exports = { getFeed , getExplore , recordClickHandler }