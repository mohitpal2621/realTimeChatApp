const express = require("express");
const {
	registerUser,
	authUser,
	allUsers,
	logOutUser,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// /api/user/
router.route("/").post(registerUser).get(protect, allUsers);

// /api/user/login
router.post("/login", authUser);

// /api/user/logout
router.post("/logout", protect, logOutUser);

module.exports = router;
