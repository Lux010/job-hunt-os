import mongoose from 'mongoose';

let memoryMongo = null;

async function connectMemory() {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryMongo = await MongoMemoryServer.create();
  const uri = memoryMongo.getUri('jobhuntos');
  await mongoose.connect(uri);
  console.log('[db] connected to in-memory MongoDB (ephemeral)');
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('[db] connected to MongoDB');
    } catch (err) {
      console.warn('[db] MONGODB_URI unreachable, falling back to in-memory MongoDB.');
      console.warn('     ' + err.message);
      await connectMemory();
    }
  } else {
    await connectMemory();
  }
  return mongoose.connection;
}

export async function closeDB() {
  await mongoose.disconnect();
  if (memoryMongo) await memoryMongo.stop();
}
