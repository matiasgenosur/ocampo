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

  const {
    estado,
    campaign_id,
    from,
    to,
    search,
    page = '1',
    limit = '20',
  } = req.query || {};

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const supabase = getSupabase();

  // Query con filtros
  let query = supabase
    .from('leads')
    .select('id, lead_id_google, fecha_recibido, nombre, email, telefono, tipo_propiedad, region, campaign_id, estado, is_test, created_at', { count: 'exact' })
    .order('fecha_recibido', { ascending: false })
    .range(offset, offset + limitNum - 1);

  if (estado) query = query.eq('estado', estado);
  if (campaign_id) query = query.eq('campaign_id', campaign_id);
  if (from) query = query.gte('fecha_recibido', from);
  if (to) query = query.lte('fecha_recibido', to + 'T23:59:59.999Z');
  if (search) query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,telefono.ilike.%${search}%`);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error consultando leads:', error.message);
    return res.status(500).json({ error: 'Database error' });
  }

  return res.status(200).json({
    leads: data || [],
    total: count || 0,
    page: pageNum,
    pages: Math.ceil((count || 0) / limitNum),
  });
};
