const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password, picture } = req.body;

	if (!name || !email || !password) {
		res.status(400);
		throw new Error("Please enter all the fields");
	}

	const userExists = await User.findOne({ email });

	if (userExists) {
		res.status(400);
		throw new Error("User already exists");
	}

	const user = await User.create({ name, email, password, picture });

	if (user) {
		const token = generateToken(user._id);

		res.cookie("tokenId", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 30 * 24 * 60 * 60 * 1000,
			sameSite: "Lax",
		});

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

		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			picture: user.picture,
		});
		console.log("DONE you are Logged IN");
	} else {
		throw new Error("Invalid email or password");
	}
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

	const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
	res.send(users);
});

module.exports = { registerUser, authUser, allUsers };
