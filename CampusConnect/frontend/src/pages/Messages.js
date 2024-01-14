import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Divider,
  List,
  ListItemText,
  TextField,
  Button,
  ListItemButton,
} from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import io from "socket.io-client";
import Avatar from '@mui/material/Avatar';

const ENDPOINT = "https://campusconnectbackend-67br.onrender.com"; // "https://talk-a-tive.herokuapp.com"; -> After deployment
var socket, selectedChatCompare;

function Messages() {
  const { state: routeState } = useLocation();

  const selectedChatId = routeState ? routeState.selectedChatId : null;
  const startMessage = routeState ? routeState.startMessage : ""
  const { user } = useAuthContext();

  const messageEndRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(selectedChatId);
  const [socketConnected, setSocketConnected] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [product, setProduct] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [allowInput, setAllowInput] = useState(true);
  const [fetchChat, setFetchChat] = useState(false);

  const handleSelectChat = (chatId) => {
    console.log("Selected ID:", chatId);
    setSelectedChat(chatId);
  };

  const isChatSelected = (chatId) => {
    return chatId === selectedChat;
  };


  const getMessages = async (chatId) => {
    setChatLoading(true);
    try {
      const response = await fetch(`https://campusconnectbackend-67br.onrender.com/api/chat/messages/${chatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const fetchedMessages = await response.json();
      setMessages(fetchedMessages);
      getProductInfo()

      socket.emit("join chat", selectedChat);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    finally {
      setChatLoading(false);
    }

  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return; // Prevent sending empty messages

    setAllowInput(false);
    console.log(messageInput);
    try {
      const response = await fetch('https://campusconnectbackend-67br.onrender.com/api/chat/messages/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          content: messageInput,
          chat: selectedChat,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Update the frontend with the new message (optional, depends on your implementation)
      const newMessage = await response.json();
      setFetchChat(!fetchChat)
      socket.emit("new message", newMessage);
      setMessages([...messages, newMessage]);

      setMessageInput(''); // Clear the message input field after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
    finally {
      setAllowInput(true);
    }

  };

  const fetchChats = async () => {
    const response = await fetch("https://campusconnectbackend-67br.onrender.com/api/chat", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });
    const chatJson = await response.json();

    console.log(chatJson);
    setChats(chatJson || []);
  };

  const getProductInfo = async () => {
    const chat = chats.find(chat => chat._id === selectedChat);
    if (!chat) return;

    console.log("Chats", chats)
    console.log("Prouct", chat.topicPost)
    setProduct(chat.topicPost);
  };

  // First tine getting the messages from selected chat and chats for
  useEffect(() => {
    console.log("Upper useEffect")
    fetchChats();
    setSelectedChat(selectedChatId);
    if (selectedChatId) {

      getMessages(selectedChatId);
      selectedChatCompare = selectedChat;

    }
  }, [selectedChatId]);


  // when a different chat is selected
  useEffect(() => {
    if (selectedChat) {
      console.log("Below useEffect")

      getMessages(selectedChat);
      getProductInfo();
      selectedChatCompare = selectedChat;
      updateSeenStatus(selectedChat);
      setFetchChat(!fetchChat)
    }
  }, [selectedChat]);

  useEffect(() => {
    console.log("useEffect chats")
    getProductInfo();
  }, [chats]);

  useEffect(() => {
    fetchChats();
    console.log("Different chat message")
  }, [fetchChat])

  // socket.io functions
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));

    return () => {
      socket.disconnect();
      console.log("Socket disconnected");
    };
  }, []);

  //socket io useEffect
  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {

      //console.log("selectedChatCompare", selectedChatCompare)
      //console.log("newMessageRecieved.chat", newMessageRecieved.chat)
      //console.log(selectedChatCompare !== newMessageRecieved.chat)
      if ((!selectedChatCompare) || selectedChatCompare !== newMessageRecieved.chat) {
        console.log("other notification")
        setFetchChat(!fetchChat);
      }
      else {

        console.log("Entered ", selectedChatCompare !== newMessageRecieved.chat)
        setMessages([...messages, newMessageRecieved]);

        console.log("HEYYYY MESSAGE IS RECIEVED");
        console.log(newMessageRecieved)

        // update the chats seenBy array using the updateChatSeen api its call https://campusconnectbackend-67br.onrender.com/api/chat/updateChatSeen/:chatID

        updateSeenStatus(selectedChatCompare)
      }
    });
  });

  const updateSeenStatus = async (chatId) => {
    try {
      await fetch(`https://campusconnectbackend-67br.onrender.com/api/chat/updateChatSeen/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });
    } catch (error) {
      console.error('Error updating seen status:', error);
    }
  };

  const hasUnreadMessages = (chat) => {
    return chat.seenBy && !chat.seenBy.includes(user.email);
  };

  const otherUser = (user1, user2) => {
    if (!user1 || !user2) {
      return "Unknown";
    }
    let other = user1.email === user.email ? user2 : user1;
    return other;
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log("scroll")
    scrollToBottom();
  }, [messages, chatLoading]);

  return (
    <Box
      m={4}
      border="1px solid #e0e0e0"
      borderRadius={2}
      overflow="hidden"
      height="calc(100vh - 128px)"
    >
      {" "}
      {/* Considered double margins */}
      <Box display="flex" height="calc(100vh - 128px)">
        {" "}
        {/* Subtracting AppBar and double margins */}
        <Box width={1 / 4} bgcolor="#f7f7f7" boxShadow={3}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6">Inbox</Typography>
            </Toolbar>
          </AppBar>
          <Box overflow="auto" height="calc(100% - 64px)">
            <List>
              {chats.map((chat) => (
                <div key={chat._id}>
                  <ListItemButton
                    selected={isChatSelected(chat._id)}
                    onClick={() => handleSelectChat(chat._id)}
                    style={{
                      backgroundColor: isChatSelected(chat._id) ? "#ADD8E6" : "transparent"
                    }}>
                    <Avatar
                      alt="Profile Picture"
                      src={otherUser(chat.users[0], chat.users[1]).profileImage}
                      style={{ marginRight: "10px" }}
                    />
                    <ListItemText
                      primary={`${otherUser(chat.users[0], chat.users[1]).firstName} ${otherUser(chat.users[0], chat.users[1]).lastName}`}
                      secondary={
                        <>
                          <strong>About: </strong>{chat.topicPost?.title ? chat.topicPost.title : 'This item no longer exists'}<br />
                          {chat.latestMessage ? (chat.latestMessage.slice(0, 30) + (chat.latestMessage.length > 30 ? "..." : "")) : "--No Messages Sent--"}
                        </>
                      }
                    />
                    {hasUnreadMessages(chat) && (
                      <span style={{ color: 'blue', marginLeft: '10px' }}>●</span>
                    )}
                  </ListItemButton>
                  <Divider />
                </div>
              ))}
            </List>



          </Box>
        </Box>
        <Divider orientation="vertical" flexItem />


        {selectedChat === null ? (
          <Box
            width={3 / 4}
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Typography variant="h6">Select a chat to send messages</Typography>
          </Box>
        ) :
          chatLoading ? (
            <Box
              width={3 / 4}
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress />
            </Box>
          ) :
            (
              <Box
                width={3 / 4}
                display="flex"
                flexDirection="column"
                boxShadow={2}
              >
                <AppBar position="static">
                  <Toolbar>
                    <Typography variant="h6" flexGrow={1}>
                      {
                        selectedChat ?
                          (chats.find(chat => chat._id === selectedChat) ?
                            otherUser(chats.find(chat => chat._id === selectedChat).users[0], chats.find(chat => chat._id === selectedChat).users[1]).firstName + " " +
                            otherUser(chats.find(chat => chat._id === selectedChat).users[0], chats.find(chat => chat._id === selectedChat).users[1]).lastName
                            : "Chat not found")
                          : "No Chat Selected"
                      }
                    </Typography>
                    <Typography variant="subtitle1" align="right">
                      {product ? ("Product: " + product.title) : ("This product no longer exists")}
                    </Typography>
                  </Toolbar>
                </AppBar>

                {//this is the part that shows the messages in a chat
                }
                <Box flex={1} overflow="auto" p={2}>
                  <Box display="flex" flexDirection="column" gap={2}>
                    {messages.map((message) => (
                      <Box
                        key={message._id}
                        display="flex"
                        flexDirection="column"
                        alignItems={message.email === user.email ? "flex-end" : "flex-start"}
                      >
                        <Typography
                          variant="body1"
                          bgcolor={message.email === user.email ? "#ADD8E6" : "#e0e0e0"}
                          p={1}
                          borderRadius={2}
                          maxWidth="500px"
                          wordWrap="break-word"
                        >
                          {message.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          paddingTop={0.5}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          }
                        </Typography>
                      </Box>
                    ))}
                    <div ref={messageEndRef} />
                  </Box>
                </Box>

                <Box p={2} borderTop="1px solid #e0e0e0">
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => {
                      if (allowInput) {
                        setMessageInput(e.target.value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();  // Prevents the default action of the enter key
                        sendMessage();
                      }
                    }}

                  />
                  <Box mt={1} display="flex" justifyContent="flex-end">
                    <Button onClick={sendMessage} variant="contained" color="primary">
                      Send
                    </Button>
                  </Box>
                </Box>
              </Box>)}


      </Box>
    </Box>
  );
}

export default Messages;
