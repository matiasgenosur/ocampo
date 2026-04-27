const { authenticateRequest } = require('../../lib/auth');
const { getSupabase } = require('../../lib/supabase');

const VALID_ESTADOS = ['nuevo', 'contactado', 'cotizado', 'cerrado', 'descartado'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const user = authenticateRequest(req);
  if (!user) return res.status(401).json({ error: 'No autorizado' });

  const { id } = req.query || {};
  const { estado } = req.body || {};

  if (!id) return res.status(400).json({ error: 'Falta id' });
  if (!estado || !VALID_ESTADOS.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${VALID_ESTADOS.join(', ')}` });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('leads')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, estado, updated_at')
    .single();

  if (error) {
    console.error('Error actualizando lead:', error.message);
    return res.status(500).json({ error: 'Database error' });
  }

  return res.status(200).json(data);
};
