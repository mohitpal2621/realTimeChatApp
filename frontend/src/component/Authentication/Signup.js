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
// import axios from "axios";

const Signup = () => {
	const [show, setShow] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [pic, setPic] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const toast = useToast();

	function handleClick() {
		setShow((prev) => !prev);
	}

	function postDetails(inputPic) {
		setLoading(true);

		if (inputPic === undefined) {
			toast({
				title: "Please select an image",
				status: "warning",
				duration: "5000",
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
			return;
		}

		if (inputPic.type === "image/jpeg" || inputPic.type === "image/png") {
			const data = new FormData();
			data.append("file", inputPic);
			data.append("upload_preset", "ChatPulse");
			data.append("cloud_name", "dzlqsnk0g");

			fetch("https://api.cloudinary.com/v1_1/dzlqsnk0g/image/upload", {
				method: "post",
				body: data,
			})
				.then((response) => response.json())
				.then((data) => {
					setPic(data.url.toString());
					setLoading(false);
				})
				.catch((error) => {
					console.log(error);
					setLoading(false);
				});
		} else {
			toast({
				title: "Please select an image of proper extension",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
			return;
		}
	}

	async function submitHandler() {
		setLoading(true);
		if (!name || !email || !password || !confirmPassword) {
			toast({
				title: "Please fill all mandatory fields",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
			return;
		}

		if (password !== confirmPassword) {
			toast({
				title: "Passwords do not match",
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

			const response = await fetch("/api/user", {
				method: "POST",
				headers: config.headers,
				body: JSON.stringify({
					name,
					email,
					password,
					picture: pic,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Something went wrong");
			}

			toast({
				title: "Registration is successful",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});

			setLoading(false);
			navigate("/chats");
		} catch (error) {
			toast({
				title: "Error occured!",
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
		<VStack spacing="5px">
			<FormControl id="first-name" isRequired>
				<FormLabel>Name</FormLabel>
				<Input
					placeholder="Enter your name"
					onChange={(e) => setName(e.target.value)}
				/>
			</FormControl>
			<FormControl id="email" isRequired>
				<FormLabel>Email Address</FormLabel>
				<Input
					type="email"
					placeholder="Enter email-id"
					onChange={(e) => setEmail(e.target.value)}
				/>
			</FormControl>
			<FormControl id="password" isRequired>
				<FormLabel>Password</FormLabel>
				<InputGroup size="md">
					<Input
						type={show ? "text" : "password"}
						placeholder="Enter password"
						onChange={(e) => setPassword(e.target.value)}
					/>
					<InputRightElement width="4.5rem">
						<Button h="1.75rem" size="sm" onClick={handleClick}>
							{show ? "Hide" : "Show"}
						</Button>
					</InputRightElement>
				</InputGroup>
			</FormControl>
			<FormControl id="confirm-password" isRequired>
				<FormLabel>Confirm Password</FormLabel>
				<InputGroup size="md">
					<Input
						type={show ? "text" : "password"}
						placeholder="Confirm password"
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>
					<InputRightElement width="4.5rem">
						<Button h="1.75rem" size="sm" onClick={handleClick}>
							{show ? "Hide" : "Show"}
						</Button>
					</InputRightElement>
				</InputGroup>
			</FormControl>
			<FormControl id="pic">
				<FormLabel>Upload your picture</FormLabel>
				<Input
					type="file"
					p={1.5}
					accept="image/*"
					onChange={(e) => postDetails(e.target.files[0])}
				/>
			</FormControl>
			<Button
				colorScheme="blue"
				width="100%"
				style={{ marginTop: 15 }}
				onClick={submitHandler}
				isLoading={loading}
			>
				Sign up
			</Button>
		</VStack>
	);
};

export default Signup;
