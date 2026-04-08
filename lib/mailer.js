import nodemailer from "nodemailer";

// Reuse transporter across requests (singleton)
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

/**
 * Send the branded EduShare verification email.
 */
export async function sendVerificationEmail({ to, name, token }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verify your EduShare account</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:16px;border:1px solid #e8e5df;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid #f0ede8;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <div style="width:32px;height:32px;background:#18181b;border-radius:8px;display:flex;align-items:center;justify-content:center;">
                        <span style="color:white;font-size:16px;line-height:1;">✦</span>
                      </div>
                      <span style="font-size:16px;font-weight:700;color:#18181b;letter-spacing:-0.02em;">EduShare</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">

              <!-- Icon -->
              <div style="width:56px;height:56px;background:#f0ede8;border-radius:14px;margin-bottom:24px;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:24px;">✉️</span>
              </div>

              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;letter-spacing:-0.03em;">
                Verify your email
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6b6760;line-height:1.6;">
                Hey ${name || "there"}, click the button below to verify your email address and activate your EduShare account.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="border-radius:10px;background:#18181b;">
                    <a href="${verifyUrl}"
                      style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;letter-spacing:-0.01em;border-radius:10px;">
                      Verify email address →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0 0 8px;font-size:13px;color:#a8a49c;">
                Or copy this link into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:12px;color:#6d56f5;word-break:break-all;">
                ${verifyUrl}
              </p>

              <!-- Divider -->
              <div style="height:1px;background:#f0ede8;margin-bottom:24px;"></div>

              <p style="margin:0;font-size:12px;color:#a8a49c;line-height:1.6;">
                This link expires in <strong>24 hours</strong>. If you didn't create an EduShare account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#fafaf9;border-top:1px solid #f0ede8;">
              <p style="margin:0;font-size:12px;color:#a8a49c;">
                © ${new Date().getFullYear()} EduShare · Peer Knowledge Exchange Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || "EduShare <noreply@edushare.com>",
    to,
    subject: "Verify your EduShare account",
    html,
    text: `Hey ${name || "there"},\n\nVerify your EduShare account by visiting:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
  });
}
