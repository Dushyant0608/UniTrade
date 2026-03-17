const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({

    // ─── Identity & Ownership ────────────────────────────────────────────
    sellerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    title : {
        type : String,
        required : [true , "Title is required"],
        trim : true
    },

    description : {
        type : String,
        trim : true,
        default : ""
    },

    images : {
        type : [String],
        default : []
        // Not required — seller might upload images after initial listing
        // Cloudinary/S3 URLs stored here as strings
    },

    // ─── Valuation Engine Inputs ─────────────────────────────────────────
    originalPrice : {
        type : Number,
        required : [true , "Original price is required"],
        min : [0 , "Price cannot be negative"]
        // min: 0 allows donations (price = 0) while blocking negative values
    },

    purchaseYear : {
        type : Number,
        required : [true , "Purchase year is required"],
        min : [1900 , "Purchase year seems invalid"],
        max : [new Date().getFullYear() , "Purchase year cannot be in the future"]
        // Number not Date — the Valuation Engine uses year arithmetic
        // storing as Date would require .getFullYear() every time
    },

    category : {
        type : String,
        enum : {
            values : ["Books", "Electronics", "Furniture", "Sports", "General"],
            message : "Category must be Books, Electronics, Furniture, Sports, or General"
        },
        required : [true , "Category is required"],
        trim : true
    },

    condition : {
        type : String,
        enum : {
            values : ["New", "Like New", "Good", "Fair", "Poor"],
            message : "Condition must be New, Like New, Good, Fair, or Poor"
        },
        required : [true , "Condition is required"]
    },

    // ─── Valuation Engine Output ──────────────────────────────────────────
    fairPrice : {
        type : Number,
        min : [0 , "Fair price cannot be negative"]
        // Optional — not required at creation
        // Set after Valuation Engine runs and user confirms
    },

    // ─── Discovery Engine ─────────────────────────────────────────────────
    tags : {
        type : [String],
        default : []
        // Used by Weighted Jaccard for feed scoring
        // e.g. ["CSE", "Sem 3", "Books"]
    },

    // ─── Lifecycle ────────────────────────────────────────────────────────
    status : {
        type : String,
        enum : {
            values : ["active", "sold", "deleted", "donated", "claimed"],
            message : "Invalid status value"
        },
        default : "active"
        // active   — visible in feed, available to buy
        // sold     — transaction complete
        // deleted  — soft delete, invisible but preserved
        // donated  — in donation center, free to claim
        // claimed  — donation has been taken
    },

    claimedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        default : null
        // Only populated when status === "claimed"
        // Tracks which student claimed the donated item
    },

    listedAt : {
        type : Date,
        default : Date.now
        // Separate from createdAt — powers fallback feed sorting
        // Discovery Engine sorts fallback items by listedAt descending
    }

}, { timestamps : true }
// timestamps adds createdAt and updatedAt automatically
// createdAt — when document was created
// updatedAt — last modification, useful for debugging
);

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;