import { Resend } from "resend";
import { logger } from "./logger";

const ADMIN_EMAIL = "matiasagustinpatti123@gmail.com";
const FROM_EMAIL = "onboarding@resend.dev";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn("RESEND_API_KEY not set - emails will not be sent");
    return null;
  }
  return new Resend(apiKey);
}

export async function sendTicketCreatedToClient(opts: {
  clientName: string;
  clientEmail: string;
  ticketNumber: string;
  problemType: string;
  description: string;
}): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.clientEmail,
      subject: `Ticket de soporte recibido - ${opts.ticketNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Tu ticket de soporte fue registrado</h2>
          <p>Hola <strong>${opts.clientName}</strong>,</p>
          <p>Recibimos tu consulta y fue registrada exitosamente. Aquí están los detalles:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Número de ticket:</strong> <span style="color: #2563eb; font-size: 18px;">${opts.ticketNumber}</span></p>
            <p><strong>Tipo de problema:</strong> ${opts.problemType === "hardware" ? "Hardware" : "Software"}</p>
            <p><strong>Descripción:</strong> ${opts.description}</p>
          </div>
          <p>Podés hacer seguimiento de tu ticket usando el número <strong>${opts.ticketNumber}</strong>. Te notificaremos cuando haya actualizaciones.</p>
          <p style="color: #6b7280; font-size: 14px;">Gracias por contactarnos.</p>
        </div>
      `,
    });
    logger.info({ ticketNumber: opts.ticketNumber, to: opts.clientEmail }, "Client notification email sent");
  } catch (err) {
    logger.error({ err }, "Failed to send client email");
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
  const resend = getResendClient();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Nuevo ticket: ${opts.ticketNumber} - ${opts.clientName} (${opts.company})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Nuevo ticket de soporte recibido</h2>
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0;">
            <p><strong>Ticket:</strong> ${opts.ticketNumber}</p>
          </div>
          <h3>Datos del cliente</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Nombre:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${opts.clientName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Empresa:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${opts.company}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${opts.clientEmail}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Teléfono:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${opts.phone}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Tipo:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${opts.problemType === "hardware" ? "Hardware" : "Software"}</td></tr>
          </table>
          <h3>Descripción del problema</h3>
          <p style="background: #f9fafb; padding: 12px; border-radius: 6px;">${opts.description}</p>
        </div>
      `,
    });
    logger.info({ ticketNumber: opts.ticketNumber }, "Admin notification email sent");
  } catch (err) {
    logger.error({ err }, "Failed to send admin email");
  }
}

export async function sendCommentToClient(opts: {
  clientName: string;
  clientEmail: string;
  ticketNumber: string;
  commentContent: string;
}): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.clientEmail,
      subject: `Actualización de tu ticket ${opts.ticketNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Hay una actualización en tu ticket</h2>
          <p>Hola <strong>${opts.clientName}</strong>,</p>
          <p>El equipo de soporte agregó un mensaje a tu ticket <strong>${opts.ticketNumber}</strong>:</p>
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
            <p>${opts.commentContent}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Ticket: ${opts.ticketNumber}</p>
        </div>
      `,
    });
    logger.info({ ticketNumber: opts.ticketNumber, to: opts.clientEmail }, "Comment notification email sent to client");
  } catch (err) {
    logger.error({ err }, "Failed to send comment email");
  }
}
