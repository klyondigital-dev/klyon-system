const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: 'test', role: 'admin' },
  process.env.JWT_SECRET || 'klyon_super_secret_key_2026',
  { expiresIn: '1h' }
);

async function run() {
  try {
    // 1. Get clients
    const clientsRes = await fetch('http://localhost:3000/api/crm/clients', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const clients = await clientsRes.json();
    if (!clients || clients.length === 0) {
      console.log('No clients found. Test aborted.');
      return;
    }
    const clientId = clients[0].id;

    // 2. Create Webhook Link
    const createRes = await fetch('http://localhost:3000/api/webhooks/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: 'Elementor Form Imóveis', clientId, source: 'Elementor' })
    });
    const newLink = await createRes.json();
    console.log('Webhook Created:', newLink);

    // 3. Fire a Payload to the custom URL
    const payload = {
      fields: [
        { id: 'nome', value: 'João Silva Elementor' },
        { id: 'email', value: 'joao.elementor@test.com' },
        { id: 'telefone', value: '11988887777' }
      ]
    };

    const fireRes = await fetch(`http://localhost:3000/api/webhooks/custom/${newLink.urlId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const fireData = await fireRes.json();
    console.log('Webhook Post Response:', fireData);

  } catch (err) {
    console.error('Test error:', err);
  }
}

run();
