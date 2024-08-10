const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
	let token;

	// Check for token in headers
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
		console.log("Bearers were checked!");
	}
	// Check for token in cookies
	else if (req.cookies.tokenIdLogin) {
		token = req.cookies.tokenIdLogin;
	}

	if (token) {
		try {
			const decoded = jwt.verify(token, process.env.SECRET);

			// Appends the whole currently logged user to the incoming req as 'user' property(excluding password), and then calls next middleware
			req.user = await User.findById(decoded.id).select("-password");
			next();
		} catch (error) {
			res.status(401);
			throw new Error("Not authorized, token failed");
		}
	} else {
		res.status(401);
		throw new Error("Not authorized, no token");
	}
});

module.exports = { protect };
