const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

async function sendEmail(to, subject, htmlBody) {
  await getTransporter().sendMail({
    from: `Ocampo Demoliciones <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: htmlBody,
  });
}

module.exports = { sendEmail };
