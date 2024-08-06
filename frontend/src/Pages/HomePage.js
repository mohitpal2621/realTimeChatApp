import React, { useEffect } from "react";
import Login from "../component/Authentication/Login";
import Signup from "../component/Authentication/Signup";
import {
	Box,
	Container,
	Text,
	Tabs,
	Tab,
	TabList,
	TabPanels,
	TabPanel,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../Context/ChatProvider"; // Import ChatState to access the user context

const HomePage = () => {
	const navigate = useNavigate();
	const { user } = ChatState(); // Get the user state from the ChatProvider context

	useEffect(() => {
		// If a valid user is present, navigate to "/chats"
		if (user) {
			navigate("/chats");
		}
	}, [user, navigate]);

	return (
		<Container maxW="xl" centerContent>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="center"
				p={3}
				bg={"white"}
				w="100%"
				m="40px 0 15px 0"
				borderRadius="lg"
				borderWidth="1px"
			>
				<Text fontSize="4xl" fontFamily="Work sans" color="black">
					Chat-Pulse
				</Text>
			</Box>
			<Box
				bg="white"
				w="100%"
				p={4}
				color="black"
				borderRadius="lg"
				borderWidth="1px"
			>
				<Tabs variant="soft-rounded">
					<TabList mb="1em">
						<Tab width="50%">Login</Tab>
						<Tab width="50%">Sign up</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<Login />
						</TabPanel>
						<TabPanel>
							<Signup />
						</TabPanel>
					</TabPanels>
				</Tabs>
			</Box>
		</Container>
	);
};

export default HomePage;
