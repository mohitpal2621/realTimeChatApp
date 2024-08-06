import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
	const [user, setUser] = useState();
	const [selectedChat, setSelectedChat] = useState();
	const [chats, setChats] = useState([]);

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
					setUser(data.user);
				} else {
					throw new Error("Token Verification Failed");
					// navigate("/");
				}
			} catch (error) {
				setUser(null);
				navigate("/");
			} finally {
				setLoading(false);
			}
		};

		verifyToken();
	}, [navigate]);

	useEffect(() => {
		// Redirect to login page if no user and not loading
		if (!loading && !user) {
			navigate("/");
		}
	}, [loading, user, navigate]);

	return (
		<ChatContext.Provider
			value={{
				user,
				setUser,
				selectedChat,
				setSelectedChat,
				chats,
				setChats,
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
