const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
const smtpPort = process.env.SMTP_PORT || process.env.EMAIL_PORT || '587';
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const smtpFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"DevMesh Platform" <noreply@devmesh.com>';

const useSmtp = !!(smtpUser && smtpPass);

let transporter;

if (useSmtp) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: smtpPort === '465',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: smtpFrom,
    to,
    subject,
    text,
    html,
  };

  if (useSmtp) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent to: ${to}`);
    } catch (err) {
      console.error(`Failed to send email to ${to}:`, err.message);
      throw new Error(`Email delivery failed: ${err.message}`);
    }
  } else {
    console.log('=============== SMTP Simulation ===============');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${text}`);
    console.log('================================================');
  }
};

const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
  const subject = 'Verify your DevMesh Email Address';
  const text = `Hi ${user.name},\n\nWelcome to DevMesh! Please verify your email by clicking the following link:\n${url}\n\nThis link will expire in 24 hours.`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Hi ${user.name},</h2>
      <p>Welcome to DevMesh — "Connect. Collaborate. Create."</p>
      <p>Please click the button below to verify your email address. This verification link will expire in 24 hours.</p>
      <div style="margin: 24px 0;">
        <a href="${url}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p>If you did not request this, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">DevMesh Dev Team</p>
    </div>
  `;
  await sendEmail({ to: user.email, subject, text, html });
};

const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
  const subject = 'Reset your DevMesh Password';
  const text = `Hi ${user.name},\n\nYou requested a password reset. Please click the following link to reset your password:\n${url}\n\nThis link will expire in 15 minutes.`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Hi ${user.name},</h2>
      <p>We received a request to reset your password for your DevMesh account.</p>
      <p>Click the button below to reset your password. This reset link will expire in 15 minutes.</p>
      <div style="margin: 24px 0;">
        <a href="${url}" style="background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">DevMesh Dev Team</p>
    </div>
  `;
  await sendEmail({ to: user.email, subject, text, html });
};

const sendTeamInvitationEmail = async (user, inviterName, projectName, inviteLink) => {
  const subject = `You are invited to join the project "${projectName}" on DevMesh!`;
  const text = `Hi ${user.name},\n\n${inviterName} has invited you to collaborate on the project "${projectName}".\nView your invitations here: ${inviteLink}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Hi ${user.name},</h2>
      <p>Great news! <strong>${inviterName}</strong> has invited you to join the team for the project <strong>${projectName}</strong> on DevMesh.</p>
      <p>Click the button below to view your notifications page and accept or reject the invitation.</p>
      <div style="margin: 24px 0;">
        <a href="${inviteLink}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Invitation</a>
      </div>
      <p>Let's collaborate and create something great together!</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">DevMesh Team Collaboration Engine</p>
    </div>
  `;
  await sendEmail({ to: user.email, subject, text, html });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendTeamInvitationEmail,
};
