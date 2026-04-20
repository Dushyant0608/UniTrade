const express = require("express");
const router = express.Router();
const {protect} = require('../middleware/auth.middleware');
const {sendMessage, getMessages, getConversations} = require("../controllers/chat.controller");

router.post('/send', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/:itemId/:userId', protect, getMessages);

module.exports = router;
