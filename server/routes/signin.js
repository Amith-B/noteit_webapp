const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");

// user model
const User = require("../schema/user");

const googleApiUrl = process.env.GOOGLE_API_URL;

router.get("/", (req, res) => {
  const authToken = res.locals.token;

  axios({ method: "get", url: googleApiUrl + authToken })
    .then(async (response) => {
      const { email, name, picture } = response.data;

      const user = await User.findOne({ email });
      let payload = user.toJSON();

      if (!user) {
        const newUser = new User({
          email,
          name,
          picture,
        });
        payload = (await newUser.save()).toJSON();
      }

      const jwtToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        expiresIn: "7d",
      });

      res.send(JSON.stringify({ token: jwtToken, ...payload }));
    })
    .catch((err) => {
      res
        .status(400)
        .json({ error: "Bad Request, Invalid google signin token", err });
    });
});

module.exports = router;
