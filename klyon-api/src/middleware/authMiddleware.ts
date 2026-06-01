import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_klyon_key_2026';

// Estendendo o tipo Request do Express para comportar os dados do usuário
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  // Pegar o token do header Authorization: Bearer <token>
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Se não tem token, bloqueia a requisição
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // Decodificar e validar o token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Injetar os dados do usuário decodificados (userId, role) dentro do Request
    req.user = decoded;
    
    // Passar para a rota
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Acesso negado. Token inválido ou expirado.' });
  }
};
