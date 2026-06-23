const { sheets: sheetsApi } = require('@googleapis/sheets');
const { JWT } = require('google-auth-library');

const HEADERS = [
  'fecha', 'lead_id', 'nombre', 'email', 'telefono',
  'tipo_propiedad', 'metros_cuadrados', 'plazo', 'region',
  'campaign_id', 'gcl_id', 'is_test',
];

let cachedClient;

function getClient() {
  if (cachedClient) return cachedClient;
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  if (!b64) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_B64');
  const creds = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  cachedClient = sheetsApi({ version: 'v4', auth });
  return cachedClient;
}

async function leadExists(leadId) {
  const client = getClient();
  const res = await client.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: 'B:B',
  });
  const rows = res.data.values || [];
  return rows.some(r => String(r[0]) === String(leadId));
}

async function appendLead(lead) {
  const client = getClient();
  const row = HEADERS.map(h => lead[h] != null ? String(lead[h]) : '');
  await client.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: 'A:L',
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
}

module.exports = { leadExists, appendLead };
