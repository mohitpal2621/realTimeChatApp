import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Button,
	FormControl,
	FormLabel,
	Input,
	InputGroup,
	InputRightElement,
	useToast,
	VStack,
} from "@chakra-ui/react";

const Login = () => {
	const [show, setShow] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const toast = useToast();
	const navigate = useNavigate();

	function handleClick() {
		setShow((prev) => !prev);
	}

	async function submitHandler() {
		setLoading(true);
		if (!email || !password) {
			toast({
				title: "Please fill all fields",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
			return;
		}

		try {
			const config = {
				headers: {
					"Content-Type": "application/json",
				},
			};

			const response = await fetch("/api/user/login", {
				method: "POST",
				headers: config.headers,
				body: JSON.stringify({
					email,
					password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				toast({
					title: "Wrong Credentials",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "bottom",
				});
				setLoading(false);
				return;
			}

			toast({
				title: "Login successful",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});

			setLoading(false);
			navigate("/chats");
		} catch (error) {
			toast({
				title: "Error occured",
				description: error.response.data.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
		}
	}

	return (
		<VStack spacing="5px" color="black">
			<FormControl id="email" isRequired>
				<FormLabel>Email</FormLabel>
				<Input
					placeholder="Enter email"
					onChange={(e) => setEmail(e.target.value)}
					value={email}
				/>
			</FormControl>
			<FormControl id="password" isRequired>
				<FormLabel>Password</FormLabel>
				<InputGroup>
					<Input
						type={show ? "text" : "password"}
						placeholder="Enter password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<InputRightElement width="4.5rem">
						<Button h="1.75rem" size="sm" onClick={handleClick}>
							{show ? "Hide" : "Show"}
						</Button>
					</InputRightElement>
				</InputGroup>
			</FormControl>
			<Button
				colorScheme="blue"
				width="100%"
				style={{ marginTop: 15 }}
				onClick={submitHandler}
				isLoading={loading}
			>
				Login
			</Button>
			<Button
				variant="solid"
				colorScheme="red"
				width="100%"
				style={{ marginTop: 15 }}
				onClick={() => {
					setEmail("guest@example.com");
					setPassword("123456");
				}}
			>
				Get Guest user credentials
			</Button>
		</VStack>
	);
};

export default Login;
