const nodemailer = require('nodemailer');

const sendEmail = async (to_address, subject, content) => {
    const transporter = nodemailer.createTransport({
        host: 'asmtp.bilkent.edu.tr',
        port: 587, // The default SMTP port
        secure: false, // false for TLS; true for SSL
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

  const mailOptions = {
    from: `CampusConnect <${process.env.EMAIL_ADDRESS}>`,
    to: to_address,
    subject: subject,
    text: content,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
