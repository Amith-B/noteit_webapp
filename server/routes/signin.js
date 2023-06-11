const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// user model
const User = require("../schema/user");

// const googleApiUrl = process.env.GOOGLE_API_URL;

// router.get("/", (req, res) => {
//   const authToken = res.locals.token;

//   axios({ method: "get", url: googleApiUrl + authToken })
//     .then(async (response) => {
//       const { email, name, picture } = response.data;

//       const user = await User.findOne({ email });
//       let payload = user.toJSON();

//       if (!user) {
//         const newUser = new User({
//           email,
//           name,
//           picture,
//         });
//         payload = (await newUser.save()).toJSON();
//       }

//       const jwtToken = jwt.sign(
//         {
//           email: payload.email,
//           name: payload.name,
//           picture: payload.picture,
//           _id: payload._id,
//         },
//         process.env.TOKEN_SECRET,
//         {
//           expiresIn: "7d",
//         }
//       );

//       res.send(JSON.stringify({ token: jwtToken, ...payload }));
//     })
//     .catch((err) => {
//       res
//         .status(400)
//         .json({ error: "Bad Request, Invalid google signin token", err });
//     });
// });

const saltRounds = 10;
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);

  // Hash the password with the salt
  const hashedPassword = await bcrypt.hash(password, salt);

  return { hashedPassword, salt };
};

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  let payload = user && user.toJSON();

  if (!user) {
    const { hashedPassword, salt } = await hashPassword(password);
    const newUser = new User({
      email,
      password: hashedPassword,
      salt,
    });
    payload = (await newUser.save()).toJSON();
  } else {
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      res.status(401).json({ error: "Wrong password", code: "WRONG_PASSWORD" });
      return;
    }
  }

  const jwtToken = jwt.sign(
    {
      email: payload.email,
      _id: payload._id,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );

  res.send(JSON.stringify({ token: jwtToken, email: payload.email }));
});

router.get("/verifytoken", (req, res) => {
  const tokenData = res.locals.tokenData;

  const expiration = new Date(tokenData.exp * 1000);
  const currentTime = new Date();

  const diff = (expiration.getTime() - currentTime.getTime()) / 1000;

  res.status(200).json({ valid: diff > 60, email: tokenData.email });
});

module.exports = router;
