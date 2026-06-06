const API_BASE = 'https://graph.facebook.com/v22.0';

const isConfigured = () => {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  return token && phoneId && token !== 'your-whatsapp-token' && phoneId !== 'your-phone-id';
};

export const sendOtp = async (to, otp) => {
  if (!isConfigured() || process.env.NODE_ENV === 'development') {
    return { success: false, devOtp: otp };
  }

  const url = `${API_BASE}/${process.env.WHATSAPP_PHONE_ID}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.startsWith('88') ? to : `88${to}`,
        type: 'text',
        text: { body: `Your DMS password reset OTP is: ${otp}. It expires in 1 minute.` },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[WhatsApp] Send failed:', err);
      return { success: false, error: err };
    }

    return { success: true };
  } catch (error) {
    console.error('[WhatsApp] Error:', error);
    return { success: false, error: error.message };
  }
};
