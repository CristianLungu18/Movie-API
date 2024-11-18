const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const emailOptions = {
    from: "cinema support<support@cinema.com>",
    to: option.email,
    subject: option.subject,
    text: option.text,
  };

  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
