const { default: mongoose } = require("mongoose");

// MongoDB connection
async function connectDB() {
  mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/myapp",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", function () {
    console.log("Connected to MongoDB");
  });
}
module.exports = connectDB;
