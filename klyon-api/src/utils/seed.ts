import mongoose from 'mongoose';
import Lead from '../models/Lead';
import Campaign from '../models/Campaign';
import Client from '../models/Client';
import Transaction from '../models/Transaction';
import User from '../models/User';
import Chat from '../models/Chat';
import Message from '../models/Message';
import bcrypt from 'bcryptjs';
import { initialLeads, initialCampaigns, initialClients, initialTransactions } from './mockData';

export const seedDatabase = async () => {
  try {
    const clientsCount = await Client.countDocuments();
    if (clientsCount === 0) {
      console.log('🔄 Banco de dados vazio. Iniciando seed de dados...');
      
      // Clean up existing ids (from mockData string to mongo ObjectIds if necessary, but we defined our own ids)
      // Mongoose will generate _id automatically, but our mockData has 'id' fields. 
      // The schemas don't strictly require _id to be specific, except our routes return 'id' via the virtual transform.
      // If we insert the mock objects as they are, Mongoose might ignore 'id' and create its own '_id'. This is fine,
      // but it will break the relations in mockData (e.g., clientId: 'cli1').
      // To fix this, we will insert them exactly, and we might need to map them or just use the _id from Mongo.
      // Wait, since we are doing a quick seed, we can just insert them. Mongoose will generate _id. The clientId from frontend is just a string.
      // If we need the EXACT string IDs from mockData, we can set _id to be a string in Schema, but it's an ObjectId by default.
      // For testing, let's just insert them. If references break, we can fix them. But in our mockData, clientId is 'cli1', etc.
      // Let's actually override the `_id` with a valid ObjectId OR just let it be strings. Wait, if _id is ObjectId, we can't use 'cli1'.
      // In MongoDB, _id can be any type. Let's just pass `_id: item.id` to ensure relations match.

      const idMap = new Map<string, string>();
      const mapId = (oldId: string) => {
        if (!oldId) return undefined;
        if (!idMap.has(oldId)) {
          idMap.set(oldId, new mongoose.Types.ObjectId().toString());
        }
        return idMap.get(oldId);
      };

      const insertWithId = async (Model: any, data: any[]) => {
        const toInsert = data.map(item => {
          const { id, clientId, ...rest } = item;
          const mappedObj: any = { _id: mapId(id), ...rest };
          if (clientId) mappedObj.clientId = mapId(clientId);
          return mappedObj;
        });
        await Model.insertMany(toInsert);
      };

      await insertWithId(Client, initialClients);
      await insertWithId(Lead, initialLeads);
      await insertWithId(Campaign, initialCampaigns);
      await insertWithId(Transaction, initialTransactions);

      // Seed Chats and Messages for Inbox
      const testPhone1 = '5511999999999';
      const testPhone2 = '5511988888888';
      
      await Chat.create([
        { phoneNumber: testPhone1, name: 'João Silva (Lead Quente)', unreadCount: 1, lastMessage: 'Olá! Gostaria de saber mais sobre o sistema de gestão.', lastActivity: new Date() },
        { phoneNumber: testPhone2, name: 'Maria Souza', unreadCount: 0, lastMessage: 'Tudo bem, aguardo o envio do orçamento.', lastActivity: new Date(Date.now() - 3600000) }
      ]);

      await Message.create([
        { chatId: testPhone1, body: 'Bom dia! Vi o anúncio de vocês no Instagram.', fromMe: false, timestamp: Date.now() - 50000, type: 'text' },
        { chatId: testPhone1, body: 'Olá João! Que bom ter você por aqui. Como posso ajudar com sua gestão hoje?', fromMe: true, timestamp: Date.now() - 40000, type: 'text' },
        { chatId: testPhone1, body: 'Olá! Gostaria de saber mais sobre o sistema de gestão.', fromMe: false, timestamp: Date.now() - 30000, type: 'text' },
        { chatId: testPhone2, body: 'Gostaria de um orçamento para criação de Landing Page.', fromMe: false, timestamp: Date.now() - 100000, type: 'text' },
        { chatId: testPhone2, body: 'Claro, Maria! Vou montar uma proposta baseada no nosso plano Profissional.', fromMe: true, timestamp: Date.now() - 90000, type: 'text' },
        { chatId: testPhone2, body: 'Tudo bem, aguardo o envio do orçamento.', fromMe: false, timestamp: Date.now() - 3600000, type: 'text' }
      ]);

      // Create Default Admin User
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const hashedClientPassword = await bcrypt.hash('cliente123', salt);
      
      await User.create({
        name: 'Administrador',
        email: 'admin',
        passwordHash: hashedPassword,
        role: 'admin'
      });

      // Create Default Client User
      await User.create({
        name: 'Felipe Albuquerque',
        email: 'felipe@agroforte.com.br',
        passwordHash: hashedClientPassword,
        role: 'client',
        clientId: mapId('cli1')
      });

      console.log('✅ Seed finalizado com sucesso! (Usuários Admin e Cliente criados)');
    }
  } catch (error) {
    console.error('❌ Erro no seed:', error);
  }
};
