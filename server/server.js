const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const notesRouter = require("./routes/notes");

const app = express();
const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
const port = process.env.PORT || 5001;

//middlewares
app.use(cors());
app.use(express.json());
app.use("/api/notes", notesRouter);

//test route
app.get("/", (req, res) => {
  res.send("Student Notes API is running!");
});

// Connect to MongoDB
if (!mongoUri) {
  console.error("MongoDB connection string is missing. Set MONGO_URI or MONGO_URL in .env");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });