const { getSupabase } = require('../../lib/supabase');
const { getGmail, sendEmail } = require('../../lib/email');

module.exports = async function handler(req, res) {
  // Vercel Cron envía GET con header de verificación
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let gmailOk = true;
  let supabaseOk = true;
  let gmailError = null;
  let supabaseError = null;

  // Test Supabase
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('leads').select('id').limit(1);
    if (error) throw new Error(error.message);
  } catch (err) {
    supabaseOk = false;
    supabaseError = err.message;
  }

  // Test Gmail API
  try {
    await getGmail().users.getProfile({ userId: 'me' });
  } catch (err) {
    gmailOk = false;
    gmailError = err.message;
  }

  // Guardar resultado en DB (solo si Supabase funciona)
  if (supabaseOk) {
    try {
      const supabase = getSupabase();

      await supabase.from('health_checks').insert({
        gmail_ok: gmailOk,
        supabase_ok: supabaseOk,
        gmail_error: gmailError,
        supabase_error: supabaseError,
        alerted: false,
      });

      // Limpiar checks viejos (mantener últimos 7 días)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('health_checks').delete().lt('checked_at', weekAgo);
    } catch (err) {
      console.error('Error guardando health check:', err.message);
    }
  }

  // Si algo falló, intentar enviar alerta
  if (!gmailOk || !supabaseOk) {
    const problems = [];
    if (!gmailOk) problems.push(`Gmail API: ${gmailError}`);
    if (!supabaseOk) problems.push(`Supabase: ${supabaseError}`);

    console.error('HEALTH CHECK FAILED:', problems.join(' | '));

    // Si Gmail funciona, enviar alerta por email
    if (gmailOk) {
      try {
        const notificationEmail = process.env.NOTIFICATION_EMAIL || 'contacto@ocampo.cl';
        await sendEmail(
          notificationEmail,
          'ALERTA ocampo.cl - Servicio caído',
          buildAlertHtml(problems)
        );

        // Marcar como alertado
        if (supabaseOk) {
          const supabase = getSupabase();
          const { data } = await supabase
            .from('health_checks')
            .select('id')
            .order('checked_at', { ascending: false })
            .limit(1)
            .single();
          if (data) {
            await supabase.from('health_checks').update({ alerted: true }).eq('id', data.id);
          }
        }
      } catch (emailErr) {
        console.error('Error enviando alerta:', emailErr.message);
      }
    }
  }

  return res.status(200).json({
    gmail: gmailOk ? 'ok' : 'error',
    supabase: supabaseOk ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
  });
};

function buildAlertHtml(problems) {
  const fecha = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });
  const items = problems.map(p => `<li style="padding: 8px 0; border-bottom: 1px solid #fee;">${p}</li>`).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #DC2626; padding: 24px 32px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">ALERTA: Servicio caído en ocampo.cl</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">${fecha}</p>
      </div>
      <div style="padding: 32px; background: #FEF2F2;">
        <p style="margin-top: 0; font-weight: bold;">Se detectaron los siguientes problemas:</p>
        <ul style="list-style: none; padding: 0; margin: 0;">${items}</ul>
        <div style="margin-top: 24px; padding: 16px; background: white; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Acción requerida:</strong> Si Gmail muestra "invalid_grant", se debe regenerar el refresh token en
            <a href="https://developers.google.com/oauthplayground" style="color: #DC2626;">OAuth Playground</a>
            y actualizar la variable GMAIL_REFRESH_TOKEN en Vercel.
          </p>
        </div>
      </div>
    </div>
  `;
}
