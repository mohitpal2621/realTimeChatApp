const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
	accessChat,
	fetchChats,
	createGroupChat,
	renameGroup,
	addToGroup,
	removeFromGroup,
} = require("../controllers/chatControllers");

const router = express.Router();

// /api/chat/
router.route("/").post(protect, accessChat);

// /api/chat
router.route("/").get(protect, fetchChats);

// /api/chat/group
router.route("/group").post(protect, createGroupChat);

// /api/chat/rename
router.route("/rename").put(protect, renameGroup);

// /api/chat/groupAdd
router.route("/groupAdd").put(protect, addToGroup);

// /api/chat/groupRemove
router.route("/groupRemove").put(protect, removeFromGroup);

module.exports = router;
