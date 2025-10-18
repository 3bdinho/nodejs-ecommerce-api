const nodemailer = require("nodemailer");

const sendMail = async (Options) => {
  // 1-Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2-Define email  options
  const message = {
    from: "'E-shop App' <abduulrahmanj@gmail.com>",
    to: Options.to,
    subject: Options.subject,
    text: Options.text,
    html: Options.html,
  };

  // 3-send email
  await transporter.sendMail(message);
};
module.exports = sendMail;
