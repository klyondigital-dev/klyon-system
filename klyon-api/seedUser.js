const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const MONGODB_URI = 'mongodb+srv://klyondigital_db_user:A3o1wYKrRfU3Orce@klyon.g6qdf0p.mongodb.net/klyondb?appName=klyon';

// Schema básico para não depender do código TS
const userSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4 },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB Atlas!');

    // Verifica se já existe
    let admin = await User.findOne({ email: 'admin@klyon.com.br' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('klyon2026', salt);

      admin = new User({
        name: 'Administrador Klyon',
        email: 'admin@klyon.com.br',
        passwordHash,
        role: 'admin'
      });

      await admin.save();
      console.log('Usuário admin criado com sucesso!');
    } else {
      console.log('Usuário admin já existe!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

seed();
