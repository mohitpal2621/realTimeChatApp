const express = require("express");
const {
	registerUser,
	authUser,
	allUsers,
	logOutUser,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers);

router.post("/login", authUser);

router.post("/logout", protect, logOutUser);

module.exports = router;
