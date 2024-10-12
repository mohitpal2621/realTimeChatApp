const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
	let { name, email, password, picture } = req.body;

	if (!name || !email || !password) {
		res.status(400);
		throw new Error("Please enter all the fields");
	}

	const userExists = await User.findOne({ email });

	if (userExists) {
		res.status(400);
		throw new Error("User already exists");
	}
	if (!picture || picture?.trim() === "") {
		picture = undefined;
	}

	const user = await User.create({ name, email, password, picture });

	if (user) {
		// Returns object containing created user doc with id, name, email and picture (NOT password)
		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			picture: user.picture,
		});
	} else {
		res.status(400);
		throw new Error("Failed to create new user");
	}
});

const authUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (user && (await user.matchPassword(password))) {
		const token = generateToken(user._id);

		res.cookie("tokenIdLogin", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 30 * 24 * 60 * 60 * 1000,
			sameSite: "Lax",
		});

		//Returns an object of the logged in user with complete document excluding the password field
		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			picture: user.picture,
		});
	} else {
		throw new Error("Invalid email or password");
	}
});

const logOutUser = asyncHandler(async (req, res) => {
	res.clearCookie("tokenIdLogin");
	res.status(200).json({ message: "Logout successful" });
});

const allUsers = asyncHandler(async (req, res) => {
	const keyword = req.query.search
		? {
				$or: [
					{ name: { $regex: req.query.search, $options: "i" } },
					{ email: { $regex: req.query.search, $options: "i" } },
				],
		  }
		: {};

	// Sends array of complete user documents filtered with keyword, and excluding password
	// from each document, and also excluding the complete document of the current logged user
	const users = await User.find(keyword)
		.find({ _id: { $ne: req.user._id } })
		.select("-password");
	res.send(users);
});

module.exports = { registerUser, authUser, logOutUser, allUsers };
