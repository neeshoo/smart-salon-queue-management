const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  // If SMTP is not configured or in dev, log gracefully without throwing
  if (!process.env.SMTP_USER || !process.env.SMTP_HOST) {
    console.log(`[Email Simulation] To: ${to} | Subject: "${subject}"`);
    console.log(`[Email Simulation Body]: ${text || html?.replace(/<[^>]+>/g, '')}`);
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `${process.env.FROM_NAME || 'Smart Salon'} <${process.env.FROM_EMAIL || 'noreply@smartsalon.com'}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`[Email Sent] Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Error] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

const sendLeaveNowAlert = async (booking, salonName, waitMinutes) => {
  if (!booking.customerEmail) return;

  const subject = `🚗 TIME TO LEAVE! Your turn at ${salonName} is coming up soon!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Smart Salon "Leave Now" Alert</h2>
      <p>Hello <strong>${booking.customerName}</strong>,</p>
      <p>Based on your estimated travel time of <strong>${booking.travelTimeMinutes} minutes</strong>, it is time to leave for <strong>${salonName}</strong> now!</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Token:</strong> ${booking.tokenFormatted}</p>
        <p style="margin: 5px 0 0;"><strong>Current Estimated Wait:</strong> ~${waitMinutes} minutes</p>
      </div>
      <p>Arriving now will ensure you are served right on time with ZERO waiting in the salon!</p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Smart Salon Queue Management System</p>
    </div>
  `;

  return await sendEmail({
    to: booking.customerEmail,
    subject,
    html,
    text: `Time to leave! Your token ${booking.tokenFormatted} at ${salonName} has ~${waitMinutes} minutes wait remaining.`,
  });
};

module.exports = { sendEmail, sendLeaveNowAlert };
