const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/generateToken");
const {
  sendEmailVerifyMail,
  sendForgotPasswordMail,
} = require("../utils/sendMail");
const { hashPassword } = require("../utils/hashPassword");

// user model
const User = require("../schema/user");
const VerifyUser = require("../schema/userVerify");

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

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    const payload = user && user.toJSON();
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      res.status(401).json({ error: "Wrong password", code: "WRONG_PASSWORD" });
      return;
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

    return;
  }

  const { hashedPassword, salt } = await hashPassword(password);
  const alreadyPresentUser = VerifyUser.findOne({ email });
  if (alreadyPresentUser) {
    await alreadyPresentUser.deleteOne();
  }
  const verifyToken = await generateToken(16);

  const newUser = new VerifyUser({
    email,
    password: hashedPassword,
    salt,
    verifyToken,
  });
  await newUser.save();

  await sendEmailVerifyMail(email, verifyToken);

  res.send(
    JSON.stringify({
      customMessage: true,
      message:
        "Verification mail sent to your mail id, please verify before signing in. Link valid for 10mins",
    })
  );
});

router.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    const alreadyPresentUser = VerifyUser.findOne({ email });
    if (alreadyPresentUser) {
      await alreadyPresentUser.deleteOne();
    }

    const verifyToken = await generateToken(16);

    const existingUser = new VerifyUser({
      email: user.email,
      password: user.password,
      salt: user.salt,
      verifyToken,
      forgotPassword: true,
    });
    await existingUser.save();

    await sendForgotPasswordMail(email, verifyToken);

    res.send(
      JSON.stringify({
        customMessage: true,
        message:
          "Verification mail sent to your mail id, please verify and reset the password. Link valid for 10mins",
      })
    );
  } else {
    res.send(
      JSON.stringify({
        customMessage: true,
        message: "Email id not registered, please register it first",
      })
    );
  }
});

router.get("/verifytoken", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }

  const authToken = auth.replace("Bearer ", "");
  const tokenData = jwt.decode(authToken);

  const expiration = new Date(tokenData.exp * 1000);
  const currentTime = new Date();

  const diff = (expiration.getTime() - currentTime.getTime()) / 1000;

  res.status(200).json({ valid: diff > 60, email: tokenData.email });
});

module.exports = router;
