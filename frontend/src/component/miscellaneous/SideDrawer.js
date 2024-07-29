import React, { useState } from "react";
import {
	Avatar,
	Box,
	Button,
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	Input,
	Menu,
	MenuButton,
	MenuDivider,
	MenuItem,
	MenuList,
	Spinner,
	Text,
	Tooltip,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import ProfileModal from "./ProfileModal";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";

const SideDrawer = () => {
	const [search, setSearch] = useState("");
	const [searchResult, setSearchResult] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingChat, setLoadingChat] = useState();

	const { user, setUser, setSelectedChat, chats, setChats } = ChatState();

	const navigate = useNavigate();
	const toast = useToast();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const logoutHandler = async () => {
		try {
			const response = await fetch("/api/user/logout", {
				method: "POST",
				credentials: "include",
			});

			const logOut = await response.json();

			console.log(logOut);

			if (response.ok) {
				setUser(null);
				navigate("/");
			} else {
				throw new Error("Logout failed");
			}
		} catch (error) {
			console.error("Logout error: ", error);
		}
	};

	const handleSearch = async () => {
		if (!search) {
			toast({
				title: "Please enter something in search",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top-left",
			});
			return;
		}

		try {
			setLoading(true);
			const response = await fetch(`/api/user?search=${search}`, {
				method: "GET",
				credentials: "include",
			});

			const data = await response.json();
			setLoading(false);
			setSearchResult(data);
		} catch (error) {
			toast({
				title: "Error Occured",
				description: "Failed to load the search results",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
		}
	};

	const accessChat = async (userId) => {
		try {
			setLoadingChat(true);

			const config = {
				method: "POST",
				body: JSON.stringify({ userId }),
				headers: {
					"Content-Type": "application/json",
				},
			};

			const response = await fetch("/api/chat", config);
			const data = await response.json();

			if (!chats.find((c) => c._id === data._id))
				setChats([data, ...chats]);

			setSelectedChat(data);
			setLoadingChat(false);
			onClose();
		} catch (error) {
			toast({
				title: "Error fetching the chat",
				description: error.message,
				status: error,
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
		}
	};

	return (
		<>
			<Box
				display="flex"
				justifyContent={"space-between"}
				alignItems={"center"}
				bg={"white"}
				w={"100%"}
				p="5px 10px 5px 10px"
				borderWidth={"5px"}
			>
				<Tooltip
					label="Search users to chat"
					hasArrow
					placement="bottom-end"
				>
					<Button variant="ghost" onClick={onOpen}>
						<i className="fa-solid fa-magnifying-glass"></i>
						<Text display={{ base: "none", md: "flex" }} px="4">
							Search User
						</Text>
					</Button>
				</Tooltip>

				{/* Title */}
				<Text fontSize={"2xl"} fontFamily={"Work sans"}>
					Chat-Pulse
				</Text>

				{/* Profile & Logout */}
				<div>
					<Menu>
						<MenuButton p={1}>
							<BellIcon fontSize={"2xl"} m={1} />
						</MenuButton>
						{/* <MenuList></MenuList> */}
					</Menu>
					<Menu>
						<MenuButton
							as={Button}
							rightIcon={<ChevronDownIcon />}
							// p={1}
						>
							<Avatar
								size={"sm"}
								cursor={"pointer"}
								name={user.name}
								src={user.picture}
							/>
						</MenuButton>
						<MenuList>
							<ProfileModal user={user}>
								<MenuItem>My Profile</MenuItem>
							</ProfileModal>
							<MenuDivider />
							<MenuItem onClick={logoutHandler}>Logout</MenuItem>
						</MenuList>
					</Menu>
				</div>
			</Box>

			<Drawer placement="left" onClose={onClose} isOpen={isOpen}>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerHeader borderBottomWidth={"1px"}>
						Search Users
					</DrawerHeader>
					<DrawerBody>
						<Box display={"flex"} pb={2}>
							<Input
								placeholder="Search by name or email"
								mr={2}
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
							<Button onClick={handleSearch}>Go</Button>
						</Box>
						{loading ? (
							<ChatLoading />
						) : (
							searchResult?.map((user) => {
								return (
									<UserListItem
										key={user._id}
										user={user}
										handleFunction={() =>
											accessChat(user._id)
										}
									/>
								);
							})
						)}
						{loadingChat && (
							<Spinner ml={"auto"} display={"flex"} />
						)}
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	);
};

export default SideDrawer;
