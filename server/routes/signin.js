const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");

const googleApiUrl = process.env.GOOGLE_API_URL;

router.get("/", (req, res) => {
  const authToken = res.locals.token;

  axios({ method: "get", url: googleApiUrl + authToken })
    .then((response) => {
      const { email, name } = response.data;
      const payload = {
        email,
        name,
        // uid: mongodb uid - TODO
      };
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
