const { generateToken, safeCompare } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body || {};

  if (
    !safeCompare(username, process.env.ADMIN_USERNAME) ||
    !safeCompare(password, process.env.ADMIN_PASSWORD)
  ) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = generateToken(username);
  return res.status(200).json({ token, expiresIn: 86400 });
};
