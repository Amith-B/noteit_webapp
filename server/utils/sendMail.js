const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.NODE_MAILER_USER,
    pass: process.env.NODE_MAILER_PASS,
  },
});

async function sendMail(sendTo, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: '"NoteIt" <noteitextension@gmail.com>',
      to: sendTo,
      subject,
      html,
    });

    return info;
  } catch (error) {
    return null;
  }
}

async function sendEmailVerifyMail(sendTo, verificationToken) {
  const message = `
Hello NoteIt User
<br/>
<p>
You registered an account on NoteIt app, before being able to use your account you need to verify that this is your email address by clicking below link: 
</p>
<a href="${
    process.env.HOST_URL + "/verifyemail/" + verificationToken
  }" target="__blank">
${process.env.HOST_URL + "/verifyemail/" + verificationToken}
</a>
<br/>
<p>If you did not make this request then please ignore this email.</p>
<br/>
Kind Regards,<br/>
NoteIt
  `;
  const info = await sendMail(sendTo, "NoteIt Email Verification", message);

  return info;
}

async function sendForgotPasswordMail(sendTo, verificationToken) {
  const message = `
Hello NoteIt User
<br/>
<p>
Trouble signing in?<br/>
Resetting your password is easy.
</p>
<p>
Just click on below link and set new password
</p>
<a href="${
    process.env.HOST_URL + "/resetpassword/" + verificationToken
  }" target="__blank">
${process.env.HOST_URL + "/resetpassword/" + verificationToken}
</a>
<br/>
<p>If you did not make this request then please ignore this email.</p>
<br/>
Kind Regards,<br/>
NoteIt
  `;
  const info = await sendMail(sendTo, "NoteIt Reset Password", message);

  return info;
}

exports.sendEmailVerifyMail = sendEmailVerifyMail;
exports.sendForgotPasswordMail = sendForgotPasswordMail;
