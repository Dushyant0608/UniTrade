const Item = require("../models/item");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const {calculateFairPrice} = require("../engines/fairPrice");
/**
 * - Create Item controller
 */
const createItem = asyncHandler(async(req,res)=>{
    const {
        title,
        description,
        images,
        originalPrice,
        purchaseYear,
        category,
        condition,
        tags,
        fairPrice     
    } = req.body;

    if (!title || originalPrice === undefined || originalPrice === null || !purchaseYear || !category || !condition) {
        throw new AppError("Title, originalPrice, purchaseYear, category and condition are required", 400);
    }

    if(originalPrice === 0){
        const donationItem = await Item.create({
            sellerId : req.user._id,
            title,
            description : description || "",
            images : images || [],
            originalPrice : 0,
            purchaseYear,
            category,
            condition,
            tags : tags || [],
            fairPrice : 0,
            status : "donated",
            listedAt : Date.now()
        })

        return res.status(201).json({
                success : true,
                message : "Item listed as donation successfully",
                item : donationItem
            });
    }


    if(fairPrice !== undefined){
        if(fairPrice<0){
            throw new AppError("Fair Price can not be negative",400);
        }

        const item = await Item.create({
            sellerId : req.user._id,
            title,
            description : description || "",
            images : images || [],
            originalPrice ,
            purchaseYear,
            category,
            condition,
            tags : tags || [],
            fairPrice ,
            status : "active",
            listedAt : Date.now()
        })

        return res.status(200).json({
                success : true,
                message : "Item listed successfully",
                item 
            });
    }

    const suggestedPrice = calculateFairPrice({
        originalPrice,
        purchaseYear,
        condition,
        category
    });
    
    res.status(200).json({
        success        : true,
        message        : "Fair price calculated. Please confirm or override.",
        suggestedPrice
    });
});

/**
 * Get item controller
 */
const getItem = asyncHandler(async(req,res)=>{
    const item = await Item.findById(req.params.id);
    if(!item){
        throw new AppError("Item not found", 404);
    }

    if(item.status === "deleted"){
        throw new AppError("Item not found",404);
    }

    res.status(200).json({
        success : true,
        item
    });
});

/**
 * Update Item controller
 */
const updateItem = asyncHandler(async(req,res)=>{
    const item = await Item.findById(req.params.id);

    if(!item){
        throw new AppError("Item not found",404);
    }

    if(item.sellerId.toString() !== req.user._id.toString()){
        throw new AppError("You are not authorized to update this item",403);
    }

    if(item.status !== "active"){
        throw new AppError("Only acitve item can be updated",400);
    }

    const allowedUpdates = {
        title,
        description,
        images,
        condition,
        tags,
        fairPrice
    } = req.body;

    const updatedItem = await Item.findByIdAndUpdate(
        req.params.id,
        allowedUpdates,
        {new : true , runValidators : true}
    );

    res.status(200).json({
        success : true,
        updatedItem
    });

});

/**
 * Delete Item controller
 */
const deleteItem = asyncHandler(async(req,res)=>{
    const item = await Item.findById(req.params.id);

    if(!item){
        throw new AppError("Item not found",404);
    }

    if(item.sellerId.toString() !== req.user._id.toString()){
        throw new AppError("You are not authorized to delete this item",403)
    }

    await Item.findByIdAndUpdate(
        req.params.id,
        {status : "deleted"}
    );

    res.status(200).json({
        sucess : true,
        message : "Item deleted succefully"
    });
});

/**
 * Mark as Read controller
 */
const markAsSold = asyncHandler(async(req,res)=>{
    const item = await Item.findById(req.params.id);

    if(!item){
        throw new AppError("Item not found",404);
    }

    if (item.sellerId.toString() !== req.user._id.toString()) {
        throw new AppError("You are not authorized to perform this action", 403);
    }

    // Only active items can be marked as sold
    if (item.status !== "active") {
        throw new AppError(`Cannot mark item as sold — current status is ${item.status}`, 400);
    }

    await Item.findByIdAndUpdate(
        req.params.id,
        { status : "sold" }
    );

    res.status(200).json({
        success : true,
        message : "Item marked as sold"
    });
});



module.exports = { createItem, getItem, updateItem, deleteItem, markAsSold };