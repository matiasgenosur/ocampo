const crypto = require('crypto');

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas

function generateToken(username) {
  const payload = JSON.stringify({
    username,
    iat: Date.now(),
  });
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', process.env.ADMIN_TOKEN_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;

  const expectedSig = crypto
    .createHmac('sha256', process.env.ADMIN_TOKEN_SECRET)
    .update(payloadB64)
    .digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    if (Date.now() - payload.iat > TOKEN_EXPIRY_MS) return null;
    return payload;
  } catch {
    return null;
  }
}

function authenticateRequest(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return verifyToken(auth.slice(7));
  }
  // Fallback para CSV export (query param)
  const token = req.query?.token;
  if (token) return verifyToken(token);
  return null;
}

function safeCompare(a, b) {
  if (!a || !b) return false;
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = { generateToken, verifyToken, authenticateRequest, safeCompare };
