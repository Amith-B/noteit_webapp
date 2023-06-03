const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();

require("dotenv").config();

const port = process.env.PORT;

// Require subroute files
const signInRoutes = require("./routes/signin");
const notesRoutes = require("./routes/notes");

// Middleware function
const tokenVerificationMiddleware = (req, res, next) => {
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
    res.status(400).json({ error: "Bad Request: Incorrect token" });
    return;
  }

  if (req.url.includes("/api/signin")) {
    next();
  } else {
    try {
      jwt.verify(authToken, process.env.TOKEN_SECRET);
      next();
    } catch (e) {
      if (e.name === jwt.JsonWebTokenError.name) {
        res.status(401).json({ error: "Invalid token" });
      } else if (e.name === jwt.TokenExpiredError.name) {
        res.status(401).json({ error: "Token Expired" });
      } else {
        res.status(401).json({ error: "Unable to verify token" });
      }
    }
  }
};

// cors
app.use(cors());

// Use the middleware
app.use(tokenVerificationMiddleware);

// Use the subroutes
// app.use('/', homeRoutes);
app.use("/api/signin", signInRoutes);
app.use("/api/notes", notesRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
