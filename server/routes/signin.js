const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");

const TOKEN_SECRET = "SOME_SECRET_KEY";
const googleApiUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=";

router.get("/", (req, res) => {
  const authToken = res.locals.token;

  axios({ method: "get", url: googleApiUrl + authToken })
    .then((response) => {
      const { email, name } = response.data;
      const payload = {
        email,
        name,
      };
      const jwtToken = jwt.sign(payload, TOKEN_SECRET, { expiresIn: "2s" });

      res.send(JSON.stringify({ token: jwtToken, ...payload }));
    })
    .catch((err) => {
      res
        .status(400)
        .json({ error: "Bad Request, Invalid google signin token", err });
    });
});

module.exports = router;
