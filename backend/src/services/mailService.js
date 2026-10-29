import nodemailer from 'nodemailer';

let transporter = null;

// El transporter se crea la primera vez que se necesita, con los datos del .env
const obtenerTransporter = () => {
  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD } = process.env;
  if (!MAIL_HOST || !MAIL_USER || !MAIL_PASSWORD) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: Number(MAIL_PORT) || 587,
      secure: Number(MAIL_PORT) === 465,
      auth: { user: MAIL_USER, pass: MAIL_PASSWORD },
    });
  }
  return transporter;
};

export const enviarCorreo = async ({ para, asunto, texto }) => {
  const t = obtenerTransporter();
  if (!t) {
    console.warn('Email no configurado en el .env: se omite el envío');
    return;
  }
  await t.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to: para,
    subject: asunto,
    text: texto,
  });
};