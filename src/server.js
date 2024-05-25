const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const router = require("./routes/chatRoutes");
const connectDB = require("./connectDB/connectDB");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const Message = require("./models/message.model");
dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());
app.use("/", router);
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/myapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static(path.join(__dirname, "public")));

server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to MongoDB");
});
db.once("open", () => {
  const changeStream = Message.watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "update") {
      const updatedMessage = change.updateDescription.updatedFields;
      const roomId = change.documentKey._id.toString();
      let updatedValue = {};
      for (const key in updatedMessage) {
        if (Object.hasOwnProperty.call(updatedMessage, key)) {
          updatedValue = updatedMessage[key];
        }
      }
      io.to(roomId).emit(`messageUpdate/${roomId}`, updatedValue);
    }
  });
});
// WebSocket connection
io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  // Handle joining a room
  socket.on("joinRoom", async (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
    await connectDB;
    // Fetch initial messages for the room and send them to the client
    Message.findById(roomId)
      .then((document) => {
        if (document) {
          const messages = document.message;
          socket.emit(`initialMessages/${roomId}`, messages);
        }
      })
      .catch((error) => {
        console.error("Error fetching initial messages:", error);
      });
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
