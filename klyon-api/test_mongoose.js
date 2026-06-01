const mongoose = require('mongoose');

// We don't have the in-memory db uri, but we can start a new one to test the query
const { MongoMemoryServer } = require('mongodb-memory-server');

const TransactionSchema = new mongoose.Schema({
  date: { type: String, required: true },
}, { timestamps: true });

const Transaction = mongoose.model('TestTransaction', TransactionSchema);

async function run() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  await Transaction.create({ date: '2026-05-19' });
  
  try {
    const res = await Transaction.find({}).sort({ date: -1, createdAt: -1 });
    console.log('Query success:', res);
  } catch (err) {
    console.error('Query error:', err);
  }
  
  await mongoose.disconnect();
  await mongoServer.stop();
}

run();
