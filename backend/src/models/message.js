const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({

    // ─── Participants ─────────────────────────────────────────────────────
    senderId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    receiverId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    // ─── Context ──────────────────────────────────────────────────────────
    itemId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Item",
        required : true
        // Every conversation is anchored to a specific item
        // Query all messages by itemId to get full chat history
        // Chat remains readable even after item is sold or claimed
    },

    // ─── Content ──────────────────────────────────────────────────────────
    content : {
        type : String,
        required : [true , "Message cannot be empty"],
        trim : true,
        maxlength : [1000 , "Message cannot exceed 1000 characters"]
    },

    // ─── State ───────────────────────────────────────────────────────────
    isRead : {
        type : Boolean,
        default : false
        // false — message delivered but not seen
        // true  — receiver has opened the conversation
        // Used for unread message indicators in the UI
    }

}, { timestamps : true }
// createdAt acts as message timestamp
// Used to sort messages chronologically in the chat window
);

const Message = mongoose.model("Message" , messageSchema);

module.exports = Message;