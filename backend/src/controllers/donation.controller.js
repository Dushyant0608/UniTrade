const Item = require("../models/item");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const fetchDonation = asyncHandler(async(req,res)=>{
    // Pagination — same pattern as explore
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    // Fetch only donated (unclaimed) items
    // Exclude current user's own donations
    const items = await Item.find({
        status   : "donated",
        sellerId : { $ne : req.user._id }
    })
    .sort({ listedAt : -1 })
    .skip(skip)
    .limit(limit)
    .populate("sellerId", "name email");

    const total = await Item.countDocuments({
        status   : "donated",
        sellerId : { $ne : req.user._id }
    });

    res.status(200).json({
        success    : true,
        page,
        totalPages : Math.ceil(total / limit),
        count      : items.length,
        items
    });
});


const claimDonation = asyncHandler(async(req,res)=>{
    // Step 1 — Find the item
    const item = await Item.findById(req.params.id);
    if (!item) {
        throw new AppError("Item not found", 404);
    }

    // Step 2 — Check it is actually a donation
    if (item.status !== "donated") {
        throw new AppError("This item is not available for donation", 400);
    }

    // Step 3 — Prevent claiming own donation
    if (item.sellerId.toString() === req.user._id.toString()) {
        throw new AppError("You cannot claim your own donation", 400);
    }

    // Step 4 — Claim it
    // status: claimed — removes from donation feed
    // claimedBy — records who took it
    const claimedItem = await Item.findByIdAndUpdate(
        req.params.id,
        {
            status    : "claimed",
            claimedBy : req.user._id
        },
        { new : true }
    );

    res.status(200).json({
        success : true,
        message : "Item claimed successfully",
        item    : claimedItem
    });
});


module.exports = {fetchDonation , claimDonation};