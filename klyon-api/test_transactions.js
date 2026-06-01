const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: 'test', role: 'admin' },
  process.env.JWT_SECRET || 'klyon_super_secret_key_2026',
  { expiresIn: '1h' }
);

fetch('http://localhost:3000/api/crm/transactions', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.text())
.then(text => console.log('Response:', text))
.catch(err => console.error('Fetch Error:', err));
