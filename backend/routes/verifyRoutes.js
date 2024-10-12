const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
	try {
		const token = req.cookies.tokenIdLogin;
		if (!token) {
			return res.status(401).json({ error: "No token provided" });
		}

		jwt.verify(token, process.env.SECRET, async (err, decoded) => {
			if (err) {
				console.error("Token verification failed:", err);
				return res.status(401).json({ error: "Invalid token" });
			}

			const user = await User.findById(decoded.id).select("-password");
			if (!user) {
				console.error("User not found for id: ", decoded.id);
				return res.status(404).json({ error: "User not found" });
			}

			// Token is valid, return the complete user information
			res.json({ user });
		});
	} catch (error) {
		console.error("Server error:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

module.exports = router;
