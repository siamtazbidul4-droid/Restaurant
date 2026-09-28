export interface SendEmailPayload {
  to: string;
  from?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  notConfigured?: boolean;
  error?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export class EmailService {
  /**
   * Retrieves the server-side configured administrator recipient email.
   * NEVER trust client input for this value.
   */
  static getAdminRecipientEmail(): string {
    // Recipient for contact-form notifications is deliberately separate from
    // the admin *authentication* identity (ADMIN_AUTH_EMAIL / ADMIN_EMAIL):
    // 1. CONTACT_NOTIFICATION_EMAIL — real inbox that receives guest inquiries.
    // 2. ADMIN_EMAIL — legacy fallback; keep ONLY if it is a real inbox.
    const recipient =
      process.env.CONTACT_NOTIFICATION_EMAIL ||
      process.env.ADMIN_EMAIL ||
      'concierge@aurelia-dining.com';
    return recipient.trim().toLowerCase();
  }

  /**
   * Dispatches a transactional email using the server-configured email provider HTTP API.
   */
  static async sendEmail(payload: SendEmailPayload): Promise<EmailDeliveryResult> {
    const apiKey = process.env.EMAIL_API_KEY;
    const defaultFrom = process.env.EMAIL_FROM || 'Aurelia Concierge <concierge@aurelia-dining.com>';

    if (!apiKey) {
      console.warn(
        '[EmailService] EMAIL_API_KEY is not configured in server environment. Email dispatch skipped.'
      );
      return {
        success: false,
        notConfigured: true,
        error: 'Email service credentials (EMAIL_API_KEY) not configured in server environment.',
      };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: payload.from || defaultFrom,
          to: [payload.to],
          reply_to: payload.replyTo,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { message?: string; name?: string; id?: string };

      if (!response.ok) {
        // Safe diagnostic logging: provider, HTTP status, and error code — never secrets.
        console.error(`[EmailService] Provider request failed: ${response.status} ${data?.name || 'unknown_error'}`);
        if (data?.message) {
          console.error(`[EmailService] Provider message: ${data.message}`);
        }
        return {
          success: false,
          error: data?.message || `Email provider error status ${response.status}`,
        };
      }

      console.log(`[EmailService] Email successfully dispatched to ${payload.to}. ID: ${data?.id}`);
      return {
        success: true,
        messageId: data?.id,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown network error during email dispatch.';
      console.error(`[EmailService] Network exception during email dispatch: ${message}`);
      return { success: false, error: message };
    }
  }

  /**
   * Sends structured contact form notification to the administrator.
   */
  static async sendContactNotification(contact: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    submittedAt?: Date;
    ipAddress?: string;
  }): Promise<EmailDeliveryResult> {
    const recipient = this.getAdminRecipientEmail();
    const safeName = escapeHtml(contact.name);
    const safeEmail = escapeHtml(contact.email);
    const safePhone = escapeHtml(contact.phone || 'None provided');
    const safeSubject = escapeHtml(contact.subject);
    const safeMessage = escapeHtml(contact.message).replace(/\n/g, '<br/>');
    const submittedTime = (contact.submittedAt || new Date()).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      dateStyle: 'full',
      timeStyle: 'long',
    });

    const emailSubject = `[Aurelia Concierge] Inbound Inquiry: ${contact.subject}`;

    const textContent = `
NEW GUEST CONCIERGE INQUIRY — AURELIA

Guest Name: ${contact.name}
Email Address: ${contact.email}
Phone: ${contact.phone || 'None provided'}
Subject: ${contact.subject}
Received: ${submittedTime}
${contact.ipAddress ? `Client IP: ${contact.ipAddress}\n` : ''}
--- Message ---
${contact.message}
----------------
This is an automated notification dispatched from the Aurelia Guest Relations engine.
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0D0D0E; color: #F6F4EE; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background-color: #141419; border: 1px solid #C5A880; padding: 32px; }
    .header { border-bottom: 1px solid rgba(197, 168, 128, 0.3); padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: 300; letter-spacing: 0.25em; text-transform: uppercase; color: #FFFFFF; margin: 0; }
    .kicker { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #C5A880; margin-top: 4px; }
    .field { margin-bottom: 14px; font-size: 13px; }
    .label { color: #A09E96; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; margin-bottom: 3px; }
    .value { color: #FFFFFF; font-size: 14px; }
    .message-box { background-color: #1B1B22; border-left: 2px solid #C5A880; padding: 16px; margin-top: 20px; font-size: 13px; line-height: 1.6; color: #E8E5DD; }
    .footer { margin-top: 32px; pt: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 11px; color: #888880; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="brand">AURELIA</h1>
      <p class="kicker">Guest Relations & Concierge Transmission</p>
    </div>

    <div class="field">
      <div class="label">Patron Name</div>
      <div class="value">${safeName}</div>
    </div>

    <div class="field">
      <div class="label">Email Address</div>
      <div class="value"><a href="mailto:${safeEmail}" style="color: #C5A880; text-decoration: none;">${safeEmail}</a></div>
    </div>

    <div class="field">
      <div class="label">Telephone Contact</div>
      <div class="value">${safePhone}</div>
    </div>

    <div class="field">
      <div class="label">Inquiry Subject</div>
      <div class="value">${safeSubject}</div>
    </div>

    <div class="field">
      <div class="label">Timestamp (EST)</div>
      <div class="value">${submittedTime}</div>
    </div>

    <div class="message-box">
      <div class="label" style="margin-bottom: 8px;">Inquiry Transmission</div>
      ${safeMessage}
    </div>

    <div class="footer">
      Dispatched securely from Aurelia Dining Platform. Reply directly to this email to contact the patron.
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: recipient,
      replyTo: contact.email,
      subject: emailSubject,
      html: htmlContent,
      text: textContent,
    });
  }
}
