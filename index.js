// root file of application
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 3000;
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "try.html"));
});

// listening on PORT
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:3000`);
  mongoose
    .connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    })
    .then(() => {
      console.log("MongoDB Connected");
    })
    .catch((err) => {
      console.log(err);
    });
});
