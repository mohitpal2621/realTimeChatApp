const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage = asyncHandler(async (req, res) => {
	const { content, chatId } = req.body;

	if (!content || !chatId) {
		console.error("Invalid data passed into request");
		return res.sendStatus(400);
	}

	let newMessage = {
		sender: req.user._id,
		content,
		chat: chatId,
	};

	try {
		let message = await Message.create(newMessage);

		message = await message.populate("sender", "name picture");

		message = await message.populate("chat");
		message = await User.populate(message, {
			path: "chat.users",
			select: "name picture email",
		});

		const chat = await Chat.findByIdAndUpdate(req.body.chatId, {
			latestMessage: message,
		});

		res.json(message); // Creates a new Message doc, and sends it back complete
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
});

const allMessages = asyncHandler(async (req, res) => {
	try {
		const messages = await Message.find({
			chat: req.params.chatId,
		})
			.populate("sender", "name picture email")
			.populate("chat");

		res.json(messages); // Sends an array of complete Message docs of  particular chat(by ChatId)
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
});

const getUnread = asyncHandler(async (req, res) => {
	const chats = await Chat.find({ users: { $in: [req.user._id] } });

	// Get the chat IDs
	const chatIds = chats.map((chat) => chat._id);

	// Find all messages in those chats that haven't been read by the user
	const unreadMessages = await Message.find({
		chat: { $in: chatIds },
		readBy: { $ne: req.user._id }, // Find messages where the user hasn't read it
	})
		.populate("sender", "name picture")
		.populate("chat");

	res.json(unreadMessages);
});

const markMessageAsRead = asyncHandler(async (req, res) => {
	const messageId = req.params.messageId;
	const userId = req.user._id;

	const message = await Message.findById(messageId);

	if (!message) {
		res.status(404);
		throw new Error("Message not found");
	}

	if (!message.readBy.includes(userId)) {
		message.readBy.push(userId);
		await message.save(); // Save the updated message
	}

	res.status(200).json({ success: true, message: "Message marked as read" });
});

module.exports = { sendMessage, allMessages, getUnread, markMessageAsRead };
