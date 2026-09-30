const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloodbank';
  
  try {
    // Attempt standard connection with 3 second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully to external instance: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to standard URI (${uri}): ${err.message}`);
    console.log('[MongoDB] Starting embedded high-performance MongoDB instance (MongoMemoryServer)...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'bloodbank'
        }
      });
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected successfully to embedded instance: ${memoryUri}`);
    } catch (memErr) {
      console.error('[MongoDB] Fatal error initializing database:', memErr.message);
      process.exit(1);
    }
  }

  mongoose.connection.on('disconnected', () => {
    console.log('[MongoDB] Disconnected');
  });
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, closeDB };
