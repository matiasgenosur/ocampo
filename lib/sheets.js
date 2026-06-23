const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

let cachedSheet;

function getCreds() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  if (!b64) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_B64');
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

async function getLeadsSheet() {
  if (cachedSheet) return cachedSheet;
  const creds = getCreds();
  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID, auth);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  await sheet.loadHeaderRow();
  cachedSheet = sheet;
  return sheet;
}

async function leadExists(sheet, leadIdGoogle) {
  const rows = await sheet.getRows();
  return rows.some(r => String(r.get('lead_id')) === String(leadIdGoogle));
}

module.exports = { getLeadsSheet, leadExists };
