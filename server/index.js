const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();

require("dotenv").config();

const port = process.env.PORT || 3001;
const mongodbUrl = process.env.MONGODB_URL;

const signInRoutes = require("./routes/signin");
const notesRoutes = require("./routes/notes");
const folderRoutes = require("./routes/folder");

const tokenVerificationMiddleware = (req, res, next) => {
  if (
    req.url.includes("/api/signin") &&
    !req.url.includes("/api/signin/verifytoken")
  ) {
    next();
  } else {
    try {
      const auth = req.headers.authorization;
      if (!auth) {
        res.status(401).json({ error: "Unauthorised" });
        return;
      }

      const authToken = auth.replace("Bearer ", "");
      const tokenData = jwt.decode(authToken);
      res.locals.token = authToken;
      res.locals.tokenData = tokenData;

      if (!tokenData) {
        res.status(400).json({
          error: "Bad Request: Incorrect token",
          code: "INCORRECT_TOKEN",
        });
        return;
      }

      jwt.verify(authToken, process.env.TOKEN_SECRET);
      next();
    } catch (e) {
      if (e.name === jwt.JsonWebTokenError.name) {
        res
          .status(401)
          .json({ error: "Invalid token", code: "INCORRECT_TOKEN" });
      } else if (e.name === jwt.TokenExpiredError.name) {
        res.status(401).json({ error: "Token Expired", code: "TOKEN_EXPIRED" });
      } else {
        res.status(401).json({ error: "Unable to verify token" });
      }
    }
  }
};

app.use(cors());

app.use(bodyParser.json());

app.get("/status", (req, res) => res.send("Server active"));

app.use(tokenVerificationMiddleware);

app.use("/api/signin", signInRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/folder", folderRoutes);

mongoose
  .connect(mongodbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });

module.exports = app;
