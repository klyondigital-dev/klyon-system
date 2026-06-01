import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/klyon';

// Middleware
app.use(cors());
app.use(express.json());

// Basic Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Klyon API is running!' });
});

// Import Routes
import automationsRoute from './routes/automations';
import webhooksRoute from './routes/webhooks';
import crmRoute from './routes/crm';
import whatsappRoute from './routes/whatsapp';
import authRoute from './routes/auth';
import appointmentRoutes from './routes/appointments';
import quickRepliesRoutes from './routes/quickReplies';
import notificationsRoutes from './routes/notifications';
import tasksRoutes from './routes/tasks';
import billingRoutes from './routes/billing';
import { engine } from './worker/AutomationEngine';
import { protect } from './middleware/authMiddleware';
import { seedDatabase } from './utils/seed';

// Public Routes
app.use('/api/auth', authRoute);
app.use('/api/webhooks', webhooksRoute); // Webhooks are called by external servers (Meta)
app.use('/api/appointments', appointmentRoutes);
app.use('/api/quick-replies', quickRepliesRoutes);

// Protected Routes (Require JWT)
app.use('/api/automations', protect, automationsRoute);
app.use('/api/crm', protect, crmRoute);
app.use('/api/whatsapp', protect, whatsappRoute);
app.use('/api/notifications', protect, notificationsRoutes);
app.use('/api/tasks', protect, tasksRoutes);
app.use('/api/billing', protect, billingRoutes);

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB local/Remoto');
    await seedDatabase();
    engine.start();
  } catch (err: any) {
    console.log('⚠️ MongoDB falhou na conexão Remota/Local. Erro:', err.message);
    console.log('Iniciando MongoDB em Memória para testes...');
    const mongoServer = await MongoMemoryServer.create();
    MONGODB_URI = mongoServer.getUri();
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB em Memória (Zero-Config)');
    await seedDatabase();
    engine.start();
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
};

connectDB();
