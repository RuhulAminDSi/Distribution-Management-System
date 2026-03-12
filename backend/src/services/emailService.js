import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendPasswordResetEmail = async (email, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'DMS <noreply@dms.com>',
    to: email,
    subject: 'Password Reset - DMS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your DMS account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; background: #1976D2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
        <p>Or copy and paste this link: ${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { 
      success: false, 
      error: error.message,
      resetLink // Return link as fallback
    };
  }
};
