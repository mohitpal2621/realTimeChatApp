import { ViewIcon } from "@chakra-ui/icons";
import {
	Box,
	Button,
	FormControl,
	IconButton,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Spinner,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/userBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain }) => {
	const [groupChatName, setGroupChatName] = useState("");
	const [searchResult, setSearchResult] = useState([]);
	const [loading, setLoading] = useState(false);
	const [renameLoading, setRenameLoading] = useState(false);

	const toast = useToast();

	const { user, selectedChat, setSelectedChat } = ChatState();

	const { isOpen, onOpen, onClose } = useDisclosure();

	const handleRename = async () => {
		if (!groupChatName) {
			return;
		}

		try {
			setRenameLoading(true);

			const config = {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					credentials: "include",
				},
				body: JSON.stringify({
					chatId: selectedChat._id,
					chatName: groupChatName,
				}),
			};

			const response = await fetch("/api/chat/rename", config);
			const data = await response.json();

			setSelectedChat(data);
			setFetchAgain(!fetchAgain);
			setRenameLoading(false);
		} catch (error) {
			toast({
				title: "Error in renaming",
				description: error.response.data.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setRenameLoading(false);
		}

		setGroupChatName("");
	};

	const handleSearch = async (query) => {
		if (!query) {
			return;
		}

		try {
			setLoading(true);
			const response = await fetch(`/api/user?search=${query}`, {
				method: "GET",
				credentials: "include",
			});

			const data = await response.json();

			setLoading(false);
			setSearchResult(data);
		} catch (error) {
			toast({
				title: "Error occurred",
				description: "Failed to load the search results",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom left",
			});
		}
	};

	const handleAddUser = async (user1) => {
		if (selectedChat.groupAdmin._id !== user._id) {
			toast({
				title: "Only admins can add new users",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}

		if (selectedChat.users.find((u) => u._id === user1._id)) {
			toast({
				title: "User already in group",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}

		try {
			setLoading(true);

			const config = {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					chatId: selectedChat._id,
					userId: user1._id,
				}),
			};

			const response = await fetch("/api/chat/groupAdd", config);
			const data = await response.json();

			setSelectedChat(data);
			setFetchAgain(!fetchAgain);
			setLoading(false);
		} catch (error) {
			toast({
				title: "Error adding user to group",
				description: error.response.data.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
		}
	};

	const handleRemove = async (userToRemove) => {
		if (selectedChat.groupAdmin._id !== user._id) {
			toast({
				title: "You do not have permission to remove users",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}

		if (!selectedChat.users.find((u) => u._id === userToRemove._id)) {
			toast({
				title: "User not found in group",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}

		try {
			setLoading(true);

			const config = {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					chatId: selectedChat._id,
					userId: userToRemove._id,
				}),
				credentials: "include",
			};

			const response = await fetch("/api/chat/groupRemove", config);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			userToRemove._id === user._id
				? setSelectedChat()
				: setSelectedChat(data);

			setFetchAgain(!fetchAgain); // Make the MyChats be reloaded, so the changes are reflected on the MyChats
			setLoading(false);
		} catch (error) {
			toast({
				title: "Error removing user from group",
				description: error.response.data.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
		}
	};

	const handleLeave = async () => {
		setLoading(true);

		if (!selectedChat.users.find((u) => u._id === user._id)) {
			toast({
				title: "You are not part of this group",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}

		const config = {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				chatId: selectedChat._id,
				userId: user._id,
			}),
			credentials: "include",
		};

		try {
			const response = await fetch("/api/chat/groupRemove", config);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			await response.json();

			setSelectedChat();
			setFetchAgain(!fetchAgain);
			setLoading(false);
		} catch (error) {}
	};

	return (
		<>
			<IconButton
				display={{ base: "flex" }}
				icon={<ViewIcon />}
				onClick={onOpen}
			/>

			<Modal isOpen={isOpen} onClose={onClose} isCentered>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader
						fontSize={"35px"}
						fontFamily={"Work sans"}
						display={"flex"}
						justifyContent={"center"}
					>
						{selectedChat.chatName}
					</ModalHeader>

					<ModalCloseButton />

					<ModalBody>
						<Box
							w={"100%"}
							display={"flex"}
							flexWrap={"wrap"}
							pb={3}
						>
							{selectedChat.users.map((u) => (
								<UserBadgeItem
									key={u._id}
									user={u}
									handleFunction={() => handleRemove(u)}
								/>
							))}
						</Box>
						<FormControl>
							<Input
								placeholder="Chat name"
								mb={3}
								value={groupChatName}
								onChange={(e) =>
									setGroupChatName(e.target.value)
								}
							/>
							<Button
								variant={"solid"}
								colorScheme="teal"
								ml={1}
								mb={3}
								isLoading={renameLoading}
								onClick={handleRename}
							>
								Update
							</Button>
						</FormControl>
						<FormControl>
							<Input
								placeholder={"Add user to group"}
								mb={1}
								onChange={(e) => handleSearch(e.target.value)}
							/>
						</FormControl>
						{loading ? (
							<Spinner size={"lg"} />
						) : (
							searchResult?.map((user) => (
								<UserListItem
									key={user._id}
									user={user}
									handleFunction={() => handleAddUser(user)}
								/>
							))
						)}
					</ModalBody>

					<ModalFooter>
						<Button
							onClick={() => handleLeave(user)}
							colorScheme="red"
						>
							Leave Group
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default UpdateGroupChatModal;
