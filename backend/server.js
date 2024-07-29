const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const chats = require("./data/data");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const verifyRoutes = require("./routes/verifyRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

connectDB();

const app = express();

app.use(express.json());

app.use(cookieParser());

app.get("/", (req, res) => {
	res.send("Api is running");
});

app.use("/api/verify-token", verifyRoutes);

app.use("/api/user", userRoutes);

app.use("/api/chat", chatRoutes);

app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Server started on PORT ${PORT}`);
});
