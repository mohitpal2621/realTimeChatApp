const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = asyncHandler(async (req, res) => {
	const { userId } = req.body;

	if (!userId) {
		console.log("UserId param not sent with request");
		return res.sendStatus(400);
	}

	let isChat = await Chat.find({
		isGroupChat: false,
		$and: [
			{ users: { $elemMatch: { $eq: req.user._id } } },
			{ users: { $elemMatch: { $eq: userId } } },
		],
	})
		.populate("users", "-password")
		.populate("latestMessage");

	isChat = await User.populate(isChat, {
		path: "latestMessage.sender",
		select: "name picture email",
	});

	if (isChat.length > 0) {
		// Send back complete one-on-one chat document if already existing
		res.send(isChat[0]);
	} else {
		var chatData = {
			chatName: "sender",
			isGroupChat: false,
			users: [req.user._id, userId],
		};

		try {
			const createdChat = await Chat.create(chatData);

			const FullChat = await Chat.findOne({
				_id: createdChat._id,
			}).populate("users", "-password");

			// if there was no exisiting one-on-one chat, then create a new one, and send a complete chat document for it
			res.status(200).send(FullChat);
		} catch (error) {
			res.status(400);
			throw new Error(error.message);
		}
	}
});

const fetchChats = asyncHandler(async (req, res) => {
	try {
		await Chat.find({
			users: { $elemMatch: { $eq: req.user._id } },
		})
			.populate("users", "-password")
			.populate("groupAdmin", "-password")
			.populate("latestMessage")
			.sort({ updatedAt: -1 })
			.then(async (results) => {
				results = await User.populate(results, {
					path: "latestMessage.sender",
					select: "name picture email",
				});

				// Find all chat documents whose users array contains a user with id equal to current logged in userId.
				// Populate that found Chat/Chats, and return all these chats as they are the chats which the current logged in user
				// is a part of, whether one-on-one or groupChats.
				res.status(200).send(results);
			});
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
});

const createGroupChat = asyncHandler(async (req, res) => {
	if (!req.body.users || !req.body.name) {
		return res.status(400).send({ message: "Please fill all the fields" });
	}

	// This array would contain elements, of users' IDs, that are invited to the group to join
	let users;

	try {
		users = JSON.parse(req.body.users);
		console.log("asfsdf");
	} catch (error) {
		return res.status(400).send({ message: "Invalid users format" });
	}

	if (users.length < 2) {
		console.log("1111111111");
		return res
			.status(422)
			.send("More than two users are required to form a group chat. ");
	}

	users.push(req.user); // Push the currently loggedIn user(complete document) to the users array

	try {
		const groupChat = await Chat.create({
			chatName: req.body.name,
			users: users,
			isGroupChat: true,
			groupAdmin: req.user, // Create currently loggedIn user as groupAdmin, as only he/she can create groupChat(Though req.user is complete document but still
			// mongoDb will store only its _id, as the type of groupAdmin field is ObjectId, and it is a ref to User doc)
		});
		console.log("object");

		const fullGroupChat = await Chat.findOne({
			_id: groupChat._id,
		})
			.populate("users", "-password")
			.populate("groupAdmin", "-password");
		console.log("0fy");
		// Return the created new Group Chat populated completely with the associated users full documents in the users array of it, and also populating the
		// groupAdmin field completely
		res.status(200).json(fullGroupChat);
	} catch (error) {
		console.error("Error creating group chat: ", error);
		res.status(500).send({ message: "Server Error" });
	}
});

const renameGroup = asyncHandler(async (req, res) => {
	const { chatId, chatName } = req.body;

	const updatedChat = await Chat.findByIdAndUpdate(
		chatId,
		{
			chatName,
		},
		{
			new: true,
		}
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");

	if (!updatedChat) {
		res.status(404);
		throw new Error("Chat not found");
	} else {
		// Return updated complete chat document with new name, user docs in users array and groupAdmin doc
		res.json(updatedChat);
	}
});

const addToGroup = asyncHandler(async (req, res) => {
	const { chatId, userId } = req.body;

	const added = await Chat.findByIdAndUpdate(
		chatId,
		{
			$push: { users: userId },
		},
		{
			new: true,
		}
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	if (!added) {
		res.status(404);
		throw new Error("Chat not found");
	} else {
		// Return updated complete chat document with new user added, user docs in users array and groupAdmin doc
		res.json(added);
	}
});

const removeFromGroup = asyncHandler(async (req, res) => {
	const { chatId, userId } = req.body;

	const chat = await Chat.findById(chatId);

	if (!chat) {
		res.status(404);
		throw new Error("Chat not found");
	}

	// Check if user being removed or leaving is same as groupAdmin of the groupChat
	const isGroupAdmin = chat.groupAdmin.toString() === userId;

	// Remove the user
	chat.users = chat.users.filter((user) => user._id.toString() !== userId);

	// If user leaving or being removed is the groupAdmin of the groupChat, make a new groupAdmin for the groupChat
	if (isGroupAdmin) {
		if (chat.users.length > 0) {
			chat.groupAdmin = chat.users[0]._id; // Assign the next oldest user as the new group admin
		} else {
			chat.groupAdmin = null; // Handle the case where the group becomes empty
		}
	}

	await chat.save();

	const updatedChat = await Chat.findById(chatId)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");

	// Return the complete updated group chat after removal of the user/groupAdmin from that groupChat
	res.json(updatedChat);

	// const removed = await Chat.findByIdAndUpdate(
	// 	chatId,
	// 	{
	// 		$pull: { users: userId },
	// 	},
	// 	{
	// 		new: true,
	// 	}
	// )
	// 	.populate("users", "-password")
	// 	.populate("groupAdmin", "-password");
	// if (!removed) {
	// 	res.status(404);
	// 	throw new Error("Chat not found");
	// } else {
	// 	res.json(removed);
	// }
});

module.exports = {
	accessChat,
	fetchChats,
	createGroupChat,
	renameGroup,
	addToGroup,
	removeFromGroup,
};
