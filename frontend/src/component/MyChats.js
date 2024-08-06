import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getSender } from "../config/ChatLogics";
import GroupChatModal from "./miscellaneous/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
	const [loggedUser, setLoggedUser] = useState();
	const { selectedChat, setSelectedChat, chats, setChats } = ChatState();
	const toast = useToast();

	const fetchChats = async (req, res) => {
		try {
			const config = {
				method: "GET",
				credentials: "include",
			};

			const response = await fetch("/api/chat", config);
			const data = await response.json();
			setChats(data);
		} catch (error) {
			toast({
				title: "Error occured!",
				description: "Failed to load chats",
				status: "error",
				isClosable: true,
				duration: 5000,
			});
		}
	};

	useEffect(() => {
		const getToken = async () => {
			try {
				const response = await fetch("/api/verify-token", {
					method: "GET",
					credentials: "include",
				});

				if (response.ok) {
					const data = await response.json();
					setLoggedUser(data.user); // ???? Why not use the one from ChatProvider
					await fetchChats();
				} else {
					throw new Error("Token Verification Failed");
					// navigate("/");
				}
			} catch (error) {
				console.log(error.message);
			}
		};

		getToken();
	}, [fetchAgain]);

	if (!loggedUser || !chats) {
		return <ChatLoading />;
	}

	return (
		<Box
			display={{ base: selectedChat ? "None" : "flex", md: "flex" }}
			flexDir={"column"}
			alignItems={"center"}
			p={3}
			bg={"white"}
			w={{ base: "100%", md: "31%" }}
			borderRadius={"lg"}
			borderWidth={"1px"}
		>
			<Box
				pb={3}
				px={3}
				fontSize={{ base: "28px", md: "30px" }}
				fontFamily={"Work sans"}
				display={"flex"}
				w={"100%"}
				justifyContent={"space-between"}
				alignItems={"center"}
			>
				My chats
				<GroupChatModal>
					<Button
						display={"flex"}
						fontSize={{ base: "17px", md: "10px", lg: "17px" }}
						rightIcon={<AddIcon />}
					>
						New Group Chat
					</Button>
				</GroupChatModal>
			</Box>

			<Box
				display={"flex"}
				flexDir={"column"}
				p={3}
				bg={"#F8F8F8"}
				w={"100%"}
				h={"100%"}
				borderRadius={"lg"}
				overflowY={"hidden"}
			>
				{chats ? (
					<Stack overflowY={"scroll"}>
						{chats.map((chat) => (
							<Box
								onClick={() => setSelectedChat(chat)}
								cursor={"pointer"}
								bg={
									selectedChat === chat
										? "#38B2AC"
										: "#E8E8E8"
								}
								color={
									selectedChat === chat ? "white" : "black"
								}
								px={3}
								py={2}
								borderRadius={"lg"}
								key={chat._id}
							>
								<Text>
									{!chat.isGroupChat
										? getSender(loggedUser, chat.users) // Why not use 'user' set in chatProvider instead
										: chat.chatName}
								</Text>
							</Box>
						))}
					</Stack>
				) : (
					<ChatLoading />
				)}
			</Box>
		</Box>
	);
};

export default MyChats;
