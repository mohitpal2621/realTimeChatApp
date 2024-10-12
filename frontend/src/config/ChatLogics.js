export const getSender = (loggedUser, users) => {
	return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};

export const getSenderFull = (loggedUser, users) => {
	if (users[0]._id === loggedUser._id) {
		console.log("users[1]: ", users[1]);
		return users[1];
	} else {
		console.log("users[0]: ", users[1]);
		return users[0];
	}
	// return users[0]._id === loggedUser._id ? users[1] : users[0];
};

export const isSameSender = (messages, msg, i, userId) => {
	return (
		i < messages.length - 1 &&
		(messages[i + 1].sender._id !== msg.sender._id || // If the next message is not equal to the currently sending msg's sender Id
			messages[i + 1].sender._id === undefined) &&
		messages[i].sender._id !== userId // If current msg is not by current logged in user(as we don't want his dp)
	);
};

export const isLastMessage = (messages, i, userId) => {
	return (
		i === messages.length - 1 &&
		messages[messages.length - 1].sender._id !== userId &&
		messages[messages.length - 1].sender._id
	);
};

export const isSameSenderMargin = (messages, msg, i, userId) => {
	if (
		i < messages.length - 1 &&
		messages[i + 1].sender._id === msg.sender._id &&
		messages[i].sender._id !== userId
	) {
		return 33;
	} else if (
		(i < messages.length - 1 &&
			messages[i + 1].sender._id !== msg.sender._id &&
			messages[i].sender._id !== userId) ||
		(i === messages.length - 1 && messages[i].sender._id !== userId)
	)
		return 0;
	else return "auto";
};

export const isSameUser = (messages, msg, i) => {
	return i > 0 && messages[i - 1].sender._id === msg.sender._id;
};
