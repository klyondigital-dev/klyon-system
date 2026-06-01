import crypto from 'crypto';

// Helper para fazer o Hash SHA-256 de um dado do usuário
const hashData = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const normalized = value.toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
};

const cleanPhone = (phone: string | undefined): string | undefined => {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
};

export async function sendMetaConversionEvent(
  eventName: 'Purchase' | 'Lead' | 'QualifyLead', 
  userData: { email?: string, phone?: string, clientIp?: string, clientUserAgent?: string },
  customData: { value?: number, currency?: string } = {}
) {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const pixelId = process.env.META_PIXEL_ID;
  const testEventCode = process.env.META_TEST_EVENT_CODE;

  if (!accessToken || !pixelId) {
    console.log(`⚠️ [Meta CAPI] Evento '${eventName}' cancelado: Tokens não configurados no .env`);
    return;
  }

  const payload: any = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "system_generated",
        user_data: {
          client_ip_address: userData.clientIp || '127.0.0.1',
          client_user_agent: userData.clientUserAgent || 'Klyon Server',
        },
        custom_data: Object.keys(customData).length > 0 ? customData : undefined
      }
    ]
  };

  if (userData.email) payload.data[0].user_data.em = [hashData(userData.email)];
  if (userData.phone) payload.data[0].user_data.ph = [hashData(cleanPhone(userData.phone))];
  
  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
    
    // Como a versão mínima do Node exigida pelo Klyon tem Fetch, não precisamos de 'node-fetch'
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`❌ [Meta CAPI] Erro ao enviar o evento ${eventName}:`, responseData.error?.message || responseData);
    } else {
      console.log(`✅ [Meta CAPI] Evento de ${eventName} enviado com sucesso! (${responseData.events_received} recebido)`);
    }
  } catch (err) {
    console.error(`❌ [Meta CAPI] Falha HTTP ao enviar o evento ${eventName}:`, err);
  }
}
