const { sendEmail } = require('../lib/email');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { nombre, empresa, email, telefono, servicio, mensaje } = req.body || {};

  if (!nombre || !email || !telefono || !servicio || !mensaje) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const empresaTexto = empresa ? empresa : 'No especificada';
  const fechaEnvio = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });

  const emailRicardoHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
      <div style="background: #C41E3A; padding: 24px 32px;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Nueva Solicitud de Cotización</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">${fechaEnvio}</p>
      </div>
      <div style="padding: 32px; background: #f9f9f9;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;">Nombre</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${nombre}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Empresa</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${empresaTexto}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: #C41E3A;">${email}</a></td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Teléfono</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="tel:${telefono}" style="color: #C41E3A;">${telefono}</a></td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Servicio</td><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong style="color: #C41E3A;">${servicio}</strong></td></tr>
        </table>
        <div style="margin-top: 24px;">
          <p style="font-weight: bold; margin-bottom: 8px;">Descripción del proyecto:</p>
          <div style="background: white; border-left: 4px solid #C41E3A; padding: 16px; border-radius: 4px; line-height: 1.6;">
            ${mensaje.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div style="margin-top: 24px; text-align: center;">
          <a href="mailto:${email}" style="background: #C41E3A; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Responder al cliente</a>
        </div>
      </div>
    </div>
  `;

  const emailClienteHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
      <div style="background: #C41E3A; padding: 24px 32px;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Ocampo Demoliciones</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">Confirmación de solicitud</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="margin-top: 0;">Hola ${nombre},</h2>
        <p style="line-height: 1.6; color: #444;">Hemos recibido tu solicitud de cotización para <strong>${servicio}</strong>. Nuestro equipo la revisará y te contactará en menos de 24 horas hábiles.</p>
        <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px; font-weight: bold; color: #666; font-size: 13px; text-transform: uppercase;">Resumen de tu solicitud</p>
          <p style="margin: 4px 0;"><strong>Servicio:</strong> ${servicio}</p>
          <p style="margin: 4px 0;"><strong>Empresa:</strong> ${empresaTexto}</p>
          <p style="margin: 4px 0 0;"><strong>Mensaje:</strong> ${mensaje.replace(/\n/g, '<br>')}</p>
        </div>
        <p style="line-height: 1.6; color: #444;">Si tienes alguna urgencia, puedes contactarnos directamente:</p>
        <ul style="color: #444; line-height: 2;">
          <li><a href="tel:+56928553089" style="color: #C41E3A;">+56 9 2855 3089</a></li>
          <li><a href="https://wa.me/56928553089" style="color: #C41E3A;">WhatsApp</a></li>
          <li><a href="mailto:contacto@ocampo.cl" style="color: #C41E3A;">contacto@ocampo.cl</a></li>
        </ul>
      </div>
      <div style="background: #1A1A1A; padding: 20px 32px; text-align: center;">
        <p style="color: #888; font-size: 13px; margin: 0;">&copy; 2025 Ocampo Demoliciones &middot; Santiago, Chile</p>
      </div>
    </div>
  `;

  try {
    await sendEmail('ricardo@ocampo.cl', `Nueva Cotización: ${servicio} - ${nombre}`, emailRicardoHtml);
    await sendEmail(email, 'Recibimos tu solicitud - Ocampo Demoliciones', emailClienteHtml);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error enviando email:', error.message);
    return res.status(500).json({ error: 'Error al enviar el mensaje. Intenta nuevamente.' });
  }
};
