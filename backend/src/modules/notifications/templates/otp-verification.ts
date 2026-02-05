export function renderOtpEmail(params: {
  otp: string;
  expiresInMinutes: number;
  shopName?: string | null;
}) {
  const { otp, expiresInMinutes, shopName } = params;
  const title = shopName ? `${shopName} Login Code` : 'Beautivo Login Code';
  const subject = `Your verification code is ${otp}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>${title}</h2>
      <p>Use the code below to complete your login. It expires in ${expiresInMinutes} minutes.</p>
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 16px 0;">${otp}</div>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  const text = `Your verification code is ${otp}. It expires in ${expiresInMinutes} minutes.`;

  return { subject, html, text };
}
