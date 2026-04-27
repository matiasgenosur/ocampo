const { authenticateRequest } = require('../../lib/auth');
const { getSupabase } = require('../../lib/supabase');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = authenticateRequest(req);
  if (!user) return res.status(401).json({ error: 'No autorizado' });

  const { id } = req.query || {};
  if (!id) return res.status(400).json({ error: 'Falta id' });

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error consultando lead:', error.message);
    return res.status(500).json({ error: 'Database error' });
  }

  if (!data) return res.status(404).json({ error: 'Lead no encontrado' });

  return res.status(200).json(data);
};
