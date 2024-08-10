import React, { useEffect } from "react";
import { ChatState } from "../Context/ChatProvider";
import { Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getSender } from "../config/ChatLogics";
import GroupChatModal from "./miscellaneous/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
	const { user, selectedChat, setSelectedChat, chats, setChats } =
		ChatState();
	const toast = useToast();

	useEffect(() => {
		const fetchChats = async () => {
			try {
				const config = {
					method: "GET",
					credentials: "include",
				};

				const response = await fetch("/api/chat", config);
				// Return all complete chat documents array which have current logged in user id as an element in the users array of any chat document
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

		fetchChats();
	}, [fetchAgain]);

	if (!chats) {
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
										? getSender(user, chat.users) // Why not use 'user' set in chatProvider instead
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
