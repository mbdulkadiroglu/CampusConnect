require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const adminRoutes = require("./routes/admin");
const chatRoutes = require("./routes/chat");
const feedbackRoutes = require("./routes/feedback");
const bodyParser = require("body-parser");

// express app
const app = express();

// middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: 'https://campusconnect-honeybadgers.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true // allow session cookie from browser to pass through
}));

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// routes
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/feedback", feedbackRoutes);

// connect to db
// connect to db
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    const server = app.listen(process.env.PORT, () => {
      console.log("connected to db & listening on port", process.env.PORT);
    });

    const io = require("socket.io")(server, {
      pingTimeout: 60000,
      cors: {
        origin: "https://campusconnect-honeybadgers.netlify.app",
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("Connected to socket.io");

      socket.on("setup", (userData) => {
        socket.join(userData.email);
        console.log(userData.email);
        socket.emit("connected");
      });

      socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
      });

      socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
        if (chat === null) return console.log("chat is not defined hocam");
        console.log("--------------------------------");
        console.log("Chat", chat);
        console.log("Message", newMessageRecieved);

        // id yerine email
        socket
          .in(newMessageRecieved.receiverEmail)
          .emit("message recieved", newMessageRecieved);
      });

      socket.on("disconnect", () => {
        console.log("--------------------------------");
        console.log("User disconnected");
        console.log("--------------------------------");
        // You can add logic here if you need to handle anything specific on user disconnect
      });
    });
  })
  .catch((error) => {
    console.log(error);
  });
