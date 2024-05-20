const mongoose = require("mongoose");

const roomChatSchema = new mongoose.Schema({
  msg: { type: String },
  createdBy: { type: String },
  createdAt: { type: String },
});

const messageSchema = new mongoose.Schema({
  orgainzers: [{ type: String }],
  message: [roomChatSchema],
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
