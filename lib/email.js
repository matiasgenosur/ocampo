const { Resend } = require('resend');

let client;

function getClient() {
  if (!client) {
    if (!process.env.RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY');
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

async function sendEmail(to, subject, htmlBody) {
  const from = process.env.EMAIL_FROM || 'Ocampo Demoliciones <onboarding@resend.dev>';
  const { error } = await getClient().emails.send({ from, to, subject, html: htmlBody });
  if (error) throw new Error(`Resend: ${error.message || JSON.stringify(error)}`);
}

module.exports = { sendEmail };
