import nodemailer from "nodemailer";
import { logger } from "./logger";

const ADMIN_EMAIL = "matiasagustinpatti123@gmail.com";

function getTransporter() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    logger.warn("GMAIL_USER o GMAIL_APP_PASSWORD no configurados - los emails no se enviarán");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
}

function getFromEmail(): string {
  return process.env.GMAIL_USER ?? "noreply@soporte.com";
}

export async function sendTicketCreatedToClient(opts: {
  clientName: string;
  clientEmail: string;
  ticketNumber: string;
  problemType: string;
  description: string;
}): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: `"Soporte Técnico" <${getFromEmail()}>`,
      to: opts.clientEmail,
      subject: `Ticket de soporte recibido - ${opts.ticketNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Tu ticket de soporte fue registrado ✅</h2>
          <p>Hola <strong>${opts.clientName}</strong>,</p>
          <p>Recibimos tu consulta y fue registrada exitosamente. Guardá este número de ticket para hacer el seguimiento:</p>
          <div style="background: #eff6ff; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Número de ticket</p>
            <p style="margin: 8px 0 0; font-size: 28px; font-weight: bold; color: #2563eb; letter-spacing: 2px;">${opts.ticketNumber}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Tipo de problema</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${opts.problemType === "hardware" ? "Hardware" : "Software"}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280; vertical-align: top;">Descripción</td><td style="padding: 8px;">${opts.description}</td></tr>
          </table>
          <p>Nuestro equipo revisará tu problema y te contactará a la brevedad. Te notificaremos por email cuando haya actualizaciones.</p>
          <p style="color: #6b7280; font-size: 13px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 16px;">Este es un mensaje automático, por favor no respondas este email directamente.</p>
        </div>
      `,
    });
    logger.info({ ticketNumber: opts.ticketNumber, to: opts.clientEmail }, "Email de confirmación enviado al cliente");
  } catch (err) {
    logger.error({ err }, "Error al enviar email al cliente");
  }
}

export async function sendTicketCreatedToAdmin(opts: {
  clientName: string;
  company: string;
  clientEmail: string;
  phone: string;
  ticketNumber: string;
  problemType: string;
  description: string;
}): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: `"Soporte Técnico" <${getFromEmail()}>`,
      to: ADMIN_EMAIL,
      subject: `🎫 Nuevo ticket: ${opts.ticketNumber} - ${opts.clientName} (${opts.company})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Nuevo ticket de soporte recibido</h2>
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 0 8px 8px 0; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-size: 20px; font-weight: bold; color: #dc2626;">${opts.ticketNumber}</p>
          </div>
          <h3 style="color: #374151;">Datos del cliente</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f9fafb;"><td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600; width: 35%;">Nombre</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${opts.clientName}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Empresa</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${opts.company}</td></tr>
            <tr style="background: #f9fafb;"><td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Email</td><td style="padding: 10px; border: 1px solid #e5e7eb;"><a href="mailto:${opts.clientEmail}">${opts.clientEmail}</a></td></tr>
            <tr><td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Teléfono</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${opts.phone}</td></tr>
            <tr style="background: #f9fafb;"><td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Tipo</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${opts.problemType === "hardware" ? "🖥️ Hardware" : "💻 Software"}</td></tr>
          </table>
          <h3 style="color: #374151;">Descripción del problema</h3>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px;">
            <p style="margin: 0; line-height: 1.6;">${opts.description}</p>
          </div>
        </div>
      `,
    });
    logger.info({ ticketNumber: opts.ticketNumber }, "Email de notificación enviado al admin");
  } catch (err) {
    logger.error({ err }, "Error al enviar email al admin");
  }
}

export async function sendCommentToClient(opts: {
  clientName: string;
  clientEmail: string;
  ticketNumber: string;
  commentContent: string;
}): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: `"Soporte Técnico" <${getFromEmail()}>`,
      to: opts.clientEmail,
      subject: `💬 Actualización de tu ticket ${opts.ticketNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Hay una actualización en tu ticket</h2>
          <p>Hola <strong>${opts.clientName}</strong>,</p>
          <p>El equipo de soporte agregó un mensaje a tu ticket <strong>${opts.ticketNumber}</strong>:</p>
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; line-height: 1.6;">${opts.commentContent}</p>
          </div>
          <p style="color: #6b7280; font-size: 13px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            Ticket: ${opts.ticketNumber}<br>
            Este es un mensaje automático, por favor no respondas este email directamente.
          </p>
        </div>
      `,
    });
    logger.info({ ticketNumber: opts.ticketNumber, to: opts.clientEmail }, "Email de comentario enviado al cliente");
  } catch (err) {
    logger.error({ err }, "Error al enviar email de comentario al cliente");
  }
}
