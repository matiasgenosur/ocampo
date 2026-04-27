const crypto = require('crypto');
const { getSupabase } = require('../../lib/supabase');
const { sendEmail } = require('../../lib/email');
const { rateLimit } = require('../../lib/rate-limit');

// Mapeo de column_id estándar de Google Ads
const COLUMN_MAP = {
  FULL_NAME: 'nombre',
  EMAIL: 'email',
  PHONE_NUMBER: 'telefono',
};

// Mapeo de custom questions por column_name (ajustar según config Google Ads)
const CUSTOM_MAP = {
  'Tipo de propiedad': 'tipo_propiedad',
  'Tipo de proyecto': 'tipo_propiedad',
  'Metros cuadrados': 'metros_cuadrados',
  'Superficie': 'metros_cuadrados',
  'Plazo': 'plazo',
  'Region': 'region',
  'Región': 'region',
  'Comuna': 'region',
};

function parseLeadData(payload) {
  const fields = {};
  const columns = payload.user_column_data || payload.lead_field_data || [];

  for (const col of columns) {
    const value = col.string_value || '';
    // Primero buscar por column_id estándar
    if (col.column_id && COLUMN_MAP[col.column_id]) {
      fields[COLUMN_MAP[col.column_id]] = value;
    }
    // Luego por column_name para custom questions
    if (col.column_name && CUSTOM_MAP[col.column_name]) {
      fields[CUSTOM_MAP[col.column_name]] = value;
    }
  }

  return fields;
}

function sanitize(str) {
  if (!str) return str;
  return String(str).replace(/<[^>]*>/g, '').trim();
}

function buildNotificationHtml(lead) {
  const fecha = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });
  const rows = [
    ['Nombre', lead.nombre],
    ['Email', lead.email ? `<a href="mailto:${lead.email}" style="color: #C41E3A;">${lead.email}</a>` : '-'],
    ['Teléfono', lead.telefono ? `<a href="tel:${lead.telefono}" style="color: #C41E3A;">${lead.telefono}</a>` : '-'],
    ['Tipo de propiedad', lead.tipo_propiedad],
    ['Metros cuadrados', lead.metros_cuadrados],
    ['Plazo', lead.plazo],
    ['Región', lead.region],
    ['Campaña ID', lead.campaign_id],
    ['Test', lead.is_test ? 'Sí (lead de prueba)' : 'No'],
  ]
    .filter(([, v]) => v)
    .map(([label, value]) =>
      `<tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 160px;">${label}</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${value}</td></tr>`
    )
    .join('');

  const actions = [];
  if (lead.email) actions.push(`<a href="mailto:${lead.email}" style="background: #C41E3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 0 8px 8px 0;">Enviar Email</a>`);
  if (lead.telefono) actions.push(`<a href="tel:${lead.telefono}" style="background: #1A1A1A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 0 8px 8px 0;">Llamar</a>`);
  if (lead.telefono) actions.push(`<a href="https://wa.me/${lead.telefono.replace(/[^0-9]/g, '')}" style="background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 0 8px 8px 0;">WhatsApp</a>`);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
      <div style="background: #C41E3A; padding: 24px 32px;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Nuevo Lead Google Ads</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">${fecha}</p>
      </div>
      <div style="padding: 32px; background: #f9f9f9;">
        <table style="width: 100%; border-collapse: collapse;">${rows}</table>
        <div style="margin-top: 24px; text-align: center;">${actions.join('')}</div>
      </div>
      <div style="background: #1A1A1A; padding: 16px 32px; text-align: center;">
        <p style="color: #888; font-size: 12px; margin: 0;">Lead recibido desde Google Ads Lead Form Extension</p>
      </div>
    </div>
  `;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const { allowed } = rateLimit(req);
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const payload = req.body || {};

  // Validar google_key
  const webhookKey = process.env.GOOGLE_ADS_WEBHOOK_KEY;
  const providedKey = payload.google_key;
  if (!providedKey || !webhookKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const keyA = Buffer.from(String(providedKey));
  const keyB = Buffer.from(String(webhookKey));
  if (keyA.length !== keyB.length || !crypto.timingSafeEqual(keyA, keyB)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Validar payload mínimo
  const leadId = payload.lead_id;
  if (!leadId) {
    return res.status(400).json({ error: 'Missing lead_id' });
  }

  // Parsear campos del lead
  const fields = parseLeadData(payload);
  const lead = {
    lead_id_google: String(leadId),
    nombre: sanitize(fields.nombre),
    email: sanitize(fields.email),
    telefono: sanitize(fields.telefono),
    tipo_propiedad: sanitize(fields.tipo_propiedad),
    metros_cuadrados: sanitize(fields.metros_cuadrados),
    plazo: sanitize(fields.plazo),
    region: sanitize(fields.region),
    campaign_id: payload.campaign_id ? String(payload.campaign_id) : null,
    gcl_id: payload.gcl_id || null,
    raw_payload: payload,
    is_test: payload.is_test === true,
    estado: 'nuevo',
  };

  const supabase = getSupabase();

  // Idempotencia: verificar si ya existe
  const { data: existing } = await supabase
    .from('leads')
    .select('id')
    .eq('lead_id_google', lead.lead_id_google)
    .maybeSingle();

  if (existing) {
    return res.status(200).json({ lead_id: leadId, result: 'ok' });
  }

  // Insertar en DB
  const { error: insertError } = await supabase
    .from('leads')
    .insert(lead);

  if (insertError) {
    console.error('Error insertando lead:', insertError.message);
    return res.status(500).json({ error: 'Database error' });
  }

  // Enviar notificación por email (no bloquea la respuesta)
  const notificationEmail = process.env.NOTIFICATION_EMAIL || 'contacto@ocampo.cl';
  const tipoLabel = lead.tipo_propiedad || 'Consulta';
  const nombreLabel = lead.nombre || 'Sin nombre';
  try {
    await sendEmail(
      notificationEmail,
      `Nuevo lead Google Ads - ${nombreLabel} - ${tipoLabel}`,
      buildNotificationHtml(lead)
    );
  } catch (emailErr) {
    console.error('Error enviando notificación:', emailErr.message);
    // No falla el webhook, el lead ya está guardado
  }

  return res.status(200).json({ lead_id: leadId, result: 'ok' });
};
