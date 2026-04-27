const { authenticateRequest } = require('../../lib/auth');
const { getSupabase } = require('../../lib/supabase');

function escapeCsv(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = authenticateRequest(req);
  if (!user) return res.status(401).json({ error: 'No autorizado' });

  const { estado, campaign_id, from, to } = req.query || {};

  const supabase = getSupabase();
  let query = supabase
    .from('leads')
    .select('id, lead_id_google, fecha_recibido, nombre, email, telefono, tipo_propiedad, metros_cuadrados, plazo, region, campaign_id, gcl_id, estado, is_test, created_at')
    .order('fecha_recibido', { ascending: false })
    .limit(5000);

  if (estado) query = query.eq('estado', estado);
  if (campaign_id) query = query.eq('campaign_id', campaign_id);
  if (from) query = query.gte('fecha_recibido', from);
  if (to) query = query.lte('fecha_recibido', to + 'T23:59:59.999Z');

  const { data, error } = await query;

  if (error) {
    console.error('Error exportando leads:', error.message);
    return res.status(500).json({ error: 'Database error' });
  }

  const headers = ['ID', 'Lead ID Google', 'Fecha', 'Nombre', 'Email', 'Teléfono', 'Tipo Propiedad', 'Metros²', 'Plazo', 'Región', 'Campaña ID', 'GCL ID', 'Estado', 'Test', 'Creado'];
  const rows = (data || []).map(r => [
    r.id, r.lead_id_google, r.fecha_recibido, r.nombre, r.email, r.telefono,
    r.tipo_propiedad, r.metros_cuadrados, r.plazo, r.region, r.campaign_id,
    r.gcl_id, r.estado, r.is_test ? 'Sí' : 'No', r.created_at,
  ].map(escapeCsv).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const fecha = new Date().toISOString().slice(0, 10);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="leads-export-${fecha}.csv"`);
  return res.status(200).send('\uFEFF' + csv); // BOM para Excel
};
