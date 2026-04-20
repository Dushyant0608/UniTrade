const Message = require("../models/message");
const Item = require("../models/item");
const User = require("../models/usermodel");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, itemId, content } = req.body;

    if(!receiverId || !itemId || !content){
        throw new AppError('Receiver, Item and Content are required', 400);
    }

    const message = await Message.create({
        senderId: req.user._id,
        receiverId,
        itemId,
        content
    });

    res.status(201).json({
        success : true,
        message
    });

});

const getMessages = asyncHandler(async(req,res)=>{
    const { itemId, userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
        itemId,
        $or: [
            { senderId: currentUserId, receiverId: userId},
            { senderId: userId, receiverId: currentUserId}
        ]
    }).sort({createdAt: 1});

    await Message.updateMany(
        {
            itemId,
            senderId: userId,
            receiverId: currentUserId,
            isRead: false
        },
        { isRead: true}
    );

    res.status(200).json({
        success: true,
        messages
    });
});

const getConversations = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;
    // Get the latest message for each unique conversation
    const conversations = await Message.aggregate([
        {
            $match: {
                $or: [
                    { senderId: currentUserId },
                    { receiverId: currentUserId }
                ]
            }
        },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: {
                    itemId: "$itemId",
                    otherUser: {
                        $cond: [
                            { $eq: ["$senderId", currentUserId] },
                            "$receiverId",
                            "$senderId"
                        ]
                    }
                },
                lastMessage: { $first: "$content" },
                lastMessageAt: { $first: "$createdAt" },
                unreadCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$receiverId", currentUserId] },
                                    { $eq: ["$isRead", false] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        { $sort: { lastMessageAt: -1 } }
    ]);
    // Populate item and user details
    const populated = await Promise.all(
        conversations.map(async (conv) => {
            const item = await Item.findById(conv._id.itemId).select("title images status");
            const otherUser = await User.findById(conv._id.otherUser).select("name email");
            return {
                itemId: conv._id.itemId,
                otherUser,
                item,
                lastMessage: conv.lastMessage,
                lastMessageAt: conv.lastMessageAt,
                unreadCount: conv.unreadCount
            };
        })
    );
    res.status(200).json({
        success: true,
        conversations: populated
    });
});


module.exports = { sendMessage, getMessages, getConversations };
