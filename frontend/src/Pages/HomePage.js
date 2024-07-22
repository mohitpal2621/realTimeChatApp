import React from "react";
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

const HomePage = () => {
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
