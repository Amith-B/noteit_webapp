const express = require("express");
const router = express.Router();
const { hashPassword } = require("../utils/hashPassword");

// model
const User = require("../schema/user");
const VerifyUser = require("../schema/userVerify");

router.post("/", async (req, res) => {
  const { password, token } = req.body;

  const user = await VerifyUser.findOne({
    verifyToken: token,
  });

  if (!user) {
    res.send("<h3>Verification link expired</h3>");
    return;
  }

  if (user.forgotPassword) {
    const { hashedPassword, salt } = await hashPassword(password);

    try {
      await User.findOneAndUpdate(
        { email: user.email },
        {
          $set: { password: hashedPassword, salt },
        }
      );

      await user.deleteOne();

      res.send(`<h3>Password reset successful</h3><br>
      <a target="__self" href=${process.env.HOST_URL}>Login</a>
      `);
    } catch (error) {
      res.send("<h3>Unable to update the password</h3>");
    }
  }
});

router.get("/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const user = await VerifyUser.findOne({
      verifyToken: token,
    });

    if (!user) {
      res.send("<h3>Verification link expired</h3>");
      return;
    }

    res.send(`
    <style>
    * {
      box-sizing: border-box;
      margin: 0;
      scroll-behavior: smooth;
    }
    .sign-in-container {
      height: 100vh;
      width: 100vw;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #fdf5e6;
    }
  
    .sign-in-card {
      background-image: linear-gradient(45deg, #ff4b4b, #b7419f);
      color: white;
      font-weight: bold;
      font-family: Verdana, Arial, Tahoma, Serif;
      width: 340px;
      padding: 2rem;
      border-radius: 3rem;
      box-shadow: 2px 2px 10px 2px gray;
    }
    .sign-in-input-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
  }
  
  .sign-in-input-group input {
      height: 36px;
      width: 100%;
      border: none;
      outline: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 400;
      padding: 0.5rem;
  }
  
  input[readonly] {
      opacity: 0.6;
  }
  
  .sign-in-note {
      font-size: 10px;
      font-weight: 100;
      margin-top: 1rem;
  }
  .sign-in-submit-button {
      background: #92c5fe;
      margin-top: 1rem;
      border: none;
      outline: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
  }
  </style>
  
  <div class="sign-in-container">
    <form class="sign-in-card" action="/resetpassword" method="POST">
      <h4>Reset your password</h4>
      <section class="sign-in-input-group">
        <input name="token" type="token" readonly style="visibility: hidden; height: 0; position: absolute;padding: 0; margin: 0" id="token" placeholder="token" value="${user.verifyToken}" />
        <input name="email" type="email" readonly id="email" placeholder="email" value="${user.email}" />
        <input name="password" type="password" id="password" placeholder="password" />
      </section>
      <button class="sign-in-submit-button" type="submit">Reset</button>
    </form>
  </div>
  `);
  } catch (error) {
    console.log(error);
    res.send("<h3>Unable to verify email</h3>");
  }
});

module.exports = router;
