import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
	isSameSender,
	isLastMessage,
	isSameSenderMargin,
	isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { Avatar, Tooltip } from "@chakra-ui/react";

const ScrollableChat = ({ messages }) => {
	const { user } = ChatState();
	return (
		<ScrollableFeed>
			{messages &&
				messages.map((msg, i) => (
					<div style={{ display: "flex" }} key={msg._id}>
						{(isSameSender(messages, msg, i, user._id) ||
							isLastMessage(messages, i, user._id)) && (
							<Tooltip
								label={msg.sender.name}
								placement="bottom-start"
								hasArrow
							>
								<Avatar
									mt={"7px"}
									mr={1}
									size={"sm"}
									cursor={"pointer"}
									name={msg.sender.name}
									src={msg.sender.picture}
								></Avatar>
							</Tooltip>
						)}
						<span
							style={{
								backgroundColor: `${
									msg.sender._id === user._id
										? "#BEE3F8"
										: "#B9F5D0"
								}`,
								marginLeft: isSameSenderMargin(
									messages,
									msg,
									i,
									user._id
								),
								marginTop: isSameUser(
									messages,
									msg,
									i,
									user._id
								)
									? 3
									: 10,
								borderRadius: "20px",
								padding: "5px 15px",
								maxWidth: "75%",
							}}
						>
							{msg.content}
						</span>
					</div>
				))}
		</ScrollableFeed>
	);
};

export default ScrollableChat;
