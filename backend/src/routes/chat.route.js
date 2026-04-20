const express = require("express");
const router = express.Router();
const {protect} = require('../middleware/auth.middleware');
const {sendMessage, getMessages, getConversations} = require("../controllers/chat.controller");

router.post('send', protect , sendMessage);
router.get('messages/:itemId/:userId', protect, getMessages);
router.get('conversations', protect, getConversations);



module.exports = router;
