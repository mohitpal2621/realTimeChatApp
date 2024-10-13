const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const chats = require("./data/data");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const verifyRoutes = require("./routes/verifyRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

connectDB();

const app = express();

app.use(express.json());

app.use(cookieParser());

app.get("/", (req, res) => {
	res.send("Api is running");
});

app.use("/api/user", userRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/message", messageRoutes);

app.use("/api/verify-token", verifyRoutes);

app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
	console.log(`Server started on PORT ${PORT}`);
});

const io = require(`socket.io`)(server, {
	pingTimeout: 60000,
	cors: {
		origin: "http://localhost:3000",
	},
});

io.on("connection", (socket) => {
	console.log(`Connected to socket.io`);

	socket.on("setup", (userData) => {
		socket.join(userData._id);
		socket.emit("connected");
	});

	socket.on(`join chat`, (room) => {
		socket.join(room);
		console.log(`User joined room: ${room}`);
	});

	socket.on("typing", (room) => socket.in(room).emit("typing"));

	socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

	socket.on("new message", (newMessageReceived) => {
		let chat = newMessageReceived.chat;

		if (!chat.users) return console.error(`chat.users not defined`);

		chat.users.forEach((user) => {
			if (user._id === newMessageReceived.sender._id) return;

			socket.in(user._id).emit("message received", newMessageReceived);
		});
	});

	socket.off("setup", () => {
		console.log("User DISCONNECTED");
		socket.leave(userData._id);
	});
});
