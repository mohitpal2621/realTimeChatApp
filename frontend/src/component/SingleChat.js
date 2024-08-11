import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import animationData from "../animations/Animation - 1723339359964.json";
import {
	Box,
	FormControl,
	IconButton,
	Input,
	Spinner,
	Text,
	useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import Lottie from "react-lottie";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";

import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";

let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState();
	const [loading, setLoading] = useState(false);
	const [typing, setTyping] = useState(false);
	const [isTyping, setIsTyping] = useState(false);
	const [socketConnected, setSocketConnected] = useState(false);

	const defaultOptions = {
		loop: true,
		autoplay: true,
		animationData: animationData,
		renderedSettings: {
			preserveAspectRatio: "xMidYMid slice",
		},
	};

	const { user, selectedChat, setSelectedChat } = ChatState();

	const toast = useToast();

	const fetchMessages = async () => {
		if (!selectedChat) return;

		try {
			const config = {
				method: "GET",
				credentials: "include",
			};

			setLoading(true);

			const response = await fetch(
				`/api/message/${selectedChat._id}`,
				config
			);

			const data = await response.json();
			// console.log(data);

			setMessages(data);
			setLoading(false);
			socket.emit("join chat", selectedChat._id);
		} catch (error) {
			toast({
				title: "Error occured",
				description: "Failed to fetch and load all messages",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		}
	};

	useEffect(() => {
		socket = io(ENDPOINT);
		socket.emit("setup", user);
		socket.on("connected", () => setSocketConnected(true));
		socket.on("typing", () => setIsTyping(true));
		socket.on("stop typing", () => setIsTyping(false));
	}, []);

	useEffect(() => {
		fetchMessages();
		selectedChatCompare = selectedChat;
	}, [selectedChat]);

	useEffect(() => {
		socket.on("message received", (newMessageReceived) => {
			if (
				!selectedChatCompare ||
				selectedChatCompare._id !== newMessageReceived.chat._id
			) {
				// Give notification
			} else {
				setMessages([...messages, newMessageReceived]);
			}
		});
	});

	const sendMessage = async (event) => {
		if (event.key === "Enter" && newMessage) {
			socket.emit("stop typing", selectedChat._id);
			try {
				const config = {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						content: newMessage,
						chatId: selectedChat._id,
					}),
					credentials: "include",
				};

				setNewMessage("");

				const response = await fetch("/api/message", config);

				const data = await response.json();

				socket.emit("new message", data);

				setMessages([...messages, data]);
			} catch (error) {
				toast({
					title: "Error sending message",
					description: "Error was not sent to the receipient",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "bottom",
				});
			}
		}
	};

	const typingHandler = (e) => {
		setNewMessage(e.target.value);

		if (!socketConnected) return;

		if (!typing) {
			setTyping(true);
			socket.emit("typing", selectedChat._id);
		}

		//Debouncing type function
		let lastTypingTime = new Date().getTime();

		let timerLength = 3000;

		setTimeout(() => {
			let timeNow = new Date().getTime();
			let timeDiff = timeNow - lastTypingTime;

			if (timeDiff >= timerLength && typing) {
				socket.emit("stop typing", selectedChat._id);
				setTyping(false);
			}
		}, timerLength);
	};

	return (
		<>
			{selectedChat ? (
				<>
					<Text
						fontSize={{ base: "28px", md: "30px" }}
						pb={3}
						px={2}
						w={"100%"}
						fontFamily={"Work sans"}
						display={"flex"}
						justifyContent={{ base: "space-between" }}
						alignItems={"center"}
					>
						<IconButton
							display={{ base: "flex", md: "none" }}
							icon={<ArrowBackIcon />}
							onClick={() => setSelectedChat("")}
						></IconButton>
						{!selectedChat.isGroupChat ? (
							<>
								{getSender(user, selectedChat.users)}
								<ProfileModal
									user={getSenderFull(
										user,
										selectedChat.users
									)}
								/>
							</>
						) : (
							<>
								{selectedChat.chatName.toUpperCase()}
								<UpdateGroupChatModal
									fetchAgain={fetchAgain}
									setFetchAgain={setFetchAgain}
									fetchMessages={fetchMessages}
								/>
							</>
						)}
					</Text>
					<Box
						display={"flex"}
						flexDir={"column"}
						justifyContent={"flex-end"}
						p={3}
						bg={"#E8E8E8"}
						w={"100%"}
						h={"100%"}
						borderRadius={"lg"}
						overflowY={"hidden"}
					>
						{loading ? (
							<Spinner
								size={"xl"}
								w={20}
								h={20}
								alignSelf={"center"}
								margin={"auto"}
							/>
						) : (
							<div className="messages">
								<ScrollableChat messages={messages} />
							</div>
						)}
						<FormControl onKeyDown={sendMessage} isRequired mt={3}>
							{isTyping ? (
								<div>
									<Lottie
										options={defaultOptions}
										width={70}
										style={{
											marginBottom: 15,
											marginLeft: 0,
										}}
									/>
								</div>
							) : (
								<></>
							)}
							<Input
								variant={"filled"}
								bg={"#E0E0E0"}
								placeholder="Enter a message"
								onChange={typingHandler}
								value={newMessage}
							/>
						</FormControl>
					</Box>
				</>
			) : (
				<Box
					display={"flex"}
					alignItems={"center"}
					justifyContent={"center"}
					h={"100%"}
				>
					<Text fontSize={"3xl"} pb={3} fontFamily={"Work sans"}>
						Click on a user to start chatting
					</Text>
				</Box>
			)}
		</>
	);
};

export default SingleChat;
