const { google } = require('googleapis');

let gmail;

function getGmail() {
  if (!gmail) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });
    gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  }
  return gmail;
}

function buildEmail(to, subject, htmlBody) {
  const lines = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    htmlBody,
  ];
  return Buffer.from(lines.join('\r\n')).toString('base64url');
}

async function sendEmail(to, subject, htmlBody) {
  const raw = buildEmail(to, subject, htmlBody);
  await getGmail().users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });
}

module.exports = { buildEmail, sendEmail, getGmail };
