const express = require("express");

// controller functions
const {
    createChat,
    fetchChats,
    fetchMessages,
    sendMessage,
    updateChatSeen,
} = require("../controllers/chatController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

// create chat route
router.post("/", createChat);

// get chats
router.get("/", fetchChats);

// post a message to chat
router.post("/messages/", sendMessage);

// get all messages from chat
router.get("/messages/:chatID", fetchMessages);

router.post("/updateChatSeen/:chatID", updateChatSeen);

module.exports = router;
