const { getSupabase } = require('../lib/supabase');
const { getGmail } = require('../lib/email');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const status = { gmail: 'ok', supabase: 'ok', errors: {} };

  // Test Supabase
  try {
    const { error } = await getSupabase().from('leads').select('id').limit(1);
    if (error) throw new Error(error.message);
  } catch (err) {
    status.supabase = 'error';
    status.errors.supabase = err.message;
  }

  // Test Gmail API (getProfile, no envía email)
  try {
    await getGmail().users.getProfile({ userId: 'me' });
  } catch (err) {
    status.gmail = 'error';
    status.errors.gmail = err.message;
  }

  const allOk = status.gmail === 'ok' && status.supabase === 'ok';
  return res.status(allOk ? 200 : 503).json({
    status: allOk ? 'healthy' : 'degraded',
    services: { gmail: status.gmail, supabase: status.supabase },
    errors: Object.keys(status.errors).length ? status.errors : undefined,
    timestamp: new Date().toISOString(),
  });
};
