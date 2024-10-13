const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
	sendMessage,
	getUnread,
	allMessages,
	markMessageAsRead,
} = require("../controllers/messageControllers");

const router = express.Router();

router.route("/").post(protect, sendMessage);

router.route("/:chatId").get(protect, allMessages);

router.route("/unread").get(protect, getUnread);

router.route("/:messageId/read").put(protect, markMessageAsRead);

module.exports = router;
