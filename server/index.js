const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const port = 3001;

// Require subroute files
const signInRoutes = require("./routes/signin");

// Middleware function
const tokenVerificationMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }

  const authToken = auth.replace("Bearer ", "");
  const token = jwt.decode(authToken);
  if (!token) {
    res.status(401).json({ error: "Incorrect token" });
    return;
  }

  next();
};

// Use the middleware
app.use(tokenVerificationMiddleware);

// Use the subroutes
// app.use('/', homeRoutes);
app.use("/api/signin", signInRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${process.env.PORT || port}`);
});
