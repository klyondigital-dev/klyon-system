import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

// O segredo do JWT idealmente deve vir do .env
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_klyon_key_2026';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Procurar o usuário pelo email
    const user = await User.findOne({ email });
    if (!user) {
      // Usando uma mensagem genérica por segurança
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // 2. Verificar se a senha confere com o hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // 3. Gerar o JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email, clientId: user.clientId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Retornar token e infos do usuário
    res.json({
      token,
      user
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// GET /api/auth/me - Rota para validar o token no frontend e retornar o usuário atual
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
});

export default router;
