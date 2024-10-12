import React, { useState } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure,
	useToast,
	FormControl,
	Input,
	Box,
} from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";
import UserListItem from "../UserAvatar/UserListItem";
import UserBadgeItem from "../UserAvatar/userBadgeItem";

const GroupChatModal = ({ children }) => {
	const [groupChatName, setGroupChatName] = useState();
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState();

	const toast = useToast();

	const { user, chats, setChats, selectedChat } = ChatState();

	const { isOpen, onOpen, onClose } = useDisclosure();

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

			const data = await response.json(); // Returns all complete user documents as array resulting from the search state string, excluding current user

			setLoading(false);
			setSearchResults(data);
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

	const handleSubmit = async () => {
		if (!groupChatName || selectedUsers.length === 0) {
			toast({
				title: "Please fill all the fields",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
			return;
		}

		const config = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: groupChatName,
				users: JSON.stringify(selectedUsers.map((u) => u._id)),
			}),
			credentials: "include",
		};

		try {
			const response = await fetch("/api/chat/group", config);

			if (!response.ok) {
				if (response.status === 422)
					throw new Error(
						`Less than two users are not allowed to form a groupchat`
					);
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setChats([data, ...chats]); // Add the newly created GroupChat to the chats array in the Provider, at the top
			onClose();
			toast({
				title: "Group Chat Created!",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		} catch (error) {
			console.log(error);
			toast({
				title: "Failed to create group chat",
				description: error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		}
	};

	const handleGroup = (userToAdd) => {
		if (selectedChat) {
			if (selectedChat?.groupAdmin._id !== user._id) {
				toast({
					title: "Only admins can add new users",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "bottom",
				});
				return;
			}
		}

		if (selectedUsers.includes(userToAdd)) {
			toast({
				title: "User already added",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
			return;
		}

		setSelectedUsers([...selectedUsers, userToAdd]);
	};

	const handleDelete = (delUser) => {
		setSelectedUsers(
			selectedUsers.filter((sel) => sel._id !== delUser._id)
		);
	};

	return (
		<>
			<span onClick={onOpen}>{children}</span>
			<Modal size={"lg"} isCentered isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent h={"410px"}>
					<ModalHeader
						fontSize={"35px"}
						fontFamily={"Work sans"}
						display={"flex"}
						justifyContent={"center"}
					>
						Create Group Chat
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody
						display={"flex"}
						flexDir={"column"}
						alignItems={"center"}
						justifyContent={"between"}
					>
						<FormControl>
							<Input
								placeholder="Chat Name"
								mb={3}
								onChange={(e) =>
									setGroupChatName(e.target.value)
								}
							/>
						</FormControl>
						<FormControl>
							<Input
								placeholder="Add users eg: John, Joe"
								mb={1}
								onChange={(e) => handleSearch(e.target.value)}
							/>
						</FormControl>
						<Box w={"100%"} display={"flex"} flexWrap={"wrap"}>
							{selectedUsers?.map((u) => (
								<UserBadgeItem
									key={u._id}
									user={u}
									handleFunction={() => handleDelete(u)}
								/>
							))}
						</Box>
						{loading ? (
							<div>Loading...</div>
						) : (
							searchResults
								?.slice(0, 4)
								.map((user) => (
									<UserListItem
										key={user._id}
										user={user}
										handleFunction={() => handleGroup(user)}
									/>
								))
						)}
					</ModalBody>

					<ModalFooter>
						<Button colorScheme="blue" onClick={handleSubmit}>
							Create Chat
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default GroupChatModal;
