import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
	const [user, setUser] = useState(); // To keep track of currently logged in user(complete document)
	const [selectedChat, setSelectedChat] = useState(); // To Keep track of currently selected chat/groupChat(complete chat document), if not selected then set as null
	const [chats, setChats] = useState([]); // Keep track of all chats/groupChats which current logged in user is a part of
	const [notification, setNotification] = useState([]);

	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const verifyToken = async () => {
			try {
				const response = await fetch("/api/verify-token", {
					method: "GET",
					credentials: "include",
				});

				if (response.ok) {
					const data = await response.json();
					setUser(data.user); // Set complete document of currently logged in user to user state
				} else {
					throw new Error("Token Verification Failed");
					// navigate("/");
				}
			} catch (error) {
				setUser(null); // If there is no user currently logged in set User state to null and navigate to HomePage(Login/Signup)
				navigate("/");
			} finally {
				setLoading(false);
			}
		};

		verifyToken();
	}, [navigate]);

	useEffect(() => {
		// Redirect to login page if no user logged in and not loading
		if (!loading && !user) {
			navigate("/");
		}
	}, [loading, user, navigate]);

	useEffect(() => {
		const fetchUnreadNotifications = async () => {
			try {
				const response = await fetch("/api/message/unread", {
					method: "GET",
					credentials: "include",
				});

				if (response.ok) {
					const data = await response.json();
					setNotification(data);
				}
			} catch (error) {
				console.error("Error fetching unread notifications:", error);
			}
		};

		if (user) {
			fetchUnreadNotifications();
		}
	}, [user]);

	return (
		<ChatContext.Provider
			value={{
				user,
				chats,
				selectedChat,
				notification,
				setUser,
				setSelectedChat,
				setChats,
				setNotification,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};

// Helper function so, useContext and ChatContext is not required to be imported in each component
export const ChatState = () => {
	return useContext(ChatContext);
};

export default ChatProvider;
