const express = require("express");
const OpenAI = require("openai");
const generatePurchaseOrderHTML = require("../utils/purchaseOrderHtmlTemplate.js");
const getPrompt = require("../utils/openaiPrompt.js");
const User = require("../models/user.model.js");
const Message = require("../models/message.model.js");
const { mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const pdf = require("html-pdf");
const authenticateToken = require("../middleware/authentication.js");
dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

// PRIVATE ROUTER
router.post("/generate-po", authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.body;
    let messages = await Message.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(roomId),
        },
      },
      {
        $unwind: {
          path: "$message",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          createdByObjectId: {
            $cond: {
              if: { $eq: [{ $type: "$message.createdBy" }, "string"] },
              then: { $toObjectId: "$message.createdBy" },
              else: "$message.createdBy",
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdByObjectId",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $unwind: {
          path: "$result",
          includeArrayIndex: "string",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          "result.username": 1,
          "message.msg": 1,
        },
      },
    ]);

    let conversation = "";
    for (let i = 0; i < messages.length; i++) {
      conversation +=
        (messages[i].result.username ?? "") +
        " : " +
        messages[i].message.msg +
        "  ,  ";
    }
    const prompt = getPrompt(conversation);
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant designed to output JSON.",
        },
        { role: "user", content: prompt },
      ],
      model: "gpt-3.5-turbo-0125",
      response_format: { type: "json_object" },
    });
    const html = generatePurchaseOrderHTML(
      JSON.parse(completion.choices[0].message.content)
    );
    const options = {
      format: "A4",
      orientation: "portrait",
      border: "0.45in",
    };
    const createPDF = async (html, options) =>
      await new Promise((resolve, reject) => {
        pdf.create(html, options).toBuffer((err, buffer) => {
          if (err !== null) {
            reject(err);
          } else {
            resolve(buffer);
          }
        });
      });
    const pdfFile = await createPDF(html, options);
    res.contentType = "application/pdf";
    res.status(200).send(pdfFile.toString("base64"));
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
});
router.get("/user-list", authenticateToken, async function (req, res) {
  try {
    const userId = req.user.userId;

    const channels = await Message.aggregate([
      {
        $match: {
          orgainzers: userId,
        },
      },
      {
        $unwind: {
          path: "$orgainzers",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          organizerObjectId: {
            $cond: {
              if: { $eq: [{ $type: "$orgainzers" }, "string"] },
              then: { $toObjectId: "$orgainzers" },
              else: "$orgainzers",
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "organizerObjectId",
          foreignField: "_id",
          as: "organizerData",
        },
      },
      {
        $unwind: {
          path: "$organizerData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          message: { $first: "$message" },
          organizerData: { $push: "$organizerData" },
        },
      },
    ]);

    let response = channels.map((channel) => ({
      msg: channel.message ?? [],
      organizerDetail: channel.organizerData,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/get-channel", authenticateToken, async function (req, res) {
  try {
    const { clientId1, clientId2 } = req.body;
    const existingChannel = await Message.findOne({
      orgainzers: { $all: [clientId1, clientId2] },
    });
    if (!existingChannel) {
      const newChannel = Message({
        orgainzers: [clientId1, clientId2],
        message: [],
      });
      await newChannel.save();
      return res.status(200).json({ roomId: newChannel._id.toString() });
    }
    return res.status(200).json({ roomId: existingChannel._id.toString() });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/send-message", authenticateToken, async function (req, res) {
  try {
    const { message, roomId, id } = req.body;
    await Message.findByIdAndUpdate(roomId, {
      $push: {
        message: {
          msg: message,
          createdBy: new mongoose.Types.ObjectId(id),
          createdAt: new Date(),
        },
      },
    });
    // Emit event to the room where the message is sent
    // io.to(roomId).emit("newMessage", { message });
    res.status(200).send("Updated successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/other-user-list", authenticateToken, async function (req, res) {
  try {
    const loggedInUser = new mongoose.Types.ObjectId(req.user.userId);
    const availableUserIds = await User.aggregate([
      {
        $project: {
          _id: 1,
        },
      },
    ]);
    const userIds = availableUserIds.map((user) => user._id);

    let usersWithoutMessages = [];

    for (let i = 0; i < userIds.length; i++) {
      const currentUser = userIds[i].toString();
      const messageCount = await Message.countDocuments({
        orgainzers: { $all: [loggedInUser, currentUser] },
      });

      if (messageCount === 0 && currentUser !== loggedInUser.toString()) {
        // Exclude logged-in user
        const userDetail = await User.findById(currentUser);
        usersWithoutMessages.push({
          id: userDetail._id,
          username: userDetail.username,
          email: userDetail.email,
        });
      }
    }

    res.status(200).json(usersWithoutMessages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// PUBLIC ROUTER
router.post("/register", async function (req, res) {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });
    await user.save();
    // Associate socket ID with user
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error occurred while registering user");
  }
});

router.post("/login", async function (req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    console.log(token);
    res.status(200).json({ token, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
