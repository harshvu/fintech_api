const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendVerificationEmail = async (email, code) => {

  await transporter.sendMail({
    from: `"App Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification Code",
    html: `
      <h2>Your Verification Code</h2>
      <h1>${code}</h1>
      <p>This code will expire in 10 minutes</p>
    `
  });

};