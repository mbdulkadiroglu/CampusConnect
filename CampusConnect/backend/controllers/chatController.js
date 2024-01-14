const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const Post = require("../models/postModel");


const createChat = async (req, res) => {
    const userId = req.user._id;
    const { targetUserId, topicPostId } = req.body;

    try {
        // Check if both users exist
        const user1 = await User.findById(userId);
        const user2 = await User.findById(targetUserId);

        // Check if the post exists
        //const post = await Post.findById(topicPostId);
        // does not have system for checking post is valid
        if (!user1 || !user2) {
            return res.status(404).json({ error: "User or Post not found." });
        }

        if (user1._id.toString() === user2._id.toString()) {
            return res.status(400).json({ error: "Cannot create chat with the same user." });
        }

        // Check if a chat already exists between these users
        const existingChat = await Chat.findOne({
            users: { $all: [userId, targetUserId] },
            topicPost: topicPostId
        });

        if (existingChat) {
            return res.status(200).json({ message: "Chat already exists.", chat: existingChat });
        }

        // Create a new chat with topicPost
        const newChat = new Chat({
            users: [userId, targetUserId],
            topicPost: topicPostId, // Setting the topicPostId
            seenBy: [req.user.email]
        });

        await newChat.save();
        res.status(201).json({ message: "Successfully created chat.", chat: newChat });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
};


const fetchChats = async (req, res) => {
    const userId = req.user._id;

    try {
        // Fetch chats where the current user is a participant
        const userChats = await Chat.find({
            users: { $elemMatch: { $eq: userId } }
        }).populate('users', '-password')
            .populate('latestMessage')
            .populate({
                path: 'latestMessage',
                populate: {
                    path: 'sender',
                    select: 'name'
                }
            }).populate({
                path: 'topicPost',
                select: 'title' // Populate the title from the Post model
            })
            .populate({
                path: 'seenBy',
                select: '_id name' // Assuming you want to return the names of users who have seen the latest message
            })
            .sort({ lastMessageTime: -1 });

        res.status(200).json(userChats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
}

//@description     Get all Messages by chatID
//@route           GET api/chat/messages/:chatID
// security problem
const fetchMessages = async (req, res) => {
    const chatId = req.params.chatID;

    try {
        const messages = await Message.find({ chat: chatId }).populate('sender', 'name');
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
};

//@description     Create New Message
//@route           POST /api/chat/messages/
const sendMessage = async (req, res) => {
    const { content, chat } = req.body;
    const senderId = req.user._id;

    if (!content || !chat) {
        return res.status(400).json({ error: "Message content and chat ID required." });
    }

    try {
        // Find the chat
        const chatDoc = await Chat.findById(chat).populate('users', 'email');
        if (!chatDoc) {
            return res.status(404).json({ error: "Chat not found." });
        }

        // Identify the receiver
        const receiver = chatDoc.users.find(user => user._id.toString() !== senderId.toString());
        if (!receiver) {
            return res.status(404).json({ error: "Receiver not found." });
        }
        console.log("Reciver-------------------")
        console.log(receiver)

        // Create and save the new message
        const newMessage = new Message({
            sender: senderId,
            content,
            email: req.user.email,
            receiver: receiver._id,
            receiverEmail: receiver.email,
            chat,
        });

        console.log("tesssstt===========", newMessage)
        await newMessage.save();

        // Update the latestMessage in the Chat document
        await Chat.findByIdAndUpdate(chat, {
            latestMessage: newMessage.content,
            lastMessageTime: new Date(), // Update the last message time to now
            seenBy: [req.user.email] // Existing code
        });

        console.log("Here is the new message ------")
        console.log(newMessage)
        console.log("Here is the new message ------")
        res.status(201).json(newMessage);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
};

//@description     Add user to seenBy array
//@route           POST /api/chat/updateChatSeen/:chatID
const updateChatSeen = async (req, res) => {
    const chatID = req.params.chatID;
    const userMail = req.user.email.toString(); // Convert to string if it's an ObjectID

    if (!chatID) {
        return res.status(400).json({ error: "Chat ID is required." });
    }

    try {
        // Find the chat
        const chatDoc = await Chat.findById(chatID);
        if (!chatDoc) {
            return res.status(404).json({ error: "Chat not found." });
        }

        // Check if user is already in the seenBy array
        if (!chatDoc.seenBy.map(id => id.toString()).includes(userMail)) {
            // Add user to the seenBy array
            chatDoc.seenBy.push(userMail);
            await chatDoc.save();
        }

        res.status(200).json({ message: "Chat seen status updated." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
};


module.exports = { createChat, fetchChats, fetchMessages, sendMessage, updateChatSeen }